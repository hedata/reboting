import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataService {

  constructor(
    public http: Http
  ) { }

  postData(payload: any): Observable<any> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'charset': 'UTF-8'
    });
    let options = new RequestOptions({ headers: headers });
    return this.http.post('/api/datasource', payload, options).map( res => res.json());
  }

}
