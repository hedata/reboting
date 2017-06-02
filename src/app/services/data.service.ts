import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BASE_URL } from './../../config';
import {Subject} from 'rxjs/Subject';
import 'rxjs/Rx';

@Injectable()
export class DataService {
  headers = new Headers({'Content-Type': 'application/json'});
  options = new RequestOptions({ headers: this.headers });
  userName = 'Dirk Data';
  /*
      Shared Service
   */
  // Observable string sources
  private emitdataSource = new Subject<any>();
  // Observable string streams
  changeEmitted$ = this.emitdataSource.asObservable();
  // Service message commands
  emitChange(change: any) {
    console.log('emit change in service');
    this.emitdataSource.next(change);
  }
  constructor(
    public http: Http
  ) { }

  postAction(type: string, payload: any, userName?: string): Observable<any> {
    if (userName) {
      this.userName = userName ;
    }
    return this.http.post(`${BASE_URL}/rb/actions`,
      {userName: this.userName, type: type, payload: payload}
      , this.options).map( res => res.json());
  }

}
