import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {Store} from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as papa from 'papaparse';

import { DataService } from './../../services/data.service';
import { AppStore } from './../../models/app-store.model';

@Component({
  selector: 'app-import-csv',
  templateUrl: './import-csv.component.html',
  styleUrls: ['./import-csv.component.css']
})
export class ImportCsvComponent implements OnInit {
  name: string;
  uploadState: Observable<boolean>;

  constructor(
    private dataService: DataService,
    private store: Store<AppStore>
  ) {
    this.uploadState = this.store.select('uploadState');
    console.log(this.uploadState);
  }

  ngOnInit() {
  }

  onFileChange(fileInput) {
    papa.parse(fileInput.currentFiles[0], {
      complete: (results) => {
        let file = {
            userName: this.name,
            fileName: fileInput.currentFiles[0].name,
            lastModified: fileInput.currentFiles[0].lastModified,
            lastModifiedDate: fileInput.currentFiles[0].lastModifiedDate,
            size: fileInput.currentFiles[0].size,
            type: fileInput.currentFiles[0].type,
            data: results.data
          };
          console.log(file);
        this.dataService.postAction('csvupload', file).subscribe(
          res => {
            console.log(res);
            this.store.dispatch({ type: 'UPLOAD_SUCCESS' });
            this.store.dispatch({ type: 'NEW_RESPONSE', payload: res });
          },
          err => {
            console.log(err);
            this.store.dispatch({type: 'UPLOAD_ERROR'});
          }
        );
      }
    });
  }

  onKey(name) {
    this.name = name;
    console.log(this.name);
  }

}
