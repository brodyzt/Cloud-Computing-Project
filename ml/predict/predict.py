import http.server
import requests
import pickle
import urllib.parse
import re
import bz2
import os
# note: use HTTP not HTTPS
class SimpleRequestHandler(http.server.BaseHTTPRequestHandler):
    file = bz2.BZ2File('model.pkl.bz','rb')
    model = pickle.load(file)

    def do_GET(self):
        # expects the following format for inputs query param
        # >>> sample_arr = [1, 2]
        # >>> urllib.urlencode([('inputs[]', i) for i in sample_arr])
        # 'inputs%5B%5D=1&inputs%5B%5D=2'
        print(self.path)
        if self.path =='/':
            self.send_response(200)
            self.end_headers()
            return 
        ind = self.path.index('predict?')
        if ind>0:
            
            input_str = self.path[ind+len('predict?'):]
            pattern = re.compile('inputs%5B%5D=(?P<num>[0-9]+)')
            matches = re.findall(pattern, input_str)
            # input dimensions must be 1x(# features)
            input = [[float(x) for x in matches]]
            print(input)
            output = SimpleRequestHandler.model.predict(input)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(str(output[0]).encode('utf-8'))

    def do_POST(self):
        print(self.path)
        if self.path == 'model':
            print('model')
            import os, uuid, sys
            from azure.storage.blob import BlockBlobService, PublicAccess
            storage_account_name = os.environ['STORAGE_ACCT_NAME']
            storage_account_key = os.environ['STORAGE_ACCT_KEY']
            container_name = os.environ['BLOB_CONTAINER_NAME']
            # Create the BlockBlockService that is used to call the Blob service for the storage account
            block_blob_service = BlockBlobService(account_name=storage_account_name, account_key=storage_account_key)

            generator = block_blob_service.list_blobs(container_name)
            print(type(generator))
            list_blobs = []
            for blob in generator:
                list_blobs.append(blob.name)
            list_blobs = sorted(list_blobs, reverse=True) 

            block_blob_service.get_blob_to_path(container_name, list_blobs[0], 'model.pkl.bz')
            file = bz2.BZ2File('model.pkl.bz','rb')
            SimpleRequestHandler.model = pickle.load(file)
            file.close()

            self.send_response(200)
            self.end_headers()

def run(server_class=http.server.HTTPServer,
    handler_class=SimpleRequestHandler):
    server_address = ('0.0.0.0', 8080)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

run()