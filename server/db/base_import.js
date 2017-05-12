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
