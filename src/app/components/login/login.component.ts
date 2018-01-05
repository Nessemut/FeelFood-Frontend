import {Component, OnInit, ViewChild} from '@angular/core';
import 'rxjs/add/operator/map';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {HttpClient} from '@angular/common/http';

import { User } from '../../models/user';
import { Restaurant } from '../../models/restaurant';
import { MapHelper } from '../../helpers/mapHelper';
import { EnvironmentHelper } from '../../../environments/environment';
import { AuthService } from '../../services/authentication/auth.service';
import { AppNavbar} from '../../shared/navbar/navbar.component';
import { AuthGuard } from '../../guards/auth.guard';
import {ModalComponent} from '../../shared/modal/modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('modal') modal: ModalComponent;
  private user: User;
  private restaurant: Restaurant;
  private envHelper: EnvironmentHelper;
  showItemDictionary = { showLogin: true, showSignup: false };
  isRestaurant: boolean;

  signupForm: FormGroup;
  loginForm: FormGroup;
  private mapHelper: MapHelper;

  message;
  messageClass;
  proccessing = false;
  previousUrl;

  constructor(private router: Router, private formBuilder: FormBuilder,
    private authService: AuthService, private http: HttpClient, private authGuard: AuthGuard, private navBar: AppNavbar) {
    this.createForm();
    this.user = new User();
    this.restaurant = new Restaurant();
    this.envHelper = new EnvironmentHelper();
    this.isRestaurant = false;
    this.mapHelper = new MapHelper();
  }

  createForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        this.validateEmail
      ])],
      password: ['', Validators.compose([
        Validators.required
      ])]
    });
    this.signupForm = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        this.validateEmail
      ])],
      username: ['', Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
        this.validateUsername
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8)
      ])],
      confirm: ['', Validators.required]
    }, { validator: this.matchingPasswords('password', 'confirm') });
  }

  validateEmail(controls) {
    const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    // Test email against regular expression
    if (regExp.test(controls.value)) {
      return null; // Return as valid email
    } else {
      return { 'validateEmail': true }; // Return as invalid email
    }
  }

  validateUsername(controls) {
    const regExp = new RegExp(/^[a-zA-Z0-9]+$/);
    if (regExp.test(controls.value)) {
      return null; // Return as valid username
    } else {
      return { 'validateUsername': true }; // Return as invalid username
    }
  }

  matchingPasswords(password, confirm) {
    return (group: FormGroup) => {
      // Check if both fields are the same
      if (group.controls[password].value === group.controls[confirm].value) {
        return null; // Return as a match
      } else {
        return { 'matchingPasswords': true }; // Return as error: do not match
      }
    };
  }

  disableForm() {
    this.signupForm.controls['email'].disable();
    this.signupForm.controls['username'].disable();
    this.signupForm.controls['password'].disable();
    this.signupForm.controls['confirm'].disable();
  }

  enableForm() {
    this.signupForm.controls['email'].enable();
    this.signupForm.controls['username'].enable();
    this.signupForm.controls['password'].enable();
    this.signupForm.controls['confirm'].enable();
  }

  ngOnInit() {
    if (this.authGuard.redirectUrl) {
      this.messageClass = 'alert alert-danger';
      this.message = 'You must be logged in.';
      this.previousUrl = this.authGuard.redirectUrl;
      this.authGuard.redirectUrl = undefined;
    }
  }

  changeShowStatus(key) {

    const itemsList = Object.keys(this.showItemDictionary);
    for (let index = 0; index < itemsList.length; index++) {
      const specificKey = itemsList[index];
      this.showItemDictionary[specificKey] = specificKey === key ? true : false;
    }
  }

  setRestaurantOption() {
    this.isRestaurant = !this.isRestaurant
    console.log('UPDATED isRestaurant = ' + this.isRestaurant);
  }

  loginSubmit(email, password) {
    this.proccessing = true;
    let body;
    if (!email || !password) {
      body = {
        email: this.loginForm.get('email').value,
        password: this.loginForm.get('password').value
      };
    } else {
      body = {
        email: email,
        password: password
      };
    }
    this.authService.login(body).subscribe(data => {
      console.log(JSON.stringify(data));
      if (!data['success']) {
        this.messageClass = 'text-danger';
        this.message = data['message'];
        this.modal.show();
        setTimeout(() => {
          this.modal.hide();
        }, 1000);
        this.proccessing = false;
      } else {
        this.messageClass = 'text-success';
        this.message = data['message'];
        this.modal.show();
        if (data['user']) {
          this.navBar.profile = '/userProfile';
          this.user = this.mapHelper.map(User, data['user']);
          this.authService.storeUserData(data['token'], data['user']);
        } else if (data['restaurant']) {
          this.navBar.profile = '/restaurantProfile';
          this.restaurant = this.mapHelper.map(Restaurant, data['restaurant']);
          this.authService.storeRestaurantData(data['token'], data['restaurant']);
        }
        setTimeout(() => {
          this.modal.hide();
          if (this.previousUrl) {
            this.router.navigate([this.previousUrl]);
          } else {
            this.router.navigate(['/home']);
          }
        }, 1000);
      }
    });
  }

  singUpSubmit() {
    this.proccessing = true;
    this.disableForm();
    this.setInputValues(this.signupForm);
    this.isRestaurant === true ? this.signupRestaurant() : this.signupUser();
  }

  setInputValues(form: FormGroup) {
    if (this.isRestaurant) {
        this.restaurant.username = form.get('username').value;
        this.restaurant.email = form.get('email').value;
        this.restaurant.password = form.get('password').value;
    } else {
        this.user.username = form.get('username').value;
        this.user.email = form.get('email').value;
        this.user.password = form.get('password').value;
    }
  }

  signupUser() {
    console.log('Try Post Signup user...');
    this.authService.signUpUser(this.user).subscribe(data => {
      console.log(JSON.stringify(data));
      if (!data['success']) {
        this.messageClass = 'text-danger';
        this.message = data['message'];
        this.modal.show();
        setTimeout(() => {
          this.modal.hide();
        }, 1500);
        this.proccessing = false;
        this.enableForm();
      } else {
        this.loginSubmit(this.user.email, this.user.password);
      }
    });
  }

  signupRestaurant() {
    console.log('Try Post Signup restaurant...');
    this.authService.signUpRestaurant(this.restaurant).subscribe(data => {
      console.log(JSON.stringify(data));
      if (!data['success']) {
        this.messageClass = 'text-danger';
        this.message = data['message'];
        this.modal.show();
        setTimeout(() => {
          this.modal.hide();
        }, 1500);
        this.proccessing = false;
        this.enableForm();
      } else {
        this.loginSubmit(this.restaurant.email, this.restaurant.password);
      }
    });
  }
}
