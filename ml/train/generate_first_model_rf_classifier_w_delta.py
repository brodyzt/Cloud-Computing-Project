from sklearn.ensemble import RandomForestClassifier
import numpy as np
import pandas
from numpy import genfromtxt
import pickle
import bz2
import os
import urllib.parse
import time

'''base case: first two csvs'''
np.set_printoptions(threshold=np.nan)


z_p = pandas.read_csv('../../fake_cow_data/705.csv')
a_p = pandas.read_csv('../../fake_cow_data/983.csv')
y_unflattened = np.concatenate((z_p[['period_to_calving']].values,a_p[['period_to_calving']].values))
# J = np.ndarray.flatten(np.concatenate((y, z_p[['period_to_calving']])))
# print(J)
z_p = z_p.drop(columns=['period_to_calving'])
a_p = a_p.drop(columns=['period_to_calving'])

z_p = (z_p[['Daily_Rumination']].values/z_p[['Weekly_Rumination_Average']].values)**0.01
a_p = (a_p[['Daily_Rumination']].values/a_p[['Weekly_Rumination_Average']].values)**0.01


# x = [] of [] : rumination-raw-data, weekly_ruminatino_average, raw_activity,daily_activity
X = np.concatenate((z_p,a_p))

import glob
for filename in glob.glob('../../fake_cow_data/*.csv'):
    if ('/705.csv' in filename) or '/983.csv' in filename or 'ID.csv' in filename:
        continue
    x_p = pandas.read_csv(filename)
    y_p = x_p[['period_to_calving']].values
    daily_rum = x_p[['Daily_Rumination']]

    weekly_rum_avg = x_p[['Weekly_Rumination_Average']]
    x_p = (daily_rum.values/weekly_rum_avg.values)

    # x_p = x_p[['Daily_Rumination'/'Weekly_Rumination_Average']**0.01,'Weekly_Rumination_Average','Raw_Activity_Data','Daily_activity']]
    # x_c = x_p.values
    print(x_p.shape)
    X = np.concatenate((X, x_p))
    y_unflattened = np.concatenate((y_unflattened, y_p))
    nan_idx = np.isnan(X).any(axis=1)
    X = X[~nan_idx]
    y_unflattened = y_unflattened[~nan_idx]

y = np.ndarray.flatten(y_unflattened)
print('hereee')
# print(X)

# # splitting X and y into training and testing sets 
from sklearn.model_selection import train_test_split 
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=1) 


y_train = [1 if y >= -10 else 0 for y in y_train ]
y_test = [1 if y >= -10 else 0 for y in y_test ]

# could overfit bc "safer" to guess 0

# # RandomizedSearchCV
# from sklearn.model_selection import RandomizedSearchCV
# from scipy.stats import expon
# # Number of trees in random forest
# n_estimators = [int(x) for x in np.linspace(start = 200, stop = 2000, num = 10)]
# # Number of features to consider at every split
# max_features = ['auto', 'sqrt']
# # Maximum number of levels in tree
# max_depth = [int(x) for x in np.linspace(10, 110, num = 11)]
# max_depth.append(None)
# # Minimum number of samples required to split a node
# min_samples_split = [2, 5, 10]
# # Minimum number of samples required at each leaf node
# min_samples_leaf = [1, 2, 4]
# # Method of selecting samples for training each tree
# bootstrap = [True, False]
# # Create the random grid
# random_grid = {'n_estimators': n_estimators,
#                'max_features': max_features,
#                'max_depth': max_depth,
#                'min_samples_split': min_samples_split,
#                'min_samples_leaf': min_samples_leaf,
#                'bootstrap': bootstrap}

rf = RandomForestClassifier(min_samples_split=5, max_features='sqrt', min_samples_leaf=1, n_estimators=2, bootstrap=True, max_depth=30)

# from numpy.random import uniform
# from numpy.linalg import norm
# n_iter = 100
# total = 0
# for i in range(n_iter):
#   rand_pred = uniform(-120, 0, len(y_test))
#   diff = rand_pred - y_test
#   total += norm(diff) ** 2 / len(y_test)

# print(total / n_iter)

rf.fit(X_train, y_train)
# cv_pred = rf.predict(X_test)
# diff = cv_pred - y_test

# print(norm(diff) ** 2 / len(diff))
cv_pred = rf.predict(X_test)
from sklearn.metrics import classification_report
print(classification_report(y_test, cv_pred))


file = bz2.BZ2File(str(int(time.time())) + '.pkl.bz','wb')
pickle.dump(rf, file)
file.close()

#0.9606521398338298
# :)
