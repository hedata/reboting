import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as papa from 'papaparse';

@Component({
  selector: 'app-import-csv',
  templateUrl: './import-csv.component.html',
  styleUrls: ['./import-csv.component.css']
})
export class ImportCsvComponent implements OnInit {
  @Output() uploadReady = new EventEmitter();
  name: string;

  constructor() { }

  ngOnInit() {
  }

  onFileChange(fileInput) {
    console.log(fileInput.currentFiles[0]);
    papa.parse(fileInput.currentFiles[0], {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        console.log({
          userName: this.name,
          fileName: fileInput.currentFiles[0].name,
          lastModified: fileInput.currentFiles[0].lastModified,
          lastModifiedDate: fileInput.currentFiles[0].lastModifiedDate,
          size: fileInput.currentFiles[0].size,
          type: fileInput.currentFiles[0].type,
          data: results.data.slice(1, results.data.length - 1)
          });
        console.log(this.name);
      }
    });
  }

  onKey(name) {
    this.name = name;
    console.log(this.name);
  }

}
