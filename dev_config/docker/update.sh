#!/usr/bin/env bash
docker pull jupyter/datascience-notebook
docker build -t hedata/dabi:v001 .
docker push hedata/dabi:v001
