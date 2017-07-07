FROM jupyter/datascience-notebook
RUN pip install --upgrade plotly==1.9.6
RUN pip install bokeh
ADD install_sampledata.py .
RUN python install_sampledata.py
RUN pip install jupyterlab && \
    jupyter serverextension enable --py jupyterlab
# start jupyterlab
