import pickle
from sklearn.neural_network import MLPRegressor

with open('model', 'rb') as f:
	model = pickle.load(f)
	print(type(model))