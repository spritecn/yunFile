#coding:utf-8

##########
#gsmf compare in cos for Yun
#use python3.6
#author:spx
##########

#import json
import locale
from uuid import uuid4
import logging
import urllib
import traceback
import time
from compare import csv_compare
from qcloud_cos import CosClient
from qcloud_cos import DownloadFileRequest
from qcloud_cos import UploadFileRequest

#print(locale.getdefaultlocale())
locale.setlocale(locale.LC_ALL, '')

appid = 12541079  #please change to your appid. Find it in Account Info
secret_id = 'AKIDb0A0bbgxGOPgyBoCGpLMNPDqJhT0Gq'   #please change to your API secret id. Find it in API secret key pair
secret_key = 'AedLpkAQ0nZappb9rGX6KdlVpmUo1'  #please change to your API secret key. Find it in API secret key pair
region = 'sh'

cos_client = CosClient(appid, secret_id, secret_key, region)
logger = logging.getLogger()

def gen_name():
    return uuid4().hex

def cos_download_file(bucket,key):
    #downfile from bucket to /tmp/
    dot_last_name = ''
    try:
        dot_last_name = '.'+ key.split('.')[-1]
    except:
        pass
    try:
        download_local_filename = gen_name() + dot_last_name
        request = DownloadFileRequest(bucket, key, '/tmp/'+download_local_filename)
        download_file_ret = cos_client.download_file(request) 
        if download_file_ret['code'] == 0:
            logger.info("Download file [%s] Success To [%s]" % (key,'/tmp/'+download_local_filename))
            return 1,download_local_filename
        else:
            logger.error("Download file [%s] Failed, err: %s" % (key, download_file_ret['message']))
            return 0,''
    except Exception as e:
        print(e)
        traceback.print_exc()



def main_handler(event,context):
    logger.debug(event)
    bucket = event['Records'][0]['cos']['cosBucket']['name']
    cosobj = event['Records'][0]['cos']['cosObject']['key']
    cosobj = cosobj.replace("/"+str(appid)+"/"+bucket,"")
    key = urllib.parse.unquote_plus(cosobj)
    file_lastName = key.split('.')[-1]
    if file_lastName != 'csv':
        return 'not csv file'
    is_download_success,download_local_filename = cos_download_file(bucket,key)
    if is_download_success:
        csv_com_result = csv_compare('/tmp/'+download_local_filename)
        local_csv_name = gen_name() + '.csv'
        upload_name = ''.join(key.split('.')[0:-1]) + '_' + str(int(time.time())) + '.csv'
        with open('/tmp/'+local_csv_name,'w',encoding='utf_8_sig') as f:
            for i in csv_com_result:
                f.write(i+'\r\n')
        
        up_bucket = 'gsmfdownload'
        up_request = UploadFileRequest(up_bucket,upload_name,'/tmp/'+local_csv_name)
        upload_file_ret = cos_client.upload_file(up_request)
        if upload_file_ret['code'] == 0:
            logger.info("upload file [%s] Success To " % '/tmp/'+local_csv_name)
            return 1
        else:
            logger.error("Upload file [%s] Failed, err: %s" % ('/tmp/'+local_csv_name, download_file_ret['message']))
            return 0
    return 0