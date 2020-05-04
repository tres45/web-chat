import { Component, OnInit, ViewChild } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';

import {User} from '../shared/interfaces';
import {AuthService} from '../shared/services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  formLogin: FormGroup;
  submitted = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    // Initialize from for registration
    this.formLogin = new FormGroup({
      email: new FormControl(null, [
        Validators.required, Validators.email
      ]),
      password: new FormControl(null,[
        Validators.required,
        Validators.minLength(6)
      ])
    });
  }

  // Login to account
  submit() {
    if (this.formLogin.invalid) {
      return;
    }

    // Load data from input form
    this.submitted = true;
    const curUser: User = {
      email: this.formLogin.value.email,
      password: this.formLogin.value.password
    };

    // Use auth service for login
    this.auth.login(curUser).subscribe(() => {
      this.formLogin.reset();
      this.router.navigate(['/']);
      this.submitted = false;
    }, () => {
      this.submitted = false;
    });
  }
}
