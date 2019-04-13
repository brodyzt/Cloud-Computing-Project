# Print code as executed
set -v

############################# Building Edge Server #######################################

echo "Creating resource group to contain edge server resources"
az group create --name edge-server-group --location centralus

echo "Creating storage account for edge server"
az storage account create --name edgeserverstorage --location centralus --resource-group edge-server-group --sku Standard_LRS

echo "Creating IoT Hub"
az iot hub create --name cowzureIoTHub --resource-group edge-server-group --location centralus --sku B1

echo "Creating function app for stream analytics"
az functionapp create --resource-group edge-server-group --consumption-plan-location centralus \
--name sensorDataReceivedFunction --storage-account  edgeserverstorage --runtime node

echo "Deploing streaming hub function hub"
pushd "function-servers/"
func azure functionapp publish sensorDataReceivedFunction
popd

echo "Deploying database storage for edge server"
az cosmosdb create --name edgeserverdatabase --resource-group edge-server-group

############################# Building Backend Server #######################################

echo "Creating resource group to contain main server resources"
az group create --name backend-server-group --location westus

