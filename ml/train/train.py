from sklearn.neural_network import MLPRegressor
import numpy as np
import pandas
from numpy import genfromtxt
import pickle
import bz2
import os
import urllib.parse
import http.client
import time
import http.server
import requests
import argparse
from cosmos_reader import run_query

class SimpleRequestHandler(http.server.BaseHTTPRequestHandler):
    

    
    model = None
    ##### LOAD MODEL ##########
    if os.path.exists('model.pkl.bz'):
        file = bz2.BZ2File('model.pkl.bz','rb')
        model = pickle.load(file)
        file.close()
        
        print('starting')

    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.end_headers()

    def save_to_storage():
            import os, uuid, sys
            from azure.storage.blob import BlockBlobService, PublicAccess
            try:
                storage_account_name = os.environ['STORAGE_ACCT_NAME']
                storage_account_key = os.environ['STORAGE_ACCT_KEY']
                container_name = os.environ['BLOB_CONTAINER_NAME']
                print(storage_account_name)
                print(storage_account_key)
                print(container_name)
                print('running sample')
                # Create the BlockBlockService that is used to call the Blob service for the storage account
                block_blob_service = BlockBlobService(account_name=storage_account_name, account_key=storage_account_key)

                # Create a file in Documents to test the upload and download.
                local_path=''
                local_file_name ="model.pkl.bz"
                full_path_to_file =os.path.join(local_path, local_file_name)

                print("Temp file = " + full_path_to_file)
                print("\nUploading to Blob storage as blob" + local_file_name)

                # Upload the created file, use local_file_name for the blob name
                block_blob_service.create_blob_from_path(container_name, str(int(time.time())) + '.pkl.bz' , full_path_to_file)

                # delete old models
                generator = block_blob_service.list_blobs(container_name)
                print(type(generator))
                list_blobs = []
                for blob in generator:
                    list_blobs.append(blob.name)
                list_blobs = sorted(list_blobs, reverse=True)
                if len(list_blobs) > 3:
                    for outdated_blob_name in list_blobs[3:]:
                        block_blob_service.delete_blob(container_name, outdated_blob_name)


            except Exception as e:
                print('i am here uh oh')
                print(e)

    def do_POST(self):
        print (self.path)
        
        # receiving new data
        if self.path == '/data':
            ######### FETCH INPUTS ###############
            import os
            HOST = os.environ['HOST']
            MASTER_KEY = os.environ['MASTER_KEY']
            DATABASE_ID = os.environ['DATABASE_ID']
            COLLECTION_ID = os.environ['COLLECTION_ID']
            print(HOST, MASTER_KEY, DATABASE_ID, COLLECTION_ID)
            x, y = run_query('SELECT * FROM server s', HOST, MASTER_KEY, DATABASE_ID, COLLECTION_ID)
            

            ########## TRAINING ###################
            n = SimpleRequestHandler.model.fit(x,y)

            ####### SAVEMODEL ###########

            file = bz2.BZ2File('model.pkl.bz','wb')
            SimpleRequestHandler.model = n
            pickle.dump(n, file)
            file.close()
            print('trying to save to storage')
            SimpleRequestHandler.save_to_storage()
            predict_service_ip = os.environ['PREDICT_SERVICE_IP']
            conn = http.client.HTTPConnection(predict_service_ip)
            conn.request("POST", "model", {},{})
            self.send_response(200)
            self.end_headers()
                        
            
def run(server_class=http.server.HTTPServer,
    handler_class=SimpleRequestHandler):
    server_address = ('0.0.0.0', 8000)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

run()




