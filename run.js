'use strict';

var iotHubName = 'cowzure-hub';
var storageAccountName = 'cowzure';
var storageAccountKey = 'oZvIVIcXwxhXM/k8pFMhfkLopRAikmMRoFe5sVjcjm8abQCt/2bNyDlT+RZZDzyHI9hB7yQlFKBm+P0oJvkPQg==';

class Sensor {
    //TODO: put in real data here
    constructor(id, cowId, key, csv) {
        this._id = id;
        this._cowId = cowId;
        this._key = key;
        this._csv = csv;
        this._ready = false;
        //current row in the csv file to send
        this._index = 0;
        //will store all rows of the csv
        this._rows = []; 
    }

    get id() {
        return this._id;
    }

    connect(iotHubName, storageAccountName, storageAccountKey, callback) {
        // Connect to blob storage
        var azure = require('azure-storage');
        this._storageAccountName = storageAccountName;
        this._blobService = azure.createBlobService(storageAccountName, storageAccountKey);

        // Connect to the IoT hub
        var connectionString = 'HostName=' + iotHubName + '.azure-devices.net;DeviceId=' + this._id + ';SharedAccessKey=' + this._key;
        var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
        this._client = clientFromConnectionString(connectionString);

        this._client.open((err) => {
            if (!err) {
                this._ready = true;
            }

            callback(this._ready);
        });
    }

    start() {
        // Register first callback for 5 to 20 seconds
        setTimeout(this.timer, (Math.random() * 5000) + 1000, this);
    }

    // add a function to read from csv and return the right row
    loadRows() {
        //keep the counter of how many rows have been read
        var i = 0;
        const results = [];
        fs.createReadStream(this._csv)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            this._rows = results;
        });
    }

    getRow() {
        var row_to_return = this._rows[this._index];
        this._index = this._index + 1;
        return row_to_return;
    }

    timer(self) {
        if (self._ready === true) {
            // "Trigger" the sensor with the next row to send
            //TODO: this should be an actual cow
            console.log(self._index);
            var x = self.getRow(self._csv);
            console.log(x);
            //self.getRow(self._csv);
            

            // var index = Math.floor(Math.random() * self._files.length);
            // self.trigger(self._files[index], (err, result) => {});

            // // Register another callback for 5 to 20 seconds
            setTimeout(self.timer, (Math.random() * 5000) + 1000, self);
        }
    }
    //replace imageFileName with csvRow
    trigger(imageFileName, callback) {
        if (this._ready === true) {
            // Upload the image to blob storage
            this.upload(imageFileName, (err, result) => {
                if (err) {
                    callback(err, result);
                } else {
                    // Send an event to the IoT hub
                    this.send(imageFileName, (err, result) => {
                        console.log(this._id + ': https://' + this._storageAccountName + '.blob.core.windows.net/photos/' + imageFileName);
                        callback(err, result);
                    });
                }
            });
        }
    }

    upload(imageFileName, callback) {
        this._blobService.createBlockBlobFromLocalFile('photos', imageFileName, 'photos/' + imageFileName, (err, result) => {
            callback(err, result);
        });
    }

    send(imageFileName, callback) {
        var Message = require('azure-iot-device').Message;

        var data = {
            'deviceId': this._id,
            'latitude': this._latitude,
            'longitude': this._longitude,
            'url': 'https://' + this._storageAccountName + '.blob.core.windows.net/photos/' + imageFileName,
            'timestamp': new Date().toISOString()
        };

        var message = new Message(JSON.stringify(data));

        this._client.sendEvent(message, (err, result) => {
            callback(err, result);
        });
    }
}

// Load image file names
var fs = require('fs');
// Load jQuery csv library
var csv = require('csv-parser');
var async = require('async');

//https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback
//files is the name of all the files in the directory
fs.readdir('fake_cow_data', (err, files) => {
    // Create an array of sensors
    var sensors = JSON.parse(fs.readFileSync('sensors.json', 'utf8')).map(
        sensor => new Sensor(
            sensor.deviceId,
            sensor.cowId,
            sensor.key,
            'fake_cow_data/' + (files.filter((file) => file === (sensor.cowId + '.csv'))[0])
        )
    );

    // Start the cameras
    sensors.forEach(sensor => {
        console.log(sensor);
        sensor.loadRows();
        sensor.connect(iotHubName, storageAccountName, storageAccountKey, status => {
            if (status === true) {
                console.log(sensor.id + ' connected');
                sensor.start();
            } else {
                console.log(sensor.id + ' failed to connect');
            }
        })
    });
});