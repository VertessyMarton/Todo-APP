import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { authInterceptor } from '../interceptors/auth-interceptor';
import { API_URL } from '../api-url';

describe('Authentication HTTP flow', () => {
  let auth: AuthService;
  let client: HttpClient;
  let http: HttpTestingController;
  const navigate = vi.fn().mockResolvedValue(true);
  const fail = { status: 401, statusText: 'Unauthorized' };

  beforeEach(() => {
    localStorage.clear();
    navigate.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate } },
      ],
    });
    auth = TestBed.inject(AuthService);
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    auth.saveToken('old');
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('sends credentials on login and does not refresh rejected login', () => {
    auth.login({ username: 'user', password: 'password' }).subscribe({ error: () => {} });
    const login = http.expectOne(`${API_URL}/auth/login`);
    expect(login.request.withCredentials).toBe(true);
    expect(login.request.headers.has('Authorization')).toBe(false);
    login.flush({}, fail);
    http.expectNone(`${API_URL}/auth/refresh`);
  });

  it('shares a refresh and retries concurrent requests with the replacement token', () => {
    client.get(`${API_URL}/todos`).subscribe();
    client.get(`${API_URL}/lists`).subscribe();
    http.expectOne(`${API_URL}/todos`).flush({}, fail);
    http.expectOne(`${API_URL}/lists`).flush({}, fail);
    const refresh = http.expectOne(`${API_URL}/auth/refresh`);
    expect(refresh.request.withCredentials).toBe(true);
    expect(refresh.request.method).toBe('POST');
    refresh.flush({ accessToken: 'new' });
    for (const path of ['todos', 'lists']) {
      const retry = http.expectOne(`${API_URL}/${path}`);
      expect(retry.request.headers.get('Authorization')).toBe('Bearer new');
      retry.flush({});
    }
    expect(auth.getToken()).toBe('new');
  });

  it('uses the already-refreshed token for a late old-token failure', () => {
    client.get(`${API_URL}/todos`).subscribe();
    client.get(`${API_URL}/lists`).subscribe();
    const late = http.expectOne(`${API_URL}/lists`);
    http.expectOne(`${API_URL}/todos`).flush({}, fail);
    http.expectOne(`${API_URL}/auth/refresh`).flush({ accessToken: 'new' });
    http.expectOne(`${API_URL}/todos`).flush({});
    late.flush({}, fail);
    const retry = http.expectOne(`${API_URL}/lists`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new');
    retry.flush({});
  });

  it('clears authentication when refresh is rejected', () => {
    client.get(`${API_URL}/todos`).subscribe({ error: () => {} });
    http.expectOne(`${API_URL}/todos`).flush({}, fail);
    http.expectOne(`${API_URL}/auth/refresh`).flush({}, fail);
    expect(auth.getToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not loop if the retried request is unauthorized', () => {
    client.get(`${API_URL}/todos`).subscribe({ error: () => {} });
    http.expectOne(`${API_URL}/todos`).flush({}, fail);
    http.expectOne(`${API_URL}/auth/refresh`).flush({ accessToken: 'new' });
    http.expectOne(`${API_URL}/todos`).flush({}, fail);
    http.expectNone(`${API_URL}/auth/refresh`);
    expect(auth.getToken()).toBeNull();
  });

  it('preserves login on a temporary refresh failure', () => {
    client.get(`${API_URL}/todos`).subscribe({ error: () => {} });
    http.expectOne(`${API_URL}/todos`).flush({}, fail);
    http.expectOne(`${API_URL}/auth/refresh`).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(auth.getToken()).toBe('old');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not attach credentials or refresh for other origins', () => {
    client.get(`${API_URL}.example.org/data`).subscribe({ error: () => {} });
    const other = http.expectOne(`${API_URL}.example.org/data`);
    expect(other.request.headers.has('Authorization')).toBe(false);
    other.flush({}, fail);
  });

  for (const all of [false, true]) {
    it(`revokes ${all ? 'all sessions' : 'the current session'} before clearing local authentication`, () => {
      auth.logout(all).subscribe();
      const logout = http.expectOne(`${API_URL}/auth/logout${all ? '/all' : ''}`);
      expect(logout.request.method).toBe('POST');
      expect(logout.request.withCredentials).toBe(true);
      expect(auth.getToken()).toBe('old');
      logout.flush({ message: 'Signed out' });
      expect(auth.getToken()).toBeNull();
    });
  }

  it('waits for pending rotation before logout', () => {
    auth.refreshAccessToken().subscribe();
    const refresh = http.expectOne(`${API_URL}/auth/refresh`);
    auth.logout().subscribe();
    http.expectNone(`${API_URL}/auth/logout`);
    refresh.flush({ accessToken: 'new' });
    http.expectOne(`${API_URL}/auth/logout`).flush({ message: 'Signed out' });
    expect(auth.getToken()).toBeNull();
  });

  it('does not claim logout succeeded when the backend fails', () => {
    auth.logout(true).subscribe({ error: () => {} });
    http.expectOne(`${API_URL}/auth/logout/all`).flush({}, { status: 500, statusText: 'Error' });
    expect(auth.getToken()).toBe('old');
  });
});
