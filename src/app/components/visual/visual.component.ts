'use strict';
import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
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

declare var $: any ;

@Component({
  selector: 'app-visual',
  templateUrl: './visual.component.html',
  styleUrls: ['./visual.component.css']
})
export class VisualComponent implements OnInit {
  public widget: any;
  @ViewChild('notebookElement')
  notebookElement: ElementRef;
  ngOnInit(): void {
    console.log('after view Checked');
    // set rendermine
    const rendermime = new RenderMime({ items: RenderMime.getDefaultItems() });
    console.log(rendermime);
    // set outputare model
    let model = new OutputAreaModel({ trusted: true });

    // Start a new session.
    let options: Session.IOptions = {
      kernelName: 'python',
      path: 'foo.ipynb'
    };
    let session: Session.ISession;

    console.log('Starting session');
    Session.startNew(options).then(s => {
      console.log('Session started');
      session = s;
      // Rename the session.
      return session.rename('bar.ipynb');
    }).then(() => {
      console.log(`Session renamed to ${session.path}`);
      // Execute and handle replies on the kernel.
      // create the widget
      this.widget = new OutputAreaWidget({ rendermime, model });
      console.log(this.widget);
      this.widget.execute('print("hello");a=1+1;print(a)', session.kernel).then(reply => {
        console.log('got reply from kernel: ' + reply.content.status);
        session.shutdown().then(() => {
          console.log('Session shut down');
          console.log('Test Complete!');
        });
        console.log(this.widget);
        console.log($('#notebook'));
        $('#notebook').append(this.widget.node);
      });
      /*
      let future = session.kernel.requestExecute({ code: 'a = 1' });
      future.onReply = (reply) => {
        console.log('Got execute reply');
      };*/
      /*
      future.onDone = () => {
        console.log('Future is fulfilled');
        // Shut down the session.
        session.shutdown().then(() => {
          console.log('Session shut down');
          console.log('Test Complete!');
        });
      };
      */
    }).catch(err => {
      console.error(err);
      console.log('Test Failed! See the console output for details');
    });
  }

  constructor(

  ) {
  }

}
