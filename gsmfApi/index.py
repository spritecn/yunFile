#coding:utf8

##########
#gsmf comparse in cos for Yun
#use python3.6
#author:spx
##########

import json
import time
from qcloud_cos import cos_auth

appid = 1254107985  #please change to your appid. Find it in Account Info
secret_id = 'AKIDxgAPO79nkRr1wbRUXMwIPHvLXV'   #please change to your API secret id. Find it in API secret key pair
secret_key = 'QbaJlxtYy70d080cFfcNxINCl3'  #please change to your API secret key. Find it in API secret key pair
region = 'sh'
domain = 'fantansy.cn'  #can match *.fantansy.cn usr for cros,refer  

auth = cos_auth.Auth(appid = appid, secret_id = secret_id, secret_key = secret_key)


def get_upload_auth(bucket,key='/'):
    return auth.sign_more(
        bucket = bucket,
        cos_path = key,
        expired= int(time.time())+180
    )

def main_handler(event, context):
    print(event)
    print(f'path={event["path"]}')
    if event["path"] == '/auth/' and domain in event["headers"]['referer']:
        bucket_name = 'gsmfupload'  #your bucket_name
        if 'bucket' in event['queryString']:
            bucket_name = event['queryString']['bucket']
            return {"sign":get_upload_auth(bucket_name,key='/')}
    else:
        print("Received event: " + json.dumps(event, indent = 2)) 
    return("Hello World")