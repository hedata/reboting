import {Component, Input, NgZone, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';
import {AuthService} from '../../services/auth.service';
import {BotContextService} from '../../services/botcontext.service';

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
    private authService: AuthService,
    private botContext: BotContextService
  ) {
    dataService.changeEmitted$.subscribe(
      data => {
        // which change was it?
        switch (data.message) {
          case 'botanswer':
            console.log('Opendata Component reacting to change');
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
  private getRequestUri() {
    console.log(this.botContext.getBotContext());
    if (this.botContext.getBotContext()[0].name === 'wudatasearchresultlist') {
      return this.botContext.getBotContext()[0].parameters.request_uri
    }
  }
  private emitQueryWithSearchResultContext(searchresult: any, query: String, index: Number) {
    const requesturi = this.getRequestUri();
    this.dataService.emitChange({
      message: 'directbotrequest',
      data: query,
      context: [{
        name: 'wudatasearchresult',
        lifespan: 10,
        parameters: {
          search_rank : index,
          url: searchresult.url.replace(/(\r\n|\n|\r)/gm, '' ),
          name: searchresult.dataset.dataset_name.replace(/(\r\n|\n|\r)/gm, '' ),
          description: searchresult.dataset.dataset_description.replace(/(\r\n|\n|\r)/gm, '' ),
          portal: searchresult.portal.replace(/(\r\n|\n|\r)/gm, '' ),
          publisher: searchresult.dataset.publisher.replace(/(\r\n|\n|\r)/gm, '' ),
          user_id: this.authService.getUserData().id,
          request_uri : requesturi
        }
      }]
    });
  }
  /*
 request_uri: requesturi
   */
  onExplore(searchresult: any, index: any) {
    this.emitQueryWithSearchResultContext(searchresult, 'analyze this', index);
  }
  onScatter(searchresult: any, index: any) {
    this.emitQueryWithSearchResultContext(searchresult, 'scatterplot this', index);
  }
  onVisualize(searchresult: any, index: any) {
    // get current request uri from bot
    this.emitQueryWithSearchResultContext(searchresult, 'visualize this', index);
  }
}
