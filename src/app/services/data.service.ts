import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataService {
  BASE_URL = 'http://localhost:3000';

  constructor(
    public http: Http
  ) { }

  postAction(type: string, payload: any): Observable<any> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'charset': 'UTF-8'
    });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(`${this.BASE_URL}/api/actions`, {type: type, payload: payload}, options).map( res => res.json());
  }

}
