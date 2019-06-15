#coding:utf-8
#

import re
import sys
from  csv import DictReader


def strOperate(recoderData):
    return recoderData.replace('"','').strip()

def addQuot(i):
    return '"' + i + '"' 

def mncAddZero(mnc):
    if len(mnc) == 1:
        return '0' + mnc
    return mnc

def csv_compare(csv_path):
    #

    #coding Test
    encoding = 'GBK'
    with open(csv_path,'r',encoding=encoding) as tmp:
        try:
           tmp.readline()
        except:
            encoding = "utf-8"

    # init
    db_keys = ['MCC','MNC','NetType','Organisation','Network','PPCIN','AbrevNetName']
    c = []
    


    with open(csv_path,'r',encoding=encoding) as f:
        try:
            csv_reader = DictReader(f)
        except:
            t,v,tb = sys.exc_info()
            c.append(f'{t}:{v}')
            return c
        db_list = open('db.txt','r',encoding='utf-8').readlines()
        c.append(','.join([addQuot(x) for x in ['MCC','MNC','NetType','Organisation','Network','PPCIN','AbrevNetName','Long Name','Short Name']]))
        
        for row in csv_reader:
            try:
                recoderMCC = row['MCC']
                reocderMNC = mncAddZero(row['MNC'])
                recoderPPCIN = strOperate(row['Long Name'])
                recoderAbreNetName = strOperate(row['Short Name'])
            except:
                t,v,tb = sys.exc_info()
                c.append(f'{t}:{v}')
                return c
            for v  in db_list:
                if  f'{recoderMCC}|{reocderMNC}|' in v:
                    result_dict = dict(zip(db_keys,v.strip().replace('"','').split('|')))
                    if recoderPPCIN != result_dict['PPCIN'] or recoderAbreNetName != result_dict['AbrevNetName']:
                        c.append(','.join([addQuot(x) for x in [recoderMCC,reocderMNC,
                        result_dict['NetType'],result_dict['Organisation'],result_dict['Network'],
                        result_dict['PPCIN'],result_dict['AbrevNetName'],recoderPPCIN,recoderAbreNetName]]))
                    break
    return c
                

if __name__ == "__main__":
    csv_com_result = csv_compare("Z99991.csv")
    with open('testresut.csv','w',encoding='gbk') as f:
            for i in csv_com_result:
                print(i)
                f.write((i+'\r\n').encode('GBK','ignore').decode('GBk'))






