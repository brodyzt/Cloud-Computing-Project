# Print code as executed
set -v
set -o noclobber
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

echo "Extracting access key for IoT Hub"
PRIMARY_KEY=`az iot hub policy show --hub-name cowzureIoTHub --name iothubowner | underscore extract primaryKey --outfmt text`
INPUT_TEMPLATE='{ \
    "type": "Microsoft.StreamAnalytics/streamingjobs/inputs", \
    "apiVersion": "2016-03-01", \
    "name": "sensorinput", \
    "dependsOn": [ \
        "[resourceId('Microsoft.StreamAnalytics/streamingjobs', 'edgestreamanalyticsjob')]" \
    ], \
    "properties": { \
        "type": "Stream", \
        "datasource": { \
            "type": "Microsoft.Devices/IotHubs", \
            "properties": { \
                "iotHubNamespace": "cowzureIoTHub", \
                "sharedAccessPolicyName": "iothubowner", \
                "sharedAccessPolicyKey": "'$PRIMARY_KEY'", \
                "endpoint": "messages/events", \
                "consumerGroupName": "$Default" \
            } \
        }, \
        "compression": { \
            "type": "None" \
        }, \
        "serialization": { \
            "type": "Json", \
            "properties": { \
                "encoding": "UTF8" \
            } \
        } \
    } \
}'

echo "Writing Input Template to file"
echo $INPUT_TEMPLATE > stream-analytics/input-template.json

echo "Creating Stream Analytics Input"
pwsh -C New-AzStreamAnalyticsInput \
    -ResourceGroupName "edge-server-group" \
    -JobName "edgestreamanalyticsjob" \
    -File "stream-analytics\input-template.json" \
    -Name "sensorinput" \
    -debug

echo "Creating Stream Analytics Output"
pwsh -C New-AzStreamAnalyticsOutput \
    -ResourceGroupName "edge-server-group" \
    -JobName "edgestreamanalyticsjob" \
    -File "stream-analytics\output-template.json" \
    -Name "functionserveroutput" \
    -debug


############################# Building Backend Server #######################################

echo "Creating resource group to contain main server resources"
az group create --name backend-server-group --location westus

