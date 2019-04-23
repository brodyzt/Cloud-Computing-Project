import http.server
import requests
import pickle
import urllib.parse
import re
import bz2
import os
# note: use HTTP not HTTPS
class SimpleRequestHandler(http.server.BaseHTTPRequestHandler):
    CLOUD_URL = 'http://trainapp/' # TODO Change
    file = bz2.BZ2File('model.pkl.bz','rb')
    model = pickle.load(file)
    # TODO get model

    try:
        r = requests.get(CLOUD_URL+'/model')
        print('ok')
        model_serialized = r.content
        model = pickle.loads(model_serialized)
    except:
        pass

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
        print('posted')
        if self.path == '/model':
            # model_serialized = self.rfile.read(int(self.headers['Content-Length']))
            # # this is identical to the quoed version which is good! type is in STRING
            # quoted_model = urllib.parse.parse_qs(model_serialized)[b'model_serialized'][0].decode('utf-8')
            # print(quoted_model)
            # # now i need to unquote
            # unquoted_model = urllib.parse.unquote_to_bytes(quoted_model)
            # print(unquoted_model)

            import os, uuid, sys
            from azure.storage.blob import BlockBlobService, PublicAccess
            storage_account_name = os.environ['STORAGE_ACCT_NAME']
            storage_account_key = os.environ['STORAGE_ACCT_KEY']
            container_name = os.environ['BLOB_CONTAINER_NAME']
            print(storage_account_name)
            print(storage_account_key)
            print(container_name)
            print('running sample')
            # Create the BlockBlockService that is used to call the Blob service for the storage account
            block_blob_service = BlockBlobService(account_name=storage_account_name, account_key=storage_account_key)
            print('ummm')
            block_blob_service.get_blob_to_path(container_name, 'model.pkl.bz', 'model.pkl.bz')
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