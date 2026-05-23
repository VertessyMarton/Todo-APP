import { Component, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}
  username = '';
  password = '';
  confirmPassword = '';
  errorMessage = signal('');
  isSubmitting = signal(false);

  onSubmit() {
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
          this.isSubmitting.set(false);
          this.router.navigate(['/login'], {
            state: { message: 'Account created successfully. You can now sign in.' },
          });
        },
        error: () => {
          this.errorMessage.set('Registration failed. Please try again.');
          this.isSubmitting.set(false);
        },
      });
  }
}
