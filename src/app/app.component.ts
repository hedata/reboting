import { Component } from '@angular/core';
import {DataService} from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DataService]
})

/*

 */


export class AppComponent {
  private showComponent: String = 'opendata';
  constructor(private dataService: DataService) {
    dataService.changeEmitted$.subscribe(
      data => {
        console.log('App reacting to change');
        console.log(data);
        // which change was it?
        switch (data.message) {
          case 'botanswer':
            const response = data.data;
            if (response.script) {
              this.showComponent = 'visual';
            }
            if(response.opendata_search_results) {
              this.showComponent = 'opendata';
            }
            break;
          case 'show_visual':
            this.showComponent = 'visual';
            break;
          default:
            console.log('error');
            console.log(data);
        }
      });
  }

}
