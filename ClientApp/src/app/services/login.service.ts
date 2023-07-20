import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public isUserLoggedIn: boolean = false;

  constructor() { }

  LoginUser(): boolean {
    this.isUserLoggedIn = true;
    return this.isUserLoggedIn;
  }

  LogoutUser(): boolean {
    this.isUserLoggedIn = false;
    return this.isUserLoggedIn;
  }

}
