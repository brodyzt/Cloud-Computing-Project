#USING PYTHON3
# http://aihelpwebsite.com/Blog/EntryId/1022/Retraining-an-Azure-Machine-Learning-Application
import urllib.request
# If you are using Python 3+, import urllib instead of urllib2

import json 

data =  {
            "Resources": [
                {
                    "Name": "credit risk experiment - 2 (predictive) [trained model]",
                    "Location": 
			            {
                            # Replace these values with the ones that specify the location of the new value for this resource. For instance,
                            # if this resource is a trained model, you must first execute the training web service, using the Batch Execution API,
                            # to generate the new trained model. The location of the new trained model would be returned as the "Result" object
                            # in the response. 

                            # location of outpu1 from the retrainer service
                            "BaseLocation": "https://janicejanicestorage.blob.core.windows.net/",
                            "RelativeLocation": "blob/output.ilearner",
                            "SasBlobToken": "?sv=2015-02-21&sr=b&sig=HVfRXkmupYU7NH7Tcwj3J1a%2BVKoJUVMiByD%2F5hT7H88%3D&st=2019-03-21T22%3A13%3A05Z&se=2019-03-22T22%3A18%3A05Z&sp=r"

			            }
                }
            ]
        }

body = str.encode(json.dumps(data))

url = "https://management.azureml.net/workspaces/28533832950449d9a803dd6d510149c0/webservices/8b19dfb8842d46f49d5aa817538363ca/endpoints/retrained"
api_key = "J4WBUEPBGEZqFa+koK3wTMVmpCLXWaWFdPITIgaXjciPQa4yg1GHndonOXig8rUChk34xi8rKCZZgir+k709+Q==" # Replace this with the API key for the web service -- PREDICTIVE?
headers = {'Content-Type':'application/json', 'Authorization':('Bearer '+ api_key)}

# req = urllib2.Request(url, body, headers)
# req.get_method = lambda: 'PATCH'
# response = urllib2.urlopen(req)

# If you are using Python 3+, replace urllib2 with urllib.request in the above code:
req = urllib.request.Request(url, body, headers) 
req.get_method = lambda: 'PATCH'
response = urllib.request.urlopen(req)

result = response.read()
print(result) 