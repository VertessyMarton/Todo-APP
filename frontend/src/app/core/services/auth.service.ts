import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

type RegisterPaylaod = {
  email: string;
  password: string;
  confirmPassword: string;
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
}
