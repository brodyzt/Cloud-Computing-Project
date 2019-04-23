// 'use strict';

// var iotHubName = 'cowzureIoTHub';
// var storageAccountName = 'edgeserverstorage';
// var storageAccountKey = 'HypTcAnvltXvWEzji9irtCKFLJRZ3xEB+cWOeiOuLBK9X/LMzi3oRnAIJlIuarMQ/evLyj7spaf0Pa9im/f3Pw==';

// class Sensor {
//     //TODO: put in real data here
//     constructor(id, cowId, key, csv) {
//         this._id = id;
//         this._cowId = cowId;
//         this._key = key;
//         this._csv = csv;
//         this._ready = false;
//         //current row in the csv file to send
//         this._index = 0;
//         //will store all rows of the csv
//         this._rows = []; 
//     }

//     get id() {
//         return this._id;
//     }

//     connect(iotHubName, storageAccountName, storageAccountKey, callback) {
//         // Connect to the IoT hub
//         var connectionString = 'HostName=' + iotHubName + '.azure-devices.net;DeviceId=' + this._id + ';SharedAccessKey=' + this._key;
//         var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
//         this._client = clientFromConnectionString(connectionString);

//         this._client.open((err) => {
//             if (!err) {
//                 this._ready = true;
//             }

//             callback(this._ready);
//         });
//     }

//     start() {
//         // Register first callback for 5 to 20 seconds
//         setTimeout(this.timer, (Math.random() * 5000) + 1000, this);
//     }

//     // add a function to read from csv and return the right row
//     loadRows() {
//         //keep the counter of how many rows have been read
//         var i = 0;
//         const results = [];
//         fs.createReadStream(this._csv)
//         .pipe(csv())
//         .on('data', (data) => results.push(data))
//         .on('end', () => {
//             this._rows = results;
//         });
//     }

//     //retrieves the next row to send and increments counter
//     getRow() {
//         var row_to_return = this._rows[this._index];
//         this._index = this._index + 1;
//         return row_to_return;
//     }

//     //checks the type of the row--either "update" or "birth"
//     getEventType() {
//         if (this._rows[this._index - 1].ID == 'BIRTH') {
//             return "birth";
//         }
//         else {
//             return "update";
//         }
//     }

//     timer(self) {
//         if (self._ready === true) {
//             // "Trigger" the sensor with the next row to send
//             var row = self.getRow(self._csv);
//             var event_type = self.getEventType();

//             var should_continue = self.trigger(row, event_type, (err, result) => {});

//             // // Register another callback for 5 to 20 seconds
//             if (should_continue) {
//                 setTimeout(self.timer, (Math.random() * 5000) + 1000, self);
//             }
//             else {
//                 console.log('out of data to send');
//             }
//         }
//     }
//     //replace imageFileName with csvRow
//     trigger(row, event_type, callback) {
//         if (this._ready === true) {
//             // Send an event to the IoT hub
//             this.send(row, event_type, (err, result) => {
//                 console.log(this._id + ' sent row #' + this._index);
//                 callback(err, result);
//             });

//             //TODO: have it stop when the file is out
//             if (this._index == this._rows.length) {
//                 return false;
//             }
//             else {
//                 return true;
//             }
//         }
//     }

//     send(row, event_type, callback) {
//         var Message = require('azure-iot-device').Message;

//         var data = {
//             'sensorId': this._id,
//             'cowId': this._cowId,
//             'data': row,
//             'eventType': event_type,
//             'timestamp': new Date().toISOString()
//         };

//         var message = new Message(JSON.stringify(data));
//         console.log(message);
//         this._client.sendEvent(message, (err, result) => {
//             callback(err, result);
//         });
//     }
// }

// // Load image file names
// var fs = require('fs');
// // Load jQuery csv library
// var csv = require('csv-parser');
// var async = require('async');

// //https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback
// //files is the name of all the files in the directory
// fs.readdir('fake_cow_data', (err, files) => {
//     // Create an array of sensors
//     //TODO: change to birth type/back
//     var sensors = JSON.parse(fs.readFileSync('sensors.json', 'utf8')).map(
//         sensor => new Sensor(
//             sensor.deviceId,
//             sensor.cowId,
//             sensor.key,
//             'fake_cow_data_with_birth/' + (files.filter((file) => file === (sensor.cowId + '.csv'))[0])
//         )
//     );

//     // Start the cameras
//     sensors.forEach(sensor => {
//         sensor.loadRows();
//         sensor.connect(iotHubName, storageAccountName, storageAccountKey, status => {
//             if (status === true) {
//                 console.log(sensor.id + ' connected');
//                 sensor.start();
//             } else {
//                 console.log(sensor.id + ' failed to connect');
//             }
//         })
//     });
// });

let string = "[ { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:06.514Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5210917Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:00.691Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:06.57Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.0890879Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:00.75Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:08.463Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5221041Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:02.629Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:09.266Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5221041Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:03.441Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:09.534Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.2030841Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:03.698Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:09.819Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5221041Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:03.988Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:09.9Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5221041Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:04.066Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0005',       cowId: 10773,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:10.52Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5221041Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:04.691Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:10.721Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.2050816Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:04.885Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:11.265Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.2050816Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:05.44Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:12.084Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5230954Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:06.257Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:13.083Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5230954Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:07.257Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:13.827Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5170857Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:07.988Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:14.452Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5230954Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:08.618Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0005',       cowId: 10773,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:15.702Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5230954Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:09.871Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:15.947Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5181203Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:10.113Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:16.015Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5240896Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:10.184Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:17.129Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5240896Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:11.293Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:17.217Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5250865Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:11.387Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:17.611Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5250865Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:11.793Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0005',       cowId: 10773,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:17.907Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5250865Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:12.075Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:18.778Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5181203Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:12.941Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:19.195Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5250865Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:13.371Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:19.338Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5181203Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:13.504Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:20.532Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5181203Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:14.707Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:20.967Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5181203Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:15.129Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:20.987Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5250865Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:15.157Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:21.42Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5250865Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:15.594Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:21.936Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5250865Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:16.11Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0005',       cowId: 10773,       data: [Object],       eventType: 'birth',       timestamp: '2019-04-23T03:42:22.068Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5250865Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:16.235Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:23.318Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5181203Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:17.489Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:23.746Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.526105Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:17.911Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:24.067Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5181203Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:18.243Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:24.621Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.526105Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:18.786Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:24.626Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5181203Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:18.79Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:26.204Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.526105Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:20.38Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:27.2Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.526105Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:21.364Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:28.123Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5181203Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:22.299Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:28.491Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5190934Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:22.658Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:29.496Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.526105Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:23.661Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:30.304Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5190934Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:24.47Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:30.332Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5190934Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:24.502Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:30.543Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.526105Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:24.708Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:31.033Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.526105Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:25.208Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:31.645Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5190934Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:25.814Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:32.314Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.526105Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:26.489Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:32.606Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5190934Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:26.768Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:33.41Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.526105Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:27.583Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:33.984Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5270927Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:28.161Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:34.976Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5190934Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:29.15Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:35.195Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5270927Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:29.364Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:35.467Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5270927Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:29.63Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:36.55Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5190934Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:30.712Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:36.819Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5190934Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:30.993Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:37.852Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5270927Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:32.021Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:38.308Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5190934Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:32.478Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:38.779Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5270927Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:32.943Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:38.926Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5270927Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:33.099Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:39.656Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5190934Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:33.821Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:40.255Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5200951Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:34.417Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:40.475Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5270927Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:34.646Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:41.007Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5270927Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:35.177Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:41.153Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5270927Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:35.318Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:41.251Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5200951Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:35.417Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:42.288Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5270927Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:36.458Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:43.136Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5200951Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:37.312Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:44.164Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5200951Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:38.327Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:44.196Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5280897Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:38.365Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:44.208Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5280897Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:38.38Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:44.676Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5280897Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:38.849Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:45.304Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5280897Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:39.474Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:46.224Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5200951Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:40.392Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:47.883Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5280897Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:42.053Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0010',       cowId: 10542,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:47.989Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5200951Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:42.158Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:48.364Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5280897Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:42.54Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0003',       cowId: 11814,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:49.084Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5280897Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:43.259Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0001',       cowId: 10399,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:50.257Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5280897Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:44.431Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0004',       cowId: 13224,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:50.287Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5280897Z',       PartitionId: 1,       EventEnqueuedUtcTime: '2019-04-23T03:42:44.462Z',       IoTHub: [Object] },     { sensorId: 'cow_sensor_0002',       cowId: 11357,       data: [Object],       eventType: 'update',       timestamp: '2019-04-23T03:42:50.713Z',       EventProcessedUtcTime: '2019-04-23T03:42:47.5200951Z',       PartitionId: 0,       EventEnqueuedUtcTime: '2019-04-23T03:42:44.88Z',       IoTHub: [Object] }]"
string.replace('\'', "\"")
console.log(string)