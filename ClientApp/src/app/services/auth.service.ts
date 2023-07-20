


import { Injectable } from '@angular/core';
import { GoogleAuthProvider } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat';

import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { User } from '../Model/User';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getBaseUrl } from '../../main';
import { Router } from '@angular/router';
//import { LoginUserDto } from '../Model/LoginUserDto';
//Simport { google } from 'googleapis';

@Injectable({
  providedIn: 'root',
})
export class AuthService {


  public userData: User = null;
//  public loginUser: LoginUserDto;
  public users: User[];
  public credidential: any;
  public tokenClient: any;

  constructor(
    private router: Router,
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    private http: HttpClient
  ) { }
  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new GoogleAuthProvider());


  }
  // Auth logic to run auth providers
  AuthLogin(provider: GoogleAuthProvider | firebase.auth.AuthProvider) {
    return this.afAuth
      .signInWithPopup(provider)
      .then(async (result) => {
        console.log('You have been successfully logged in!');
        this.SetUserData(result.user);
        this.credidential = result.credential;
        console.log(this.credidential);
      
      })
      .catch((error) => {
        console.log(error);
      });
  }

  SetUserData(user: any) {

    this.userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
    //let headers = new HttpHeaders();
    //headers.append('Content-Type', 'application/json; charset=utf-8');
    //this.http.post<any>(getBaseUrl() + "User",
    //  this.userData,
    //  { headers: headers }).subscribe(result => {
    //    this.loginUser = result;
    //    localStorage.setItem("token", result.token);
    //    localStorage.setItem("cloud", result.cloudId);
    //    localStorage.setItem("id", result.userId);
    //    this.router.navigate(['/appuser']);

    //  });
    localStorage.setItem("user", JSON.stringify(this.userData));
    
  }

  GetUserData() {
    return this.userData;
  }

  GetAllUsers() {
    this.http.get<any[]>(getBaseUrl() + 'User').subscribe(result => {
      this.users = result;


    }, error => console.error(error));
    console.log(this.users);
    return this.users;
  }

  SignOut() {
    this.router.navigate(['']);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("id");
    localStorage.removeItem("cloud");
    return this.afAuth.signOut().then(this.userData = null);

  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }


 
 
  

  

  
  


}
