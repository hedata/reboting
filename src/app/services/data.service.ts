import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataService {
  BASE_URL = 'http://localhost:3000';
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
    return this.http.post(`${this.BASE_URL}/api/actions`, {userName: this.userName, type: type, payload: payload}, this.options).map( res => res.json());
  }

}
