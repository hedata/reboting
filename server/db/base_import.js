/*
  import scripts for base usage
 */
var mongoose = require('mongoose');
var Scripts = mongoose.model('Scripts');
insertIt = function(code,actionname,params) {
  var query = { action_name : actionname },
    update = {
      action_name : actionname,
      code : code,
      params: params
    },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
  Scripts.findOneAndUpdate(query, update, options, function(error, obj) {
    if (error) {
      console.log(error)
    } else {
      console.log("insert/update successfull");
      console.log(obj);
    }
  });
};


console.log("Importing Scripts ");

var code = `import plotly;
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
layout = dict(title = title, xaxis = dict(title = 'Days'), yaxis = dict(title = 'absolut'),);
fig = dict(data = data, layout = layout);
plotly.offline.iplot(fig);`;
var intentname = 'fb_likes_and_people_per_day';
var params = [{
  name: 'title',
  value: '(Dis)Likes and People per Day',
  type: 'string'
}];
insertIt(code,intentname,params);

code =`import matplotlib
import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline  
x = np.linspace(0, 3*np.pi, 500)
plt.plot(x, np.sin(x**2))
plt.title(title)
plt.show()`;
intentname = 'random_plot';
params = [{
  name : 'title',
  value: 'A random random graph',
  type: 'string'
}];
insertIt(code,intentname,params);

code =`from bokeh.plotting import figure, output_file, show, output_notebook
import warnings
warnings.filterwarnings("ignore")
import pandas as pd

fbData = pd.read_csv("FB_insights.csv", encoding = "ISO-8859-1")

dataShort = fbData.iloc[1:, 1:10]

dataShort.columns = ['Laufzeit_like_total', 'Daily_likes', 'Daily_Dislikes', 'PeoplePerDay', 'PeoplePerWeek', 'PeoplePer28Days', 'ReachDaily', 'ReachWeekly', 'Reach28Days']

days = list(range(1,32))
var1 = list(dataShort['Daily_likes'])
var2 = list(dataShort['Daily_Dislikes'])
output_notebook(hide_banner=True)

p = figure(
   tools="pan,box_zoom,reset,save", title=title,
   x_axis_label='Days of the month', y_axis_label='(Dis)Likes',
   toolbar_location="right"
)
p.sizing_mode = 'scale_width'
# add some renderers
p.line(days, var1, legend="likes", line_width=1, line_color="green", line_dash = "4 4")
p.circle(days, var1, legend="likes", fill_color="green", size=8)
p.line(days, var2, legend="dislikes", line_width=1, line_color="red")

# show the results
show(p)

`;
params = [{
  name : 'title',
  value: 'FB N°1',
  type: 'string'
}];
intentname= 'bokeh_plot';
insertIt(code,intentname,params);

code = `# line chart
from bokeh.plotting import figure, output_file, show, output_notebook

# stacked bar chart
from bokeh.charts import Bar, show
from bokeh.charts.attributes import cat, color
from bokeh.charts.operations import blend
from bokeh.models import LabelSet
import bokeh

import random
import pandas as pd
import warnings

#Parameter
#time = 20 #Anzahl der Tage die betrachtet werden (ausgehend von heute)

warnings.filterwarnings("ignore")
temp = pd.read_csv("FB_insights.csv", encoding = "ISO-8859-1")

fbData = temp[1:len(temp.index)]
fbData = fbData.apply(pd.to_numeric, args=('coerce', ))

Bezahlte_Reichweite_col = "Daily Paid reach"
Bezahlte_Reichweite_agg = fbData[Bezahlte_Reichweite_col].sum(axis=0)
Bezahlte_Reichweite_line = list(fbData[Bezahlte_Reichweite_col])

Reichweite_col = "Daily Total reach"
Reichweite_agg = fbData[Reichweite_col].sum(axis=0)
Reichweite_line = list(fbData[Reichweite_col])

Organische_Reichweite_agg = Reichweite_agg - Bezahlte_Reichweite_agg
Organische_Reichweite_line = list(fbData[Reichweite_col] - fbData[Bezahlte_Reichweite_col])
# plotting Reichweite
proxy = random.sample(range(1, 100), 29)



days = list(range(1, len(fbData)+1))
df = pd.DataFrame({'Tage': days, 'Bezahlte Reichweite': proxy, 'Organische Reichweite': Organische_Reichweite_line})

df = df[0:time]

output_notebook(hide_banner=True)

bar = Bar(df,
          values=blend('Bezahlte Reichweite', 'Organische Reichweite', name='Reichweite', labels_name='reach'),
          label=cat(columns='Tage', sort=False),
          stack=cat(columns='reach', sort=False),
          color=color(columns='reach', palette=['SaddleBrown', 'Silver'],sort=False),
          legend='top_right',
          title=title,
          toolbar_location="right",
          tooltips=[('Reichweite', '@reach'), ('Tage', '@Tage')]
         )
bar.sizing_mode = 'scale_width'

show(bar)`;
params = [{
  name: 'title',
  value: 'Bezahlte und organische Reichweite',
  type: 'string'
},{
  name : 'time',
  value : 28,
  type: 'int'
}];
intentname= 'reichweite';
insertIt(code,intentname,params);

code =`import numpy as np

from bokeh.layouts import row, widgetbox
from bokeh.models import CustomJS, Slider
from bokeh.plotting import figure, show, ColumnDataSource, output_notebook

x = np.linspace(0, 10, 500)
y = np.sin(x)

output_notebook(hide_banner=True)

source = ColumnDataSource(data=dict(x=x, y=y))

plot = figure(y_range=(-10, 10))
plot.sizing_mode = 'scale_width'

plot.line('x', 'y', source=source, line_width=3, line_alpha=0.6)

callback = CustomJS(args=dict(source=source), code="""
    var data = source.data;
    var A = amp.value;
    var k = freq.value;
    var phi = phase.value;
    var B = offset.value;
    x = data['x']
    y = data['y']
    for (i = 0; i < x.length; i++) {
        y[i] = B + A*Math.sin(k*x[i]+phi);
    }
    source.trigger('change');
""")

amp_slider = Slider(start=0.1, end=10, value=1, step=.1,
                    title="Amplitude", callback=callback)
callback.args["amp"] = amp_slider

freq_slider = Slider(start=0.1, end=10, value=1, step=.1,
                     title="Frequency", callback=callback)
callback.args["freq"] = freq_slider

phase_slider = Slider(start=0, end=6.4, value=0, step=.1,
                      title="Phase", callback=callback)
callback.args["phase"] = phase_slider

offset_slider = Slider(start=-5, end=5, value=0, step=.1,
                       title="Offset", callback=callback)
callback.args["offset"] = offset_slider

layout = row(
    plot,
    widgetbox(amp_slider, freq_slider, phase_slider, offset_slider),
)

show(layout)
`;
params=[];
intentname="interactive_test";
insertIt(code,intentname,params);

