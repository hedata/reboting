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
  public code_string = `import plotly;
plotly.offline.init_notebook_mode();
import plotly.graph_objs as go;
import pandas as pd;
fbData = pd.read_csv("FB_insights.csv", encoding = "ISO-8859-1");
dataShort = fbData.iloc[1:, 1:10];
dataShort.columns = ['Laufzeit_like_total', 'Daily_likes', 'Daily_Dislikes', 'PeoplePerDay', 'PeoplePerWeek', 'PeoplePer28Days', 'ReachDaily', 'ReachWeekly', 'Reach28Days'];
days = list(range(1,32));
var1 = list(dataShort['Daily_likes']);
var2 = list(dataShort['Daily_Dislikes']);
trace0 = go.Scatter(x = days, y = var1, name = "Daily_likes", line = dict(color = ('rgb(205, 12, 24)'), width = 4));
trace1 = go.Scatter(x = days, y = var2, name = "Daily_Dislikes", line = dict(color = ('rgb(22, 96, 167)'), width = 4));
data = [trace0, trace1];
layout = dict(title = '(Dis)Likes and People per Day', xaxis = dict(title = 'Days'), yaxis = dict(title = 'absolut'),);
fig = dict(data = data, layout = layout);
plotly.offline.iplot(fig);`;
  public code_string1= `import matplotlib
import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline  
x = np.linspace(0, 3*np.pi, 500)
plt.plot(x, np.sin(x**2))
plt.title('A simple chirp')
plt.show()`;
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
      });
    }).catch(err => {
      console.error(err);
      console.log('Error on executing code');
    });
  }
}
