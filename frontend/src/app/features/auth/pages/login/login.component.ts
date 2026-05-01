import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(private auth: AuthService) {}
  username = '';
  password = '';
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  onSignIn() {
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    this.auth
      .login({
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Logged in successfully.';
          this.isSubmitting = false;
        },
        error: () => {
          this.errorMessage = 'Login failed. Please try again.';
          this.isSubmitting = false;
        },
      });
  }
}
