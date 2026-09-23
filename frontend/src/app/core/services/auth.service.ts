import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  catchError,
  defer,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { API_URL } from '../api-url';

type RegisterPaylaod = {
  username: string;
  password: string;
  confirmPassword: string;
};

type LoginPaylaod = {
  username: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = API_URL;

  private refreshRequest?: Observable<string>;
  private signingOut = false;

  constructor(private http: HttpClient) {}

  register(payload: RegisterPaylaod) {
    return this.http.post(`${this.apiUrl}/auth/register`, payload);
  }

  login(payload: LoginPaylaod) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload, {
      withCredentials: true,
    });
  }

  saveToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  clearToken() {
    localStorage.removeItem('accessToken');
  }

  refreshAccessToken(): Observable<string> {
    if (this.signingOut) return throwError(() => new Error('Sign-out in progress'));
    if (!this.refreshRequest) {
      this.refreshRequest = this.http
        .post<LoginResponse>(
          `${this.apiUrl}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        )
        .pipe(
          map((response) => response.accessToken),
          tap((token) => this.saveToken(token)),
          finalize(() => {
            this.refreshRequest = undefined;
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.refreshRequest;
  }

  logout(allDevices = false) {
    return defer(() => {
      this.signingOut = true;
      // Let an already-running refresh finish before sending its replacement cookie to logout.
      const ready: Observable<string | null> = this.refreshRequest ?? of(null);
      return ready.pipe(
        catchError(() => of(null)),
        switchMap(() =>
          this.http.post<{ message: string }>(
            `${this.apiUrl}/auth/logout${allDevices ? '/all' : ''}`,
            {},
            { withCredentials: true },
          ),
        ),
        tap(() => this.clearToken()),
        finalize(() => {
          this.signingOut = false;
        }),
      );
    });
  }
}
