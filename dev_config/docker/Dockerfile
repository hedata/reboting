FROM jupyter/datascience-notebook
RUN pip install --upgrade pip
RUN pip install --upgrade plotly==1.9.6
RUN pip install bokeh
ADD install_sampledata.py .
RUN python install_sampledata.py
RUN pip install jupyterlab --upgrade
RUN jupyter serverextension enable --py jupyterlab
RUN pip install git+https://github.com/altair-viz/altair
RUN jupyter nbextension install --sys-prefix --py vega

# start jupyterlab
