import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BASE_URL } from './../../config';

@Injectable()
export class DataService {
  headers = new Headers({'Content-Type': 'application/json'});
  options = new RequestOptions({ headers: this.headers });
  userName = 'Dirk Data';

  constructor(
    public http: Http
  ) { }

  postAction(type: string, payload: any, userName?: string): Observable<any> {
    if (userName) {
      this.userName = userName ;
    }
    console.log(BASE_URL);
    return this.http.post(`${BASE_URL}/api/actions`, {userName: this.userName, type: type, payload: payload}, this.options).map( res => res.json());
  }

}
