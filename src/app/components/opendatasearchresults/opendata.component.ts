import {Component, Input, NgZone, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';
import annyang from 'annyang';

@Component({
  selector: 'app-opendata',
  templateUrl: './opendata.component.html',
  styleUrls: ['./opendata.component.css']
})
export class OpenDataComponent {
  public searchResults = [];
  @Input()
  showComponent: String;
  constructor(
    private dataService: DataService,
  ) {
    dataService.changeEmitted$.subscribe(
      data => {
        console.log('Visual Component reacting to change');
        // which change was it?
        switch (data.message) {
          case 'botanswer':
            const response = data.data;
            console.log("opendata reaction");
            if (response.opendata_search_results) {
              this.searchResults = response.opendata_search_results.results;
              console.log(this.searchResults);
            }
            break;
          default:
            console.log('not me');
            console.log(data);
        }
      });
  }

}
