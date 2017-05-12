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
  Scripts.findOneAndUpdate(query, update, options, function(error) {
    if (error) {
      console.log(error)
    } else {
      console.log("insert/update successfull");
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
  title: '(Dis)Likes and People per Day'
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
  title: 'A random random graph'
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

output_notebook()

p = figure(
   tools="pan,box_zoom,reset,save", title=title,
   x_axis_label='Days of the month', y_axis_label='(Dis)Likes'
)

# add some renderers
p.line(days, var1, legend="likes", line_width=1, line_color="green", line_dash = "4 4")
p.circle(days, var1, legend="likes", fill_color="green", size=8)
p.line(days, var2, legend="dislikes", line_width=1, line_color="red")

# show the results
show(p)

`;
params = [{
  title: 'FB N°1'
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
time = 20 #Anzahl der Tage die betrachtet werden (ausgehend von heute)

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
          tooltips=[('Reichweite', '@reach'), ('Tage', '@Tage')]
         )
bar.sizing_mode = 'scale_width'

show(bar)`;
params = [{
  title: 'Bezahlte und organische Reichweite'
}];
intentname= 'reichweite';
insertIt(code,intentname,params);
