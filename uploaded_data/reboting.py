import requests
import pandas as pd
import json
import os
import IPython
import random
import csv
import re
import chardet

def checkforknowncsv( url ):
    #http://reboting:3000
    requestOBJ = {
        "type" : "checkforknowncsv",
        "userid": "pythonscript",
        "url" : url
    }
    r = requests.post("http://reboting:3000/rb/actions", json=requestOBJ)
    print(r.json());
    return "notknown";
def readandcleancsv( url ):
    r = requests.get(url)
    filename=str(random.getrandbits(64))+".csv.tmp"
    header =[];
    rows=[];
    encoding='utf-8';
    with open(filename, "wb") as code:
        code.write(r.content)
    with open(filename, 'rb') as f:
        encoding = chardet.detect(f.read())['encoding']
    with open(filename, 'r', encoding=encoding) as csvfile:        
        try:
            dialect = csv.Sniffer().sniff(csvfile.read(1024*16), delimiters=';,\t')
        except Exception as e:
            print("exception"+e)
        csvfile.seek(0)
        reader = csv.reader(csvfile, dialect)
        #go through all lines
        #Todo get the header
        #Todo detect dates and get them in a fixed format
        #Todo get Numeric Values and get them in a fixed format  
        #empty string
        for index, entry in enumerate(reader):
            #test for header in first 2 lines
            if( (index==0 or index==1) and len(header) == 0):
                empties = 0;
                for i in entry:
                    if(i==""):
                        empties+=1
                if(empties <= 1):
                    #print("using header at index: "+str(index))
                    header=entry
            else:
                rows.append(entry)
    #amount of rows
    #print(len(rows))
    #amount of columns in header
    #print(len(header))
    with open(filename, 'w') as csvfile:
        writer = csv.writer(csvfile, delimiter=';')
        writer.writerow(header);
        for element in rows:
            writer.writerow(element);
    return filename