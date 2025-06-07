import { Component } from '@angular/core';
import {Router,RouterModule} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username='';
  password='';
  errorMessage='';

  constructor(private authService: AuthService, private router: Router, private validationService: ValidationService) {}
  onLogin():void{
    const { username, password } = this;
if (this.validationService.checkInvalidChars(username) || this.validationService.checkInvalidChars(password)) {
  this.errorMessage = 'Invalid characters in username or password. Please try again.';
  return;
}


    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/todo']);
      },
      error: (err) => {
        this.errorMessage = 'Login failed. Please try again.'
      }
    });
  }

}
