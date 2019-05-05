var fs = require('fs');
var iothub = require('azure-iothub');
var registry = iothub.Registry.fromConnectionString('HostName=cowzureIoTHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=AkRvXMDmf3SXF4P5vdLsEmISfsDIsdq95A8mCGWABN4=');

console.log('Reading devices.json...');
var devices = JSON.parse(fs.readFileSync('devices.json', 'utf8'));

console.log('Registering devices...');
registry.addDevices(devices, (err, info, res) => {
    registry.list((err, info, res) => {
        info.forEach(device => {
            devices.find(o => o.deviceId === device.deviceId).key = device.authentication.symmetricKey.primaryKey;          
        });

        console.log('Writing sensors.json...');
        fs.writeFileSync('sensors.json', JSON.stringify(devices, null, 4), 'utf8');
        console.log('Done');
    });
});