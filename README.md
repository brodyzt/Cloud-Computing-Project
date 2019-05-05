set up predictive service as such https://docs.microsoft.com/en-us/azure/machine-learning/studio/tutorial-part3-credit-risk-deploy
make sure you go to prediction in experiment > deploy as predictive web app
in the web app UI, you should see [predictive]


===================================================
to retrain model, see retrain2.py for script that  the controller interface should use
to access predictions, see request-response api in the ml web services
to update model for predictions, see update.py.. not working yet

Our folder structure is as follows:<br>

* **preprocessing**: contains python scripts we used to preprocess the data. and the original data file.<br>
* **fake_cow_data**: contains a csv file for each cow.<br>
* **fake_cow_data_with_birth**: contains a csv for each cow. Cows that gave birth during the 120 periods we have data for have the line "BIRTH" appended to their csv.<br>
* **evaluation**: contains our evaluation script and stress testing script.<br>
* **sensors**: contains files that: declare our sensors, register them with the IoT hub, and allow them to send data from the cow files. Do node run.js in the terminal to send data from our sensors. <br>

