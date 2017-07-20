import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BASE_URL } from './../../config';
import {Subject} from 'rxjs/Subject';
import 'rxjs/Rx';
import {AuthService} from './auth.service';

@Injectable()
export class DataService {
  headers = new Headers({'Content-Type': 'application/json'});
  options = new RequestOptions({ headers: this.headers });
  userName = '123190u01uasd';
  /*
      Shared Service
   */
  // Observable string sources
  private emitdataSource = new Subject<any>();
  private authService : AuthService;
  // Observable string streams
  changeEmitted$ = this.emitdataSource.asObservable();
  // Service message commands
  emitChange(change: any) {
    console.log('emit change in service');
    this.emitdataSource.next(change);
  }
  constructor(
    public http: Http
  ) {
    console.log('in the constructor of the DataService');
  }

  postAction(type: string, payload: any, userName?: string): Observable<any> {
    if (userName) {
      this.userName = userName ;
    }
    return this.http.post(`${BASE_URL}/rb/actions`,
      {userName: this.userName, type: type, payload: payload}
      , this.options).map( res => res.json());
  }
  setAuthService(auth: AuthService) {
    this.authService = auth;
  }

}
