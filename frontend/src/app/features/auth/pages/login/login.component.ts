import { Component, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

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
  successMessage = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);

  onSignIn() {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.auth
      .login({
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Logged in successfully.');
          this.isSubmitting.set(false);
        },
        error: () => {
          this.errorMessage.set('Login failed. Please try again.');
          this.isSubmitting.set(false);
        },
      });
  }
}
