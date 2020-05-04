import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';

import {User} from '../shared/interfaces';
import {AuthService} from '../shared/services/auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {

  formRegister: FormGroup;
  submitted = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    // Initialize from for registration
    this.formRegister = new FormGroup({
      email: new FormControl(null, [
        Validators.required, Validators.email
      ]),
      password: new FormControl(null,[
        Validators.required,
        Validators.minLength(6)
      ])
    });
  }

  // Register new account
  submit() {
    if (this.formRegister.invalid) {
      return;
    }

    // Load data from input form
    this.submitted = true;
    const curUser: User = {
      email: this.formRegister.value.email,
      password: this.formRegister.value.password
    };

    // Use auth service for registration
    this.auth.register(curUser).subscribe(() => {
      this.formRegister.reset();
      this.router.navigate(['/']);
      this.submitted = false;
    }, () => {
      this.submitted = false;
    });
  }
}
