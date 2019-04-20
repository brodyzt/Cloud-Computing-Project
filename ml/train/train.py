from sklearn.neural_network import MLPRegressor
import numpy as np
import pandas
from numpy import genfromtxt
import pickle
import bz2
import os
import urllib.parse
import http.client
# todo pull based on time
# todo figure out format
import http.server
import requests

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
            conn = http.client.HTTPConnection("localhost", 8080) # TODO change
            conn.request("POST", "/model", urllib.parse.urlencode(params), headers)

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
            # TODO fix this
            z_p = pandas.read_csv('11457_new.csv')
            a_p = pandas.read_csv('11065_new.csv')
            z_c = z_p.values
            a_c = a_p.values

            ############ INPUTS #####################


            # x = [] of [] : rumination-raw-data, weekly_ruminatino_average, raw_activity,daily_activity
            x = np.concatenate((z_c,a_c))

            # y = # hours to calving
            y = np.ndarray.flatten(np.concatenate((z_p[['period_to_calving']].values,a_p[['period_to_calving']].values)))

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
            
            
def run(server_class=http.server.HTTPServer,
    handler_class=SimpleRequestHandler):
    server_address = ('0.0.0.0', 8000)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

run()




