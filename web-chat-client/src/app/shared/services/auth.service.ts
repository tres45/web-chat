import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {tap, catchError} from 'rxjs/operators';
import {Observable, throwError, Subject} from 'rxjs';

import {FbAuthResponse, User} from '../../shared/interfaces';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Need for handle errors from firebase
  public error$: Subject<string> = new Subject<string>();

  constructor(private http: HttpClient) {
  }

  // Getter with check on token - need for check user auth.
  get token(): string {
    return sessionStorage.getItem('fb-token');
  }

  // Post user credentials to firebase auth db for login
  login(curUser: User): Observable<any> {
    curUser.returnSecureToken = true;
    return this.http.post(
      `${environment.signInfbUrl}?key=${environment.apiKey}`,
      curUser
    ).pipe(
      tap(this.setToken), // Intercept response for setup token
      catchError(this.handleError.bind(this)) // Handle errors
    );
  }

  // Post user credentials to firebase auth db for register new user
  register(curUser: User): Observable<any> {
    curUser.returnSecureToken = true;
    return this.http.post(
      `${environment.signUpfbUrl}?key=${environment.apiKey}`,
      curUser
    ).pipe(
      tap(this.setToken), // Intercept response for setup token
      catchError(this.handleError.bind(this)) // Handle errors
    );
  }

  logout() {
    this.setToken(null);
  }

  // Check if user authorized
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Handle errors from firebase response
  private handleError(error: HttpErrorResponse) {
    const {message} = error.error.error;
    switch (message) {
      case 'INVALID_EMAIL':
        this.error$.next('Invalid email.');
        break;
      case 'EMAIL_NOT_FOUND':
        this.error$.next('Email not found.')
        break;
      case 'EMAIL_EXISTS':
        this.error$.next('Email already exist.');
        break;
      case 'INVALID_PASSWORD':
        this.error$.next('Invalid password.');
        break;
    }
    return throwError(error);
  }

  // Attach token from firebase to session
  private setToken(response: FbAuthResponse | null) {
    if (response) {
      sessionStorage.setItem('fb-token', response.idToken);
      sessionStorage.setItem('email', response.email);
    } else {
      sessionStorage.clear();
    }
  }
}
