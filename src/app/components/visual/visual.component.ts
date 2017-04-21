'use strict';
import {Component, OnInit, ViewChild, ElementRef, Input} from '@angular/core';
// Polyfill for ES6 Promises
// import 'es6-promise';

import {
  Session, utils
} from '@jupyterlab/services';
import {
  IOutputAreaModel, OutputAreaModel, OutputAreaWidget
} from 'jupyterlab/lib/outputarea';

import {
  RenderMime
}
from 'jupyterlab/lib/rendermime';
import {DataService} from "../../services/data.service";

declare var $: any ;

@Component({
  selector: 'app-visual',
  templateUrl: './visual.component.html',
  styleUrls: ['./visual.component.css']
})
export class VisualComponent implements OnInit {
  @Input()
  visual_id: String;

  public widget: any;
  public loading: boolean = true;
  private session: Session.ISession;
  public code_string = "";
  ngOnInit(): void {
  }

  constructor(
      private dataService: DataService
  ) {
    dataService.changeEmitted$.subscribe(
      data => {
        console.log('Visual Component reacting to change');
        // which change was it?
        switch (data.message) {
          case 'botanswer':
            console.log(data.data);
            const response = data.data;
            if (response.code) {
              this.code_string = response.code;
              this.createVisual(); }
            break;
          default:
            console.log('error');
            console.log(data);
        }
      });
  }
  createVisual() {
    this.loading = true;
    console.log('after view Checked');
    // TODO think about refactoring constants and when to instantiate to avoid meory leaks
    // set rendermine
    const rendermime = new RenderMime({ items: RenderMime.getDefaultItems() });
    console.log(rendermime);
    // set outputare model
    let model = new OutputAreaModel({ trusted: true });
    // Start a new session.
    let options: Session.IOptions = {
      kernelName: 'python',
      path: 'x.ipynb'
    };
    console.log('Starting session');
    Session.startNew(options).then(s => {
      console.log('Session started');
      this.session = s;
      return this.session.rename('x.ipynb');
    }).then(() => {
      // create the widget
      this.widget = new OutputAreaWidget({ rendermime, model });
      this.widget.execute(this.code_string, this.session.kernel).then(reply => {
        console.log('got reply from kernel: ' + reply.content.status);
        this.session.shutdown().then(() => {
          console.log('Session shut down');
        });
        // append widget to notebook
        this.loading = false;
        $('#' + this.visual_id).empty();
        $('#' + this.visual_id).append(this.widget.node);
      });
    }).catch(err => {
      console.error(err);
      console.log('Error on executing code');
    });
  }
}
