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
nn = MLPRegressor(hidden_layer_sizes=(3), activation='tanh', solver='adam')

n = nn.fit(x, y)


file = bz2.BZ2File('model.pkl.bz','wb')
pickle.dump(n, file)
file.close()