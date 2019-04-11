import pickle
from sklearn.neural_network import MLPRegressor

with open('data', 'rb') as f:
	model = pickle.load(f)
	print(type(model))