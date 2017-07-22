import {Component, Input, NgZone, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';
import annyang from 'annyang';

@Component({
  selector: 'app-opendata',
  templateUrl: './opendata.component.html',
  styleUrls: ['./opendata.component.css']
})
export class OpenDataComponent {
  public searchResults: any = [];
  @Input()
  showComponent: String;
  constructor(
    private dataService: DataService,
  ) {
    dataService.changeEmitted$.subscribe(
      data => {
        // which change was it?
        switch (data.message) {
          case 'botanswer':
            console.log('Visual Component reacting to change');
            const response = data.data;
            if (response.opendata_search_results && response.opendata_search_results) {
              console.log('opendata reaction');
              this.searchResults = response.opendata_search_results;
              console.log(this.searchResults);
            }
            break;
          default:
            // console.log('not me');
            // console.log(data);
        }
      });
  }

  onExploreUrl(url) {
    // url.replace(/^http:\/\//i, 'https://')
    this.dataService.emitChange({
      message: 'directbotrequest',
      data: 'analyze csv from url ' + url
    });
  }
  onScatterUrl(url) {
    this.dataService.emitChange({
      message: 'directbotrequest',
      data: 'scatterplot ' + url
    });
  }

}
