import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { email } from '@angular/forms/signals';
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

  onSubmit() {
    this.auth
      .register({
        username: this.username,
        password: this.password,
        confirmPassword: this.confirmPassword,
      })
      .subscribe({
        next: (res) => console.log(res),
        error: (err) => console.error(err),
      });
  }
}
