import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataService {
  BASE_URL = 'http://localhost:3000';
  headers = new Headers({'Content-Type': 'application/json'});
  options = new RequestOptions({ headers: this.headers });

  constructor(
    public http: Http
  ) { }

  postAction(type: string, payload: any): Observable<any> {
    console.log(type);
    console.log(payload);
    return this.http.post(`${this.BASE_URL}/api/actions`, {type: type, payload: payload}, this.options).map( res => res.json());
  }

}
