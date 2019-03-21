set up predictive service as such https://docs.microsoft.com/en-us/azure/machine-learning/studio/tutorial-part3-credit-risk-deploy
make sure you go to prediction in experiment > deploy as predictive web app
in the web app UI, you should see [predictive]


===================================================
to retrain model, see retrain2.py for script that  the controller interface should use
to access predictions, see request-response api in the ml web services
to update model for predictions, see update.py.. not working yet
