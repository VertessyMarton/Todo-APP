import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
  private readonly apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  register(payload: RegisterPaylaod) {
    return this.http.post(`${this.apiUrl}/auth/register`, payload);
  }

  login(payload: LoginPaylaod) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload);
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
}
