import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  isExpanded = false;
  isUserLoggedIn: boolean = false;

  constructor(private loginService: LoginService, private auth: AuthService) {
    
  }
  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  onLogin() {
    this.auth.GoogleAuth();
    this.isUserLoggedIn = this.loginService.LoginUser();
  
  }

  onLogout() {
    this.isUserLoggedIn = this.loginService.LogoutUser();
    this.auth.SignOut();
  }
}
