import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ValidationService } from '../../services/validation.service';




@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
username = '';
password = '';
confirmPassword = '';
errorMessage = '';

constructor(private authService: AuthService, private router: Router, private http: HttpClient, private validationService: ValidationService) {}

onRegister(): void {
  const { username, password, confirmPassword } = this;


if (this.validationService.checkInvalidChars(username) || this.validationService.checkInvalidChars(password) || this.validationService.checkInvalidChars(confirmPassword)) {
  this.errorMessage = 'Invalid characters in username or password. Please try again.';
  return;
}
if (!this.validationService.checkUsername(username)) {
  this.errorMessage = 'username should be at least 3 characters. Please try again.';
  return;
}
if (!this.validationService.checkPassword(password)) {
  this.errorMessage = 'password should be at least 6 characters. Please try again.';
  return;
}
if (!this.validationService.doPasswordsMatch(password, confirmPassword)) {
  this.errorMessage = 'Passwords do not match';
  return;

}

 
  this.http.post<{id: number; username: string}>('http://localhost:3000/register', { 
    username: this.username, password: this.password }).subscribe({
    next: () => {
      this.authService.login(this.username, this.password).subscribe({
        next: (res) => {
          this.authService.saveToken(res.token);
          this.router.navigate(['/todo']); 
        },
        error: () => {
          this.errorMessage = 'Login after registration failed. Please try again.'
      
    }
        });
      },
   error: (err) => {
      if (err.status === 409) {
        this.errorMessage = 'Username already exists. Please choose a different username.';
      }
      else{
      this.errorMessage = 'Registration failed. Please try again.';
      
    }
  }
  });

}

}
