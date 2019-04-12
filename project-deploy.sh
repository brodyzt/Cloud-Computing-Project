############################# Building Edge Server #######################################

# Create resource group to contain edge server resources
az group create --name edge-server-group --location centralus

# Create storage account for edge server
az storage account create --name edgeserverstorage --location centralus --resource-group edge-server-group --sku Standard_LRS

# Create streaming hub function app
az functionapp create --resource-group edge-server-group --consumption-plan-location centralus \
--name sensor-data-received-function --storage-account  edgeserverstorage --runtime node

# Deploy streaming hub function hub
pushd "sensor-data-received-function"
func azure functionapp publish sensor-data-received-function
popd

############################# Building Backend Server #######################################

# Create resource group to contain main server resources
az group create --name backend-server-group --location westus

