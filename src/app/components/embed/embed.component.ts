import {Component, Input, NgZone, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';
declare var $:any;

@Component({
  selector: 'app-embed',
  templateUrl: './embed.component.html',
  styleUrls: ['./embed.component.css']
})
export class EmbedComponent {
  url: string;
  safeurl : string;
  @Input()
  showComponent: String;
  constructor(
    private dataService: DataService,
    private _ngZone: NgZone
  ) {
    dataService.changeEmitted$.subscribe(
      data => {
        // which change was it?
        switch (data.message) {
          case 'embed':
            console.log('EMBED Component reacting to change showing url');
            this.url = data.data;
            $("#iframeenter").empty();
            $("#iframeenter").html("<iframe allowfullscreen frameborder='0' src='"+this.url+"'></iframe>");

            console.log(data);
            break;
          default:
            // console.log('not me');
            // console.log(data);
        }
      });
  }
}
