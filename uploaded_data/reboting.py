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
class NoVisualsPossible(Exception):
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
#new import route!
def importAsNew (data_desc):
    filename = readandcleancsv( data_desc["url"] )
    #auth token
    #print(os.environ['AUTH_TOKEN'])
    AUTH_TOKEN = os.environ['AUTH_TOKEN']
    #except NoDialectFoundEception as e:
    #    raise e
    #print("filename: "+filename)
    #get column and row descriptions
    df = pd.read_csv(filename,sep=';', thousands='.', decimal=',')
    #print("df loaded")
    #santize column headers
    df.columns=df.columns.str.replace('#','')
    df.columns=df.columns.str.replace('.','')
    df.columns=df.columns.str.replace(':','')
    df.columns=df.columns.str.replace('"','')
    df.columns=df.columns.str.replace(' ','')
    df.columns=df.columns.str.replace('/',' ')
    df.columns=df.columns.str.replace('-',' ')
    districtCode =""   
    districtCodeList = ["LAU_CODE","LAU2_CODE","DISTRICT_CODE","SUB_DISTRICT_CODE","COMMUNE_CODE"]
    for potentialDistrictcode in districtCodeList:
        if potentialDistrictcode in df.columns  and districtCode=="":
            #check if this is a vienna district code and then add +1 to the value 
            #very rudimentary test - from 90100 to 92300
            try:
                df[potentialDistrictcode] = df.apply(
                    lambda row: row[potentialDistrictcode]+1 if row[potentialDistrictcode]>=90100 and row[potentialDistrictcode]<=92300 else row[potentialDistrictcode],
                    axis=1
                )
                df[potentialDistrictcode]='G'+ df[potentialDistrictcode].map(str)
                #is our district code really a district code easy test is it different or only one?
                if df[potentialDistrictcode].nunique() > 2:
                    districtCode=potentialDistrictcode
                    #print(df[potentialDistrictcode][0])
            except Exception as e:
                u=1           
    #fill nan values
    df.fillna(0,inplace=True)
    data_dict = df.to_dict(orient='records')
    #delete temp file
    os.remove(filename)
    #check if data is to big
    if len(df.index) > 20000:
        raise DataTooBigException("lines: "+str(len(df.index))+" url: "+data_desc["url"])        
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
    if len(numeric_columnlist)==0:
        raise NoVisualsPossible(data_desc["url"])
    #ok lets do some quality checks here - we only keep string columns that have a little varience in attributes
    final_string_columnlist=[]
    for item in string_columnlist:
        if df[item].nunique() > 1:
            final_string_columnlist.append(item)
    #what if final string columnlist isnull?
    if len(final_string_columnlist)==0:
        #if we have an isofield add it
        if(districtCode!=""):
            final_string_columnlist.append(districtCode)
    #in fact we only want the string column that has the most chars - it probably is the one having the field
    curlength = 0
    curstrfield = ""
    for item in final_string_columnlist:
        length = df[item].str.len().sum()
        if curlength<length:
            curlength=length
            curstrfield=item
    final_string_columnlist = []
    final_string_columnlist.append(curstrfield)
    if len(final_string_columnlist)==0:
        raise NoVisualsPossible(data_desc["url"])  
    #create visuals on 23degrees server    
    tooltips = [];
    for entry in list(df.columns):
        tooltips.append({"label": entry, "field": "data:"+entry })  
    #print(tooltips)
    requestOBJ = {        
        "meta": {
            "context" : {
                "geonames" : list(data_desc['geolocations'])
            },
            "isPublic" : True,
            "name": data_desc['name'],
            "id": data_desc['url'],
            "sourceOrganization": data_desc['publisher'],
            "source": data_desc['publisher'],
            "description": data_desc['description'],
            "publisher_name": data_desc['publisher'],
            "publisher_homepage": data_desc['portal'],
            "publisher_contact": "erichheil@gmail.com",
            "publisher_tags": ["reboting","erich heil"],
            "accessUrl": "/api/data/",
            "accessFormat": "json",
            "frequency": "Probably no Data Update",
            "license": "Open Data",
            "citation": "INSERT CITATION IF AVAILABLE",
            "isoField": None,
            "entityField": curstrfield,
            "timeField": timeField,
            "timeDimension": timeDimension,
            "time_inputFormat": "YYYY",
            "timeUnit": "year",
            "valueField": numeric_columnlist,
            "unit": "Anzahl",
            "colors": None,
            "tooltip": tooltips
        },       
        "parameters": {
            "user": "erich-heil"
        },
        "data" : data_dict
    }    
    #set iso field if it is not null
    if(districtCode!=""):
        requestOBJ["meta"]["isoField"] = districtCode  
    #print(requestOBJ)
    #with open('request_data.tmp', 'w') as outfile:
    #    json.dump(requestOBJ, outfile, cls=MyJsonEncoder)
    r = requests.post("https://doh.23degrees.io/services/mdc/api/v1/json_import", timeout=None, data=json.dumps(requestOBJ, cls=MyJsonEncoder), headers={'Content-Type': 'application/json', 'Authorization' : 'Bearer '+AUTH_TOKEN})    
    print(r.status_code)
    if(r.status_code == 201):
        resp = r.json();
        visual_amount = resp["data"]["number_of_vizzes"]
        return visual_amount
    else:
        return 0
        
    #resp = r.json()          
    #external_data_id =""
    #external_dataset_id =""
    #external_visuals =[]
    #visual_amount = 0
    #if(resp["status"]=="OK"):
    #    external_visuals = resp["data"]["ContentItem_vizzes"]["slug"]
    #    external_data_id = resp["data"]["DataId"]
    #    external_dataset_id = resp["data"]["ContentItem_ds_id"]
    #    visual_amount = resp["data"]["number_of_vizzes"]
    #else: 
    #    raise CouldntCreateVisualException("on 23degree server something happend: "+resp["message"])
    return True;

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
        try: 
            visual = resp["slug"]
            return visual
        except Exception as e:
            raise NoVisualsPossible(data_desc["url"])
    else:
        #print("it doesntexists")
        slug = readCleanChart( data_desc )  
        return slug;
    
def readCleanChart( data_desc ):
    filename=""
    filename = readandcleancsv( data_desc["url"] )
    #auth token
    #print(os.environ['AUTH_TOKEN'])
    AUTH_TOKEN = os.environ['AUTH_TOKEN']
    #except NoDialectFoundEception as e:
    #    raise e
    #print("filename: "+filename)
    #get column and row descriptions
    df = pd.read_csv(filename,sep=';', thousands='.', decimal=',')
    #print("df loaded")
    #santize column headers
    df.columns=df.columns.str.replace('#','')
    df.columns=df.columns.str.replace('.','')
    df.columns=df.columns.str.replace(':','')
    df.columns=df.columns.str.replace('"','')
    df.columns=df.columns.str.replace(' ','')
    districtCode =""   
    districtCodeList = ["LAU_CODE","LAU2_CODE","DISTRICT_CODE","SUB_DISTRICT_CODE","COMMUNE_CODE"]
    for potentialDistrictcode in districtCodeList:
        if potentialDistrictcode in df.columns  and districtCode=="":
            #check if this is a vienna district code and then add +1 to the value 
            #very rudimentary test - from 90100 to 92300
            try:
                df[potentialDistrictcode] = df.apply(
                    lambda row: row[potentialDistrictcode]+1 if row[potentialDistrictcode]>=90100 and row[potentialDistrictcode]<=92300 else row[potentialDistrictcode],
                    axis=1
                )
                df[potentialDistrictcode]='G'+ df[potentialDistrictcode].map(str)
                #is our district code really a district code easy test is it different or only one?
                if df[potentialDistrictcode].nunique() > 2:
                    districtCode=potentialDistrictcode
                    #print(df[potentialDistrictcode][0])
            except Exception as e:
                u=1           
    #fill nan values
    df.fillna(0,inplace=True)
    data_dict = df.to_dict(orient='records')
    #delete temp file
    os.remove(filename)
    #check if data is to big
    if len(df.index) > 20000:
        raise DataTooBigException("lines: "+str(len(df.index))+" url: "+data_desc["url"])        
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
    if len(numeric_columnlist)==0:
        raise NoVisualsPossible(data_desc["url"])
    #ok lets do some quality checks here - we only keep string columns that have a little varience in attributes
    final_string_columnlist=[]
    for item in string_columnlist:
        if df[item].nunique() > 1:
            final_string_columnlist.append(item)
    #what if final string columnlist isnull?
    if len(final_string_columnlist)==0:
        #if we have an isofield add it
        if(districtCode!=""):
            final_string_columnlist.append(districtCode)
    if len(final_string_columnlist)==0:
        raise NoVisualsPossible(data_desc["url"])
    #in fact we only want the string column that has the most chars - it probably is the one having the field
    curlength = 0
    curstrfield = ""
    for item in final_string_columnlist:
        length = df[item].str.len().sum()
        if curlength<length:
            curlength=length
            curstrfield=item
    final_string_columnlist = []
    final_string_columnlist.append(curstrfield)
    # Deprecated since we start direct
    # Deprecated
    #requestOBJ = {
    #        "data" : data_dict,  
    #        "meta": {        
    #           "id": data_desc["url"]
    #        },
    #        "parameters": {
    #            "user" : "erich-heil"
    #        }
    #}
    #r = requests.post("https://doh.23degrees.io/services/mdc/api/v1/saveData",timeout=None, data=json.dumps(requestOBJ, cls=MyJsonEncoder), headers={'Content-Type': 'application/json', 'Authorization' : 'Bearer '+AUTH_TOKEN})
    #with open('request_data.tmp', 'w') as outfile:
    #    json.dump(requestOBJ, outfile, cls=MyJsonEncoder)
    #resp = r.json()
    #print(resp)
    #got a data id 
    #try:
    #    cz=resp['data']['_id']
    #except Exception as e:
        #print('error while saving data:')
        #print(resp)
    #    raise CouldntSaveDataException(data_desc["url"])
    #external_data_id = resp['data']['_id']
    #create visuals on 23degrees server    
    tooltips = [];
    for entry in list(df.columns):
        tooltips.append({"label": entry, "field": "data:"+entry })  
    #print(tooltips)
    requestOBJ = {
        "data" : data_dict,
        "meta": {
            "isPublic" : True,
            "name": data_desc['name'],
            "id": data_desc['url'],
            "sourceOrganization": data_desc['publisher'],
            "source": data_desc['publisher'],
            "description": data_desc['description'],
            "publisher_name": data_desc['publisher'],
            "publisher_homepage": data_desc['portal'],
            "publisher_contact": "erichheil@gmail.com",
            "publisher_tags": ["reboting","erich heil"],
            "accessUrl": "/api/data/",
            "accessFormat": "json",
            "frequency": "Probably no Data Update",
            "license": "Open Data",
            "citation": "INSERT CITATION IF AVAILABLE",
            "isoField": None,
            "entityField": curstrfield,
            "timeField": timeField,
            "timeDimension": timeDimension,
            "time_inputFormat": "YYYY",
            "timeUnit": "year",
            "valueField": numeric_columnlist,
            "unit": "Anzahl",
            "colors": None,
            "tooltip": tooltips,
            "map_element": {
            "viewport": {
                "desktop": {
                    "center": [
                        13.99,
                        47.88
                    ],
                    "zoom": 7
                },
                "mobile": {
                    "center": [
                        13.99,
                        47.88
                    ],
                    "zoom": 5
                }
            }
            }
        },       
        "parameters": {
            "user": "erich-heil"
        }
    }
    #TODO add special tooltips
    #set iso field if it is not null
    #print("using time: ")
    #print(timeDimension)
    if(districtCode!=""):
        requestOBJ["meta"]["isoField"] = districtCode  
    #print(requestOBJ)
    r = requests.post("https://doh.23degrees.io/services/mdc/api/v1/json_import", timeout=None, data=json.dumps(requestOBJ, cls=MyJsonEncoder), headers={'Content-Type': 'application/json', 'Authorization' : 'Bearer '+AUTH_TOKEN})    
    #print(r.json());    
    resp = r.json()          
    external_data_id =""
    external_dataset_id =""
    external_visuals =[]
    visual_amount = 0
    if(resp["status"]=="OK"):
        external_visuals = resp["data"]["ContentItem_vizzes"]["slug"]
        external_data_id = resp["data"]["DataId"]
        external_dataset_id = resp["data"]["ContentItem_ds_id"]
        visual_amount = resp["data"]["number_of_vizzes"]
    else: 
        raise CouldntCreateVisualException("on 23degree server something happend: "+resp["message"])
    requestOBJ = {
        "type" : "createdatasource",
        "userid": data_desc["user_id"],
        "payload" : {
            "url" : data_desc["url"],
            "user_id" : data_desc["user_id"],
            "data_id" : external_data_id,
            "dataset_id" : external_dataset_id,
            "timeDimension" : timeDimension,
            "timeField" : timeField,
            "columnlist" : list(df.columns),
            "isoField" : districtCode,
            "numericColumnlist" : numeric_columnlist,
            "stringColumnlist" : final_string_columnlist,
            "dataDesc" : data_desc,
            "visuals" : external_visuals,
            "visual_amount" : visual_amount
        }
    }
    #Chart Slug is here !
    r = requests.post("http://reboting:3000/rb/actions", json=requestOBJ)
    resp = r.json()
    if resp["status"] == "ok":
        #print(resp["id"])
        #slug
        print(resp["slug"])
        return resp["slug"]
    else:
        #print("error while saving datasource")
        raise CouldntCreateVisualException("on the reboting server something happened")

#standard csv reading and cleaning
def readandcleancsv( url ):
    #print("downloading file")
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
        headerindex = 0
        curempties = 1000000000000
        tmprows =[];
        try:
            for i,entry in enumerate(reader):
                empties = 0
                if i<=1:
                    for z in entry:
                        if(z==""):
                            empties+=1
                    if(empties<curempties):
                        curempties = empties
                        headerindex=i
                tmprows.append(entry)
        except Exception as e:
            #print("exception"+e)
            raise CsvDownloadAndParsingException("for file from url: "+url)        
        #print("using header at index: "+str(headerindex))
        for index, entry in enumerate(tmprows):
            #print(str(index)+" working on it")
            if index==headerindex:
                header=entry
            if index>headerindex:
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