import { Component, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

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
  successMessage = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);

  onSubmit() {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.auth
      .register({
        username: this.username,
        password: this.password,
        confirmPassword: this.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Account created successfully. You can now sign in.');
          this.isSubmitting.set(false);
        },
        error: () => {
          this.errorMessage.set('Registration failed. Please try again.');
          this.isSubmitting.set(false);
        },
      });
  }
}
