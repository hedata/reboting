import {Component, Input, NgZone, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';

import {
  Session
} from '@jupyterlab/services';
import {
  CodeCellModel, CodeCellWidget
} from 'jupyterlab/lib/cells';

import {
  RenderMime
} from 'jupyterlab/lib/rendermime';

import {
  Kernel
} from '@jupyterlab/services';


declare var $: any ;

@Component({
  selector: 'app-intent',
  templateUrl: './intent.component.html',
  styleUrls: ['./intent.component.css']
})
export class IntentComponent {
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
          case 'botanswer':
            console.log('Visual Component reacting to change');
            const response = data.data;
            if (response.bot_response.result.action === 'create_intent') {
              console.log('Intent Compoenent creating cell');
              this.onCreateCodeCell();
            }
            break;
          default:
            // console.log('not me');
            // console.log(data);
        }
      });
  }
  onCreateCodeCell() {
   console.log('on create code cell');
  }
}
