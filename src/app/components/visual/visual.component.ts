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
  private code_string = '';
  // variables for saving a visual
  private currentParams: any;
  private currentScript: any;

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
            if (response.script) {
              this.currentParams = [];
              this.currentScript = response.script;
              const script = response.script;
              const params = data.data.bot_response.result.parameters;
              this.code_string = '';
              const that = this;
              // for all parameters of the script if the bot response has values for the params
              // otherwise take values defined in code
              script.params.forEach(function(element) {
                console.log(element);
                // test if the params have our object
                if (params.hasOwnProperty(Object.keys(element)[0])) {
                  const tmp = element;
                  tmp[Object.keys(element)[0]] = params[Object.keys(element)[0]];
                  that.currentParams.push(tmp);
                  that.code_string = that.code_string + '' + Object.keys(element)[0] + ' =\'' + params[Object.keys(element)[0]] + '\';';
                } else {
                  that.currentParams.push(element);
                  // for now this code just works for strings - need to check for escape chars and shit
                  console.log('elementname: ' + element[Object.keys(element)[0]]);
                  that.code_string = that.code_string + '' + Object.keys(element)[0] + ' =\'' + element[Object.keys(element)[0]] + '\';';
                }
              });
              console.log(response.script);
              this.code_string = this.code_string + response.script.code;
              this.createVisual(); }
            break;
          case 'show_visual':
            console.log('show visual in Visual Component');
            console.log(data.data);
            this.showExistingVisual(data.data);
            break;
          default:
            console.log('error');
            console.log(data);
        }
      });
  }
  showExistingVisual(data: any) {
    console.log('show existing visual');
    console.log(data);
    this.loading = true;
    $('#' + this.visual_id).empty();
    // set rendermine
    const rendermime = new RenderMime({ items: RenderMime.getDefaultItems() });
    console.log(rendermime);
    // set outputare model
    const model = new OutputAreaModel({ trusted: true });
    // Start a new session.
    const options: Session.IOptions = {
      kernelName: 'python',
      path: 'x.ipynb'
    };
    this.widget = new OutputAreaWidget({ rendermime, model });
    this.widget.model.fromJSON(data.visual.model);
    $('#' + this.visual_id).append(this.widget.node);
    this.loading= false;
  }
  createVisual() {
    this.loading = true;
    $('#' + this.visual_id).empty();
    console.log('after view Checked');
    // TODO think about refactoring constants and when to instantiate to avoid memory leaks
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
        $('#' + this.visual_id).append(this.widget.node);
        // visual is created time for saving it
        const saveobj = {
          model : this.widget.model.toJSON(),
          script: this.currentScript,
          params: this.currentParams
        };
        console.log(saveobj);
        this.dataService.postAction('save_visual', saveobj).subscribe(
          result => console.log(result),
          error => console.log(error)
        );

      });
    }).catch(err => {
      console.error(err);
      console.log('Error on executing code');
    });
  }
}
