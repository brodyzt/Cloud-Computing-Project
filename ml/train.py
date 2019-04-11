from sklearn.neural_network import MLPRegressor
import numpy as np
import pandas
from numpy import genfromtxt
import pickle
import bz2
import os
# todo pull based on time
# todo figure out format
import http.server

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
        print (self.path)
        if self.path == '/data':
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
            ####### SAVE&SEND MODEL ###########

            file = bz2.BZ2File('model.pkl.bz','wb')
            SimpleRequestHandler.model = n
            pickle.dump(n, file)
            file.close()
            
            self.send_response(200)
            self.end_headers()
            self.wfile.write(pickle.dumps(n))

def run(server_class=http.server.HTTPServer,
    handler_class=SimpleRequestHandler):
    server_address = ('', 8000)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

run()




