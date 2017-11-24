import requests
import pandas as pd
import json
import os
import IPython
import random
import csv
import re
import chardet
import numpy

class CouldNotDownloadFileException(Exception):
    pass
class CsvDownloadAndParsingException(Exception):
    pass
class CouldntSaveDataException(Exception):
    pass
class CouldntCreateVisualException(Exception):
    pass
class DataTooBigException(Exception):
    pass

#custom request encoder for json serialization when sending data
class MyJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, numpy.integer):
            return int(obj)
        elif isinstance(obj, numpy.floating):
            return float(obj)
        elif isinstance(obj, numpy.ndarray):
            return obj.tolist()
        else:
            return super(MyJsonEncoder, self).default(obj)


def checkforknowncsv( data_desc ):
    #http://reboting:3000
    #ask reboting if we know the data -> if not create data and return id
    #we have 3 routes 1 just saves the data 
    #we should save the metadata though after parsing the data if its not known
    #especially columns and potentially if we have some field for geodata -> so if we can map it
    #also if it is possible to create barchart or map    
    requestOBJ = {
        "type" : "checkforknowncsv",
        "userid": data_desc["user_id"],
        "url" : data_desc["url"]
    }
    r = requests.post("http://reboting:3000/rb/actions", json=requestOBJ)
    resp = r.json()
    if resp["exists"]:
        visual = resp["slug"]
        return visual
    else:
        print("it doesntexists")
        slug = readCleanChart( data_desc )  
        return slug;
    
def readCleanChart( data_desc ):
    filename=""
    filename = readandcleancsv( data_desc["url"] )
    #except NoDialectFoundEception as e:
    #    raise e
    print("filename: "+filename)
    #get column and row descriptions
    df = pd.read_csv(filename,sep=';', thousands='.', decimal=',')
    print("df loaded")
    #santize column headers
    df.columns=df.columns.str.replace('#','')
    df.columns=df.columns.str.replace('.','')
    df.columns=df.columns.str.replace(':','')
    df.columns=df.columns.str.replace('"','')
    df.columns=df.columns.str.replace(' ','')
    districtCode =""
    if 'DISTRICT_CODE' in df.columns:
        districtCode="DISTRICT_CODE"
        df['DISTRICT_CODE']='G'+ df.DISTRICT_CODE.map(str)
    if 'SUB_DISTRICT_CODE' in df.columns:
        districtCode='SUB_DISTRICT_CODE'
        df['SUB_DISTRICT_CODE']='G'+ df.SUB_DISTRICT_CODE.map(str)
    #Lau codes have to be 5 digits and a G in front
    if 'LAU_CODE' in df.columns:
        districtCode='LAU_CODE'
        df['LAU_CODE']='G'+ df.LAU_CODE.map(str)
    if 'LAU2_CODE' in df.columns:
        districtCode='LAU2_CODE'
        df['LAU2_CODE']='G'+ df.LAU2_CODE.map(str)
    if 'COMMUNE_CODE' in df.columns:
        districtCode='COMMUNE_CODE'
        df['COMMUNE_CODE']='G'+ df.COMMUNE_CODE.map(str)
    districtCodeList = ["DISTRICT_CODE","SUB_DISTRICT_CODE","LAU_CODE","LAU2_CODE","COMMUNE_CODE"]
    #fill nan values
    df.fillna(0,inplace=True)
    data_dict = df.to_dict(orient='records')
    #delete temp file
    os.remove(filename)
    #check if data is to big
    if len(df.index) > 20000:
        raise DataTooBigException("lines: "+str(len(df.index))+" url: "+data_desc["url"])
    requestOBJ = {
            "data" : data_dict,            
            "parameters": {
                "source": "manual",
                "provider": "reboting",
                "layer": "choropleth"
            }
    }
    #print(json.dumps(requestOBJ))
    #r = requests.post("http://52.166.116.205:2301/save_data", json=requestOBJ)
    r = requests.post("http://52.166.116.205:2301/save_data", data=json.dumps(requestOBJ, cls=MyJsonEncoder), headers={'Content-Type': 'application/json'})
    with open('request_data.tmp', 'w') as outfile:
        json.dump(requestOBJ, outfile, cls=MyJsonEncoder)
    resp = r.json()
    #print(resp)
    #got a data id 
    try:
        print(resp['data']['_id'])
    except Exception as e:
        print(resp)
        raise CouldntSaveDataException(data_desc["url"])
    #create random visual   
    numeric_columnlist = list(df._get_numeric_data().columns)
    string_columnlist=[item for item in list(df.columns) if item not in numeric_columnlist and item!='' and item not in districtCodeList and item!='YEAR' and item!='REF_YEAR']
    #test if there is a time part
    timeDimension = False
    timeField = None
    if 'REF_YEAR' in df.columns:
        timeDimension = True
        timeField="REF_YEAR"
    if 'YEAR' in df.columns:
        timeDimension = True
        timeField="YEAR"
    numeric_columnlist=[item for item in numeric_columnlist if item!='' and item not in districtCodeList and item!='YEAR' and item!='REF_YEAR']
    #prepare request object
    external_data_id = resp['data']['_id']
    requestOBJ = {
        "type" : "createdatasource",
        "userid": data_desc["user_id"],
        "payload" : {
            "url" : data_desc["url"],
            "user_id" : data_desc["user_id"],
            "data_id" : resp['data']['_id'],
            "timeDimension" : timeDimension,
            "timeField" : timeField,
            "columnlist" : list(df.columns),
            "isoField" : districtCode,
            "numericColumnlist" : numeric_columnlist,
            "stringColumnlist" : string_columnlist,
            "dataDesc" : data_desc,
            "visuals" : []
        }
    }
    #Chart Slug is here !
    r = requests.post("http://reboting:3000/rb/actions", json=requestOBJ)
    resp = r.json()
    if resp["status"] == "ok":
        print(resp["id"])
        #slug
        print(resp["slug"])
        return resp["slug"]
    else:
        print("error while saving datasource")
        raise CouldntCreateVisualException("on the reboting server something happened")

#standard csv reading and cleaning
def readandcleancsv( url ):
    print("downloading file")
    try: 
        r = requests.get(url)
    except Exception:
        raise CsvDownloadAndParsingException("for file from url:"+url)
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
            #print("exception"+e)
            raise CsvDownloadAndParsingException("for file from url: "+url)
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
    
    
#    
#
#           DEPRECATED FROM HERE
#
def createRandomChart( datacontext):
    #last numeric field as entity field for know.
    districtCode = datacontext["isoField"]
    #random choice 50/50
    whichchart = random.choice(["bar","map","map"])
    #create a visual but which one?
    if districtCode!="" and whichchart == "map":
        print("district code exists and random said map")    
        chartRequestOBJ = createMapRequestObject(datacontext) 
        r = requests.post("http://52.166.116.205:2301/create_visual", json=chartRequestOBJ)
        chartRequestOBJ["slug"]=r.json()['slug']
        print("got a slug?")
        print(chartRequestOBJ["slug"])
    else:
        #minimum requirement for a barchart is at list one string and one value column
        print("trying a barchart")
        chartRequestOBJ = createBarChartRequestObject(datacontext) 
        r = requests.post("http://52.166.116.205:2301/create_visual", json=chartRequestOBJ)
        chartRequestOBJ["slug"]=r.json()['slug']
        print("got a slug?")
        print(chartRequestOBJ["slug"])
    return chartRequestOBJ

def createBarChartRequestObject(datacontext):
    valueField = random.choice(datacontext["numericColumnlist"] )
    entityField = datacontext["stringColumnlist"][-1]
    chartRequestOBJ = {
            "meta": {
                "name": datacontext["dataDesc"]["name"] + " "+valueField,
                "sourceOrganization": datacontext["dataDesc"]["publisher"],
                "source": datacontext["dataDesc"]["publisher"],
                "description": datacontext["dataDesc"]["description"],
                "publisher_name": datacontext["dataDesc"]["publisher"],
                "publisher_homepage": datacontext["dataDesc"]["portal"],
                "publisher_contact": "EMAIL ADRESS OF PUBLISHER",
                "publisher_tags": ["City of Vienna", "Demographie", "Population"],
                "accessUrl": "/api/data/",
                "accessFormat": "json",
                "frequency": "Probably no Data Update",
                "license": "OpenData",
                "citation": "INSERT CITATION IF AVAILABLE",
                "isoField": "null",
                "entityField": entityField,
                "timeField": datacontext["timeField"],
                "timeDimension": datacontext["timeDimension"],
                "timeUnit": "year",
                "valueField": valueField,
                "unit": "Value:",
                "colors": ["#ffc971", "#ffb627", "#ff9505", "#e2711d", "#cc5803"],
                "legendtitles": ["low", "med-low", "med", "med-high", "high"],
                "tooltip": [{"label": valueField, "field": "data:"+valueField }],
                "theme": "light"
            },
            "parameters": {
                "source": "manual",
                "provider": "reboting",
                "layer": "chart",
                "data_id": datacontext["data_id"]
            }
        }
    return chartRequestOBJ
def createMapRequestObject(datacontext):
    valueField = random.choice(datacontext["numericColumnlist"] )
    entityField = datacontext["stringColumnlist"][-1]
    districtCode = datacontext["isoField"]
    chartRequestOBJ = {
            "meta": {
                "name": datacontext["dataDesc"]["name"] + " "+valueField,
                "sourceOrganization": datacontext["dataDesc"]["publisher"],
                "source": datacontext["dataDesc"]["publisher"],
                "description": datacontext["dataDesc"]["description"],
                "publisher_name": datacontext["dataDesc"]["publisher"],
                "publisher_homepage": datacontext["dataDesc"]["portal"],
                "publisher_contact": "EMAIL ADRESS OF PUBLISHER",
                "publisher_tags": ["City of Vienna", "Demographie", "Population"],
                "accessUrl": "/api/data/",
                "accessFormat": "json",
                "frequency": "Probably no Data Update",
                "license": "OpenData",
                "citation": "INSERT CITATION IF AVAILABLE",
                "isoField": districtCode,
                "entityField": entityField,
                "timeField": datacontext["timeField"],
                "timeDimension": datacontext["timeDimension"],
                "timeUnit": "year",
                "valueField": valueField,
                "unit": "Value:",
                "colors": ["#ffc971", "#ffb627", "#ff9505", "#e2711d", "#cc5803"],
                "legendtitles": ["low", "med-low", "med", "med-high", "high"],
                "tooltip": [{"label": valueField, "field": "data:"+valueField }],
                "theme": "light"
            },
            "parameters": {
                "source": "manual",
                "provider": "reboting",
                "layer": "choropleth",
                "data_id": datacontext["data_id"]
            }
        }
    return chartRequestOBJ