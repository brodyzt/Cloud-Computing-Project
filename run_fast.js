'use strict';

//version for evaluation. Eliminates timeout for sending data--sends everything instantly

var iotHubName = 'cowzureIoTHub';
var storageAccountName = 'edgeserverstorage';
var storageAccountKey = 'HypTcAnvltXvWEzji9irtCKFLJRZ3xEB+cWOeiOuLBK9X/LMzi3oRnAIJlIuarMQ/evLyj7spaf0Pa9im/f3Pw==';

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
        setTimeout(this.timer, 1, this);
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

    //retrieves the next row to send and increments counter
    getRow() {
        var row_to_return = this._rows[this._index];
        // this._index = this._index + 1;
        return row_to_return;
    }

    //checks the type of the row--either "update" or "birth"
    getEventType() {
        if (this._rows[this._index - 1].ID == 'BIRTH') {
            return "birth";
        }
        else {
            return "update";
        }
    }

    timer(self) {
        if (self._ready === true) {
            // "Trigger" the sensor with the next row to send
            var row = self.getRow(self._csv);

            var should_continue = self.trigger(row, (err, result) => {});

            setTimeout(self.timer, 1, self);

            // // Register another callback for 5 to 20 seconds
            if (should_continue) {
                setTimeout(self.timer, 1, self);
            }
            else {
                console.log('out of data to send');
            }
        }
    }
    //replace imageFileName with csvRow
    trigger(row, callback) {
        if (this._ready === true) {
            // Send an event to the IoT hub
            this.send(row, (err, result) => {
                console.log(this._id + ' sent row #' + this._index);
                callback(err, result);
            });

            //TODO: have it stop when the file is out
            if (this._index == this._rows.length) {
                this._index == 0;
                return true;
            }
            else {
                return true;
            }
        }
    }

    send(row, callback) {
        var Message = require('azure-iot-device').Message;

        var data = {
            'sensorId': this._id,
            'cowId': this._cowId,
            'data': row,
            'timestamp': new Date().toISOString()
        };

        var message = new Message(JSON.stringify(data));
        console.log(message);
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
    //TODO: change to birth type/back
    var sensors = JSON.parse(fs.readFileSync('sensors.json', 'utf8')).map(
        sensor => new Sensor(
            sensor.deviceId,
            sensor.cowId,
            sensor.key,
            'fake_cow_data_with_birth/' + (files.filter((file) => file === (sensor.cowId + '.csv'))[0])
        )
    );

    // Start the cameras
    sensors.forEach(sensor => {
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