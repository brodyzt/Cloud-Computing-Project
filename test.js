// sends a row of data to blob storage for testing

var iotHubName = 'cowzure-hub';
var storageAccountName = 'cowzure';
var storageAccountKey = 'oZvIVIcXwxhXM/k8pFMhfkLopRAikmMRoFe5sVjcjm8abQCt/2bNyDlT+RZZDzyHI9hB7yQlFKBm+P0oJvkPQg==';

// Upload a row of data to blob storage
var azure = require('azure-storage');
var blobService = azure.createBlobService(storageAccountName, storageAccountKey);

//createBlockBlobFromLocalFile(container: string, blob: string, localFileName: string)
//container: The container name.
//blob: The blob name.
//localFileName: The local path to the file to be uploaded.
blobService.createBlockBlobFromLocalFile('cow_data', 'cow_1.csv', 'data/cow_1.csv', (err, result, response) => {
    if (err) {
        console.log('Error uploading blob: ' + err);
    }
    else {
        console.log("Blob uploaded");

        // Get information about cow_sensor_0001 from cameras.js
        var fs = require('fs');
        var sensors = JSON.parse(fs.readFileSync('sensors.json', 'utf8'));
        var sensor = sensors.find(o => o.deviceId === 'cow_sensor_0001');

        // Send an event to the IoT hub and include the blob's URL
        var Message = require('azure-iot-device').Message;
        var connectionString = 'HostName=' + iotHubName + '.azure-devices.net;DeviceId=' + sensor.deviceId + ';SharedAccessKey=' + sensor.key;
        var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
        var client = clientFromConnectionString(connectionString);

        client.open(err => {
            if (err) {
                console.log('Error connecting to IoT hub: ' + err);
            }
            else {
                var data = {
                    'deviceId' : sensor.deviceId,
                    'cowId' : sensor.cowId,
                    'url' : 'https://' + storageAccountName + '.blob.core.windows.net/cow_data/cow_1.csv',
                    'timestamp' : new Date().toISOString()
                };

                var message = new Message(JSON.stringify(data));

                client.sendEvent(message, (err, result) => {
                    if (err) {
                        console.log('Error sending event: ' + err);
                    }
                    else {
                        console.log("Event transmitted");                
                    }
                });
            }
        });
    }
});