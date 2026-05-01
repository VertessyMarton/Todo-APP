import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(private auth: AuthService) {}
  username = '';
  password = '';
  confirmPassword = '';
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    this.auth
      .register({
        username: this.username,
        password: this.password,
        confirmPassword: this.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Account created successfully. You can now sign in.';
          this.isSubmitting = false;
        },
        error: () => {
          this.errorMessage = 'Registration failed. Please try again.';
          this.isSubmitting = false;
        },
      });
  }
}
