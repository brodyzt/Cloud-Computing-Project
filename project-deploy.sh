# Print code as executed
set -v
export PATH=~/.npm-global/bin:$PATH

############################# Building Edge Server #######################################

echo "Creating resource group to contain edge server resources"
az group create --name edge-server-group \
    --location centralus

echo "Creating storage account for edge server"
az storage account create --name edgeserverstorage \
    --location centralus \
    --resource-group edge-server-group \
    --sku Standard_LRS

echo "Creating function app for stream analytics"
az functionapp create --resource-group edge-server-group \
    --consumption-plan-location centralus \
    --name cowzureEdgeFunctionServer \
    --storage-account edgeserverstorage \
    --runtime node

echo "Deploing streaming hub function hub"
pushd "function-servers/"
func azure functionapp publish cowzureEdgeFunctionServer
popd

echo "Creating database account"
az cosmosdb create --name edgeserverdatabaseaccount \
    --resource-group edge-server-group

echo "Deploying database storage for edge server"
az cosmosdb database create \
    --db-name edgeserverdatabase \
    --name edgeserverdatabaseaccount \
    --resource-group edge-server-group

echo "Creating collection for regular data received event"
az cosmosdb collection create --collection-name regularsensordatacollection \
    --db-name edgeserverdatabase \
    --resource-group-name edge-server-group \
    --name edgeserverdatabaseaccount

echo "Creating IoT Hub"
az iot hub create --name cowzureIoTHub \
    --resource-group edge-server-group \
    --location centralus \
    --sku B1

echo "Creating Stream Analytics Job"
pwsh -c New-AzStreamAnalyticsJob \
  -ResourceGroupName edge-server-group \
  -File "streamAnalyticsJobDefinition.json" \
  -Name edgestreamanalyticsjob \
  -Force

echo "Creating Stream Analytics Input"
pwsh -C New-AzStreamAnalyticsInput \
    -ResourceGroupName "edge-server-group" \
    -JobName "edgestreamanalyticsjob" \
    -File "stream-analytics\input-template.json" \
    -Name "sensorinput"


############################# Building Backend Server #######################################

echo "Creating resource group to contain main server resources"
az group create --name backend-server-group --location westus

