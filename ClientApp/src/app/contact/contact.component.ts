import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getBaseUrl } from '../../main';
import { iContact } from '../Model/iContact';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent  {

  baseUrl = getBaseUrl();
  name: string = "";
  email: string = "";
  message: string = "";
  constructor(private router: Router, private http: HttpClient) { }

  

  submitForm(): void {
    let contact: iContact = { name: this.name, email: this.email, message: this.message };
    this.http.post<iContact>(this.baseUrl + "Contact", contact).subscribe(result => { console.log(result) }, error=> console.log(error));
    window.alert("Thank you!");
    this.router.navigate(["/"]);
  }
}
