'use strict';
import {Component, OnInit, Input, NgZone} from '@angular/core';
// Polyfill for ES6 Promises
import 'es6-promise';

import {
  Session
} from '@jupyterlab/services';
import {
  OutputAreaModel, OutputAreaWidget
} from 'jupyterlab/lib/outputarea';

import {
  RenderMime
} from 'jupyterlab/lib/rendermime';

import {
  Kernel
} from '@jupyterlab/services';



import {DataService} from '../../services/data.service';

declare var $: any ;

@Component({
  selector: 'app-visual',
  templateUrl: './visual.component.html',
  styleUrls: ['./visual.component.less', '../../../../node_modules/jupyterlab/lib/default-theme/index.css' ]
})
export class VisualComponent implements OnInit {
  @Input()
  visual_id: String;

  @Input()
  showComponent: String;
  public widget: any;
  public loading: boolean = true;
  // private session: Session.ISession;
  private code_string = '';
  // variables for saving a visual
  private currentParams: any;
  private currentScript: any;

  ngOnInit(): void {
  }

  constructor(
      private dataService: DataService,
      private _ngZone: NgZone
  ) {
    dataService.changeEmitted$.subscribe(
      data => {
        console.log('Visual Component reacting to change');
        // which change was it?
        switch (data.message) {
          case 'botanswer':
            const response = data.data;
            if (response.script) {
              console.log('BOTANSWER in the visual');
              console.log(data.data);
              this.currentParams = [];
              this.currentScript = response.script;
              const script = response.script;
              const params = data.data.bot_response.result.parameters;
              this.code_string = '';
              // for all parameters of the script if the bot response has values for the params
              // otherwise take values defined in code
              script.params.forEach((element) => {
                // element has : name, value, type
                console.log(element);
                // test if the params have our object and the value of it != ""
                if (params.hasOwnProperty(element.name) && params[element.name] !== '' ) {
                  const tmp = element;
                  tmp.value = params[tmp.name];
                  this.currentParams.push(tmp);
                  // type
                  if (element.type === 'int') {
                    this.code_string = this.code_string + '' + element.name + ' =' + params[element.name] + ';';
                  } else {
                    this.code_string = this.code_string + '' + element.name + ' =\'' + params[element.name] + '\';';
                  }
                } else {
                  this.currentParams.push(element);
                  // for now this code just works for strings - need to check for escape chars and shit
                  if (element.type === 'int') {
                    this.code_string = this.code_string + '' + element.name + ' =' + element.value + ';';
                  } else {
                    this.code_string = this.code_string + '' + element.name + ' =\'' + element.value + '\';';
                  }
                }
              });
              // console.log(response.script);
              this.code_string = this.code_string + response.script.code;
              this.createVisual(); }
            break;
          case 'show_visual':
            console.log('show visual in Visual Component');
            // console.log(data.data);
            this.showExistingVisual(data.data);
            break;
        }
      });
  }
  showExistingVisual(data: any) {
    console.log('show existing visual');
    // console.log(data);
    this.loading = true;
    const visual_element =  $('#' + this.visual_id)
    visual_element.empty();
    // set rendermine
    const rendermime = new RenderMime({ items: RenderMime.getDefaultItems() });
    // console.log(rendermime);
    // set outputare model
    const model = new OutputAreaModel({ trusted: true });
    // Start a new session.
    const options: Session.IOptions = {
      kernelName: 'python',
      path: 'x.ipynb'
    };
    this.widget = new OutputAreaWidget({ rendermime, model });
    this.widget.model.fromJSON(data.visual.model);
    visual_element.append(this.widget.node);
    this.loading = false;
  }
  createVisual() {
    this._ngZone.run(() => {
      this.loading = true;
      $('#' + this.visual_id).empty();
      console.log('emptied visual: ' + this.visual_id);
      // set rendermine
      const rendermime = new RenderMime({ items: RenderMime.getDefaultItems() });
      // console.log(rendermime);
      // set outputare model
      const model = new OutputAreaModel({ trusted: true });
      // Start a new session.
      const options: Session.IOptions = {
        kernelName: 'python',
        path: 'x.ipynb'
      };
      console.log('Starting a kernel for visual: ' + this.visual_id);
      Kernel.getSpecs().then(kernelSpecs => {
        console.log('got kernel specs');
        console.log(kernelSpecs);
        // use the default name
        const kernel_options: Kernel.IOptions = {
          name: kernelSpecs.default
        };
        Kernel.startNew(kernel_options).then(kernel => {
          console.log(kernel);
          // create the widget // run in ngzone
          this.widget = new OutputAreaWidget({ rendermime, model });
          this.widget.execute(this.code_string, kernel).then(reply => {
            console.log('got reply from kernel: ' + reply.content.status + ' for visual: ' + this.visual_id);
            // append widget to notebook
            $('#' + this.visual_id).append(this.widget.node);
            // visual is created time for saving it
            const saveobj = {
              model : this.widget.model.toJSON(),
              script: this.currentScript,
              params: this.currentParams
            };
            console.log(saveobj);
            this.dataService.postAction('save_visual', saveobj).subscribe(
              result => {
                console.log(result);
                this.loading = false;
                // $('#' + this.visual_id).addClass('vertical_center_visual');
              },
              error => console.log(error)
            );
            // Kill the kernel.
            kernel.shutdown().then(() => {
              console.log('Kernel shut down');
            });
          }).catch(err => {
            console.error(err);
            console.log('Error on executing code');
          });
        });
      });
      /*
      console.log('Starting session');
      Session.startNew(options).then(s => {
        console.log('Session started');
        this.session = s;
        // create the widget // run in ngzone
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
      */
    });
  }
}
