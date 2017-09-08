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

code =`from bokeh.plotting import figure, show, output_notebook
from bokeh.sampledata.iris import flowers

colormap = {'setosa': 'red', 'versicolor': 'green', 'virginica': 'blue'}
colors = [colormap[x] for x in flowers['species']]

p = figure(title = "Iris Morphology")
p.xaxis.axis_label = 'Petal Length'
p.yaxis.axis_label = 'Petal Width'

p.circle(flowers["petal_length"], flowers["petal_width"],
         color=colors, fill_alpha=0.2, size=10)

output_notebook()

show(p)`;
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

from bokeh.layouts import row,column, widgetbox
from bokeh.models import CustomJS, Slider
from bokeh.plotting import figure, show, ColumnDataSource, output_notebook

x = np.linspace(0, 10, 500)
y = np.sin(x)

output_notebook(hide_banner=True)

source = ColumnDataSource(data=dict(x=x, y=y))

plot = figure(y_range=(-10, 10))

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

layout = column(
    widgetbox(amp_slider, freq_slider, phase_slider, offset_slider),
    plot,
    responsive = True
)

show(layout)
`;
params=[];
intentname="interactive_test";
insertIt(code,intentname,params);





code =`from bokeh.models import HoverTool, ColumnDataSource
from bokeh.plotting import figure, show , output_notebook
from bokeh.sampledata.periodic_table import elements

romans = ["I", "II", "III", "IV", "V", "VI", "VII"]

elements = elements.copy()
elements["atomic mass"] = elements["atomic mass"].astype(str)

elements["period"] = [romans[x-1] for x in elements.period]
elements = elements[elements.group != "-"]

group_range = [str(x) for x in range(1, 19)]

colormap = {
    "alkali metal"         : "#a6cee3",
    "alkaline earth metal" : "#1f78b4",
    "halogen"              : "#fdbf6f",
    "metal"                : "#b2df8a",
    "metalloid"            : "#33a02c",
    "noble gas"            : "#bbbb88",
    "nonmetal"             : "#baa2a6",
    "transition metal"     : "#e08e79",
}

source = ColumnDataSource(
    data=dict(
        group=[str(x) for x in elements["group"]],
        period=[str(y) for y in elements["period"]],
        symx=[str(x)+":0.1" for x in elements["group"]],
        numbery=[str(x)+":0.8" for x in elements["period"]],
        massy=[str(x)+":0.15" for x in elements["period"]],
        namey=[str(x)+":0.3" for x in elements["period"]],
        sym=elements["symbol"],
        name=elements["name"],
        cpk=elements["CPK"],
        atomic_number=elements["atomic number"],
        electronic=elements["electronic configuration"],
        mass=elements["atomic mass"],
        type=elements["metal"],
        type_color=[colormap[x] for x in elements["metal"]],
    )
)

p = figure(title="Periodic Table", tools="hover,save",
           x_range=group_range, y_range=list(reversed(romans)))
p.toolbar_location = None
p.outline_line_color = None


p.rect("group", "period", 0.9, 0.9, source=source,
       fill_alpha=0.6, color="type_color")

text_props = {
    "source": source,
    "angle": 0,
    "color": "black",
    "text_align": "left",
    "text_baseline": "middle"
}

p.text(x="symx", y="period", text="sym",
       text_font_style="bold", text_font_size="15pt", **text_props)

p.text(x="symx", y="numbery", text="atomic_number",
       text_font_size="9pt", **text_props)

p.text(x="symx", y="namey", text="name",
       text_font_size="6pt", **text_props)

p.text(x="symx", y="massy", text="mass",
       text_font_size="5pt", **text_props)

p.grid.grid_line_color = None

p.select_one(HoverTool).tooltips = [
    ("name", "@name"),
    ("atomic number", "@atomic_number"),
    ("type", "@type"),
    ("atomic mass", "@mass"),
    ("CPK color", "$color[hex, swatch]:cpk"),
    ("electronic configuration", "@electronic"),
]
p.sizing_mode = 'scale_width'
output_notebook(hide_banner=True)

show(p)  # Change to save(p) to save but not show the HTML file
`;
params=[];
intentname="periodic_table";
insertIt(code,intentname,params);


/*

  Scatterplot

 */

code =`import numpy as np
from bokeh.models import ColumnDataSource
from bokeh.plotting import Figure, show, ColumnDataSource, output_notebook
from bokeh.layouts import row,column, widgetbox
from bokeh.models.widgets import Select,TextInput
from bokeh.models import CustomJS
import requests
import pandas as pd
import json
import os
import IPython
import random
import csv
import re
import chardet
import reboting
#data reading and preparation
filename = reboting.readandcleancsv( url )
try:
    # Define the data to be used
    df = pd.read_csv(filename,sep=None, engine='python')
    output_notebook(hide_banner=True)
    #remove special chars of column names
    df.columns=df.columns.str.replace('#','')
    df.columns=df.columns.str.replace('.','')
    df.columns=df.columns.str.replace(':','')
    df.columns=df.columns.str.replace('"','')
    df.columns=df.columns.str.replace(' ','')
    numeric_columns = list(df.select_dtypes(include=['int64','float64']).columns)
    df = df[numeric_columns]
    #add2 dummy columns where we put our data that will be shown in so we change around and nothing will be killed
    #and can plot with x and y
    df.insert(0, 'x', df[numeric_columns[0]] )
    df.insert(0, 'y', df[numeric_columns[1]] )
    
    source = ColumnDataSource(data=df)
    #x and y are probably copied over which sucks and is a huge BUG!!
    if len(numeric_columns)>1:
        codex="""
                var data = source.data;
                data['x'] = data[cb_obj.value]
                source.trigger('change');
            """
        
        codey="""
                var data = source.data;
                data['y'] = data[cb_obj.value]
                source.trigger('change');
            """

        callbackx = CustomJS(args=dict(source=source), code=codex)
        callbacky = CustomJS(args=dict(source=source), code=codey)

        # create a new plot 
        plot = Figure()

        # Make a line and connect to data source
        plot.scatter(x='x'
                  , y='y'
                  , line_color="#F46D43"
                  , line_width=6
                  , line_alpha=0.6
                  , source=source)


        # Add list boxes for selecting which columns to plot on the x and y axis
        xaxis_select = Select(title="X axis:", value=numeric_columns[0],
                                   options=numeric_columns, callback=callbackx)

        yaxis_select = Select(title="Y axis:", value=numeric_columns[1],
                                   options=numeric_columns, callback=callbacky)



        # Layout widgets next to the plot                     
        controls = column(xaxis_select,yaxis_select)
        layout = column(
            controls,
            plot,
            sizing_mode = 'scale_width'
        )
        show(layout)
    else: 
        print("sorry not enough columns to make a scatterplot")
except Exception:
    print("ups no csv file found under the url you provided")
os.remove(filename)
`;
params=[{
  name: 'url',
  value: 'https://raw.githubusercontent.com/vincentarelbundock/Rdatasets/master/csv/datasets/iris.csv',
  type: 'string'
}];
intentname="scatterplot";
insertIt(code,intentname,params);



/*

  Analyze CSV - Descriptive statistics

 */

code =`import numpy as np
from IPython.display import Image, display
from IPython.core.display import HTML
import requests
import pandas as pd
import json
import os
import random
import csv
import re
import chardet
import reboting
#data reading and preparation
filename = reboting.readandcleancsv( url )
# Define the data to be used
#display(HTML('<b>'+url+'</b>'))
df = pd.read_csv(filename,sep=';')
os.remove(filename)
#remove special chars of column names
df.columns=df.columns.str.replace('#','')
df.columns=df.columns.str.replace('.','')
df.columns=df.columns.str.replace(':','')
df.columns=df.columns.str.replace('"','')
df.columns=df.columns.str.replace(' ','')
pd.options.display.float_format = '{:,.2f}'.format
display(HTML('<h1>First Lines of the Dataset</h1>'))
display(df.head())   
display(HTML('<h1>Some Indicators</h1>'))
display(df.describe(include='all'))
#except Exception:
#    print("ups no csv file found under the url you provided")
`;
params=[{
  name: 'url',
  value: 'https://raw.githubusercontent.com/vincentarelbundock/Rdatasets/master/csv/datasets/iris.csv',
  type: 'string'
}];
intentname="analyze_csv";
insertIt(code,intentname,params);



/*

  Maps

 */
code =`import IPython
import reboting
data_desc = {
    "name" : name,
    "description" : description,
    "publisher" : publisher,
    "portal" : portal,
    "url": url,
    "user_id" : "pythonscript"
}
slug = reboting.checkforknowncsv(data_desc = data_desc)
url = 'https://doh.23degrees.io/view/'+slug
iframe= '<iframe src="' + url + '" allowfullscreen frameborder="0" ></iframe>'
IPython.display.HTML(iframe)
`;
params=[
  {
    name: 'url',
    value: 'http://www.wien.gv.at/politik/wahlen/ogd/nr131_99999999_9999_spr.csv',
    type: 'string'
  },
  {
    name : 'name',
    value: 'kein name angegeben',
    type: 'string'
  },
  {
    name: 'description',
    value: 'keine Beschreibung vorhanden',
    type: 'string'
  },
  {
    name: 'publisher',
    value: 'kein Publisher angegeben',
    type: 'string'
  },
  {
    name: 'portal',
    value: 'kein Portal angegeben',
    type: 'string'
  }
];
intentname="visualize";
insertIt(code,intentname,params);


code =`import IPython
import reboting
print("userid: "+user_id)
data_desc = {
    "name" : name,
    "description" : description,
    "publisher" : publisher,
    "portal" : portal,
    "url": url,
    "user_id" : user_id
}
slug = reboting.checkforknowncsv(data_desc = data_desc)
url = 'https://doh.23degrees.io/view/'+slug
iframe= '<iframe src="' + url + '" allowfullscreen frameborder="0" ></iframe>'
IPython.display.HTML(iframe)
`;
params=[
  {
    name: 'url',
    value: 'http://www.wien.gv.at/politik/wahlen/ogd/nr131_99999999_9999_spr.csv',
    type: 'string'
  },
  {
    name : 'name',
    value: 'kein name angegeben',
    type: 'string'
  },
  {
    name: 'description',
    value: 'keine Beschreibung vorhanden',
    type: 'string'
  },
  {
    name: 'publisher',
    value: 'kein Publisher angegeben',
    type: 'string'
  },
  {
    name: 'portal',
    value: 'kein Portal angegeben',
    type: 'string'
  },
  {
    name: 'user_id',
    value: 'unknown',
    type: 'string'
  }
];
intentname="show_random_visual";
insertIt(code,intentname,params);




