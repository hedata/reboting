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

  onExplore(searchresult: any) {
    // url.replace(/^http:\/\//i, 'https://')
    this.dataService.emitChange({
      message: 'directbotrequest',
      data: 'analyze this ',
      context: [{
        name: 'wudatasearchresult',
        lifespan: 10,
        parameters: {
          url: searchresult.url.replace(/(\r\n|\n|\r)/gm, '' ),
          name: searchresult.dataset.dataset_name.replace(/(\r\n|\n|\r)/gm, '' ),
          description: searchresult.dataset.dataset_description.replace(/(\r\n|\n|\r)/gm, '' ),
          portal: searchresult.portal.replace(/(\r\n|\n|\r)/gm, '' ),
          publisher: searchresult.dataset.publisher.replace(/(\r\n|\n|\r)/gm, '' )
        }
      }]
    });
  }
  onScatter(searchresult: any) {
    this.dataService.emitChange({
      message: 'directbotrequest',
      data: 'scatterplot this',
      context: [{
        name: 'wudatasearchresult',
        lifespan: 10,
        parameters: {
          url: searchresult.url.replace(/(\r\n|\n|\r)/gm, '' ),
          name: searchresult.dataset.dataset_name.replace(/(\r\n|\n|\r)/gm, '' ),
          description: searchresult.dataset.dataset_description.replace(/(\r\n|\n|\r)/gm, '' ),
          portal: searchresult.portal.replace(/(\r\n|\n|\r)/gm, '' ),
          publisher: searchresult.dataset.publisher.replace(/(\r\n|\n|\r)/gm, '' )
        }
      }]
    });
  }

  CheckifValidForMap(searchresult: any ) {
    if (searchresult.headers.indexOf('DISTRICT_CODE') !== -1 ) {
      return true;
    }
    // we have an opendata searchresult can we map this?
    return false;
  }
  onVisualizeAsMap(searchresult: any) {
    // request it
    this.dataService.emitChange({
      message: 'directbotrequest',
      data: 'map this',
      context: [{
                  name: 'wudatasearchresult',
                  lifespan: 10,
                  parameters: {
                    url: searchresult.url.replace(/(\r\n|\n|\r)/gm, '' ),
                    name: searchresult.dataset.dataset_name.replace(/(\r\n|\n|\r)/gm, '' ),
                    description: searchresult.dataset.dataset_description.replace(/(\r\n|\n|\r)/gm, '' ),
                    portal: searchresult.portal.replace(/(\r\n|\n|\r)/gm, '' ),
                    publisher: searchresult.dataset.publisher.replace(/(\r\n|\n|\r)/gm, '' )
                  }
                }]
    })
  }
}
