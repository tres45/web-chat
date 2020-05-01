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

  submit() {
    if (this.formRegister.invalid) {
      return;
    }
    this.submitted = true;

    const curUser: User = {
      email: this.formRegister.value.email,
      password: this.formRegister.value.password
    };

    this.auth.register(curUser).subscribe(() => {
      this.formRegister.reset();
      console.log("Hi")
      this.router.navigate(['/']);
      this.submitted = false;
    }, () => {
      this.submitted = false;
    });
  }
}
