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

class SimpleRequestHandler(http.server.BaseHTTPRequestHandler):
    
    retrain = False
    print('set retrain false')
    model = None
    ##### LOAD MODEL ##########
    if os.path.exists('model.pkl.bz'):
        file = bz2.BZ2File('model.pkl.bz','rb')
        model = pickle.load(file)
        file.close()
        retrain = True
        print('set retrain true')

    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.end_headers()
            # self.wfile.write(model_serialized)
        if self.path == '/model':
            if os.path.exists('model.pkl.bz'):
                file = bz2.BZ2File('model.pkl.bz','rb')
                model = pickle.load(file)
                model_serialized = pickle.dumps(model)
                file.close()
                self.send_response(200)
                self.end_headers()
                self.wfile.write(model_serialized)
        elif self.path == '/test': # mimics what the message queue would do to the predictive service
            model_serialized = pickle.dumps(SimpleRequestHandler.model)
            print(model_serialized)
            # print(model_serialized)
            # print(model_serialized.decode('utf-8', 'backslashreplace'))
            # requests.post(CLOUD_URL + '/model', data={'model_serialized':model_serialized.decode('utf-8', 'backslashreplace')})
            params = {'model_serialized': urllib.parse.quote(model_serialized)}
            
            print(params)
            headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
            conn = http.client.HTTPConnection("http://predictapp", 8080) # TODO change
            conn.request("POST", "/model", urllib.parse.urlencode(params), headers)

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
        # time to broadcast the model
        if self.path == '/trigger':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(pickle.dumps(SimpleRequestHandler.model))
        # receiving new data
        elif self.path == '/data':
            ######### FETCH INPUTS ###############
            # hardcoded vals
            # y = # hours to calving
            z_p = pandas.read_csv('11457_new.csv')
            a_p = pandas.read_csv('11065_new.csv')
            y = np.ndarray.flatten(np.concatenate((z_p[['period_to_calving']].values,a_p[['period_to_calving']].values)))
            z_p = z_p.drop(columns=['period_to_calving'])
            a_p = a_p.drop(columns=['period_to_calving'])
            print(z_p)
            print(a_p)
            z_c = z_p.values
            a_c = a_p.values

            ############ INPUTS #####################


            # x = [] of [] : rumination-raw-data, weekly_ruminatino_average, raw_activity,daily_activity
            x = np.concatenate((z_c,a_c))

            

            ########## TRAINING/RETRAIN ###################
            if not SimpleRequestHandler.retrain:
                nn = MLPRegressor(hidden_layer_sizes=(3), 
                                  activation='tanh', solver='adam')

                n = nn.fit(x, y)
                SimpleRequestHandler.retrain = True
            else:
                print('here')
                n = SimpleRequestHandler.model.partial_fit(x,y)
            ####### SAVEMODEL ###########

            file = bz2.BZ2File('model.pkl.bz','wb')
            SimpleRequestHandler.model = n
            pickle.dump(n, file)
            file.close()
            print('trying to save to storage')
            SimpleRequestHandler.save_to_storage()
            self.send_response(200)
            self.end_headers()
        
            
            
def run(server_class=http.server.HTTPServer,
    handler_class=SimpleRequestHandler):
    server_address = ('0.0.0.0', 8000)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

run()




