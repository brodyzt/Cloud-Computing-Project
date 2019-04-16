module.exports = async function (context, req) {
    //TODO: add case statement for birth event vs sensor update
    var event_type = req.body[0].eventType;
    // context.log(req.rawbody);

    if (event_type == 'update') {
        //for sharding on "farm id"
        context.log(req.body[0].data.Group);

        //write to Cosmos DB
        //change the name [cowData] to whatever the document parameter name is
        // context.bindings.cowData = req.body[0].data;
        
        //extract parameters for the ML model 
        var cowId = req.body[0].cowId;
        var rum_raw = req.body[0].data.Rumination_Raw_Data;
        var weekly_rum = req.body[0].data.Weekly_Rumination_Average;
        var raw_act = req.body[0].data.Raw_Activity_Data;
        var daily_act = req.body[0].data.Daily_activity;

        //create the string to send to the predictive service
        var format_thing = 'inputs%5B%5D=';
        var str_to_send = '';
        var fields = [rum_raw, weekly_rum, raw_act, daily_act];

        for (var i = 0; i < fields.length; i++) {
            //check if it's the last one, if so, don't append &
            if (i == fields.length - 1){
                str_to_send += format_thing + fields[i];
            }
            else {
                str_to_send += format_thing + fields[i] + '&';
            }
        }

        context.log(cowId);

        //code for sending a message to cowzure notifications 
        var http = require("https");

        let message_content = "Cow " + cowId + " is going to calve soon. GET READY TO RUMBLE!!";

        context.log(message_content);

        var options = {
            "method": "POST",
            "hostname": "graph.facebook.com",
            "path": "/v2.6/me/messages?access_token=EAAI9ZBfZC3t3ABAOG78gZBfeqXkVPALU4HqIDPuiNCpuhaRgGV3LNZBeXsnfCoty4c4IryZAIRNAQj3nKxM5NPd5yMDIpmQrMsdIJ2CFkECVH4W9ZCXyYa8mZCKa8LuzsGuoQweU8O8G6M9tr06AqMMqgVfQK00B7Q5OSzVZAZBK0oeWeMYg7vZATO",
            "headers": {
                "Content-Type": "application/json",
            }
        };

        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                console.log(body.toString());
            });
        });


        // Zack
        req.write(JSON.stringify({
            messaging_type: 'UPDATE',
            recipient: {
                id: '2554453011237103'
            },
            message: {
                text: message_content
            }
        }));
        req.end();

        req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                console.log(body.toString());
            });
        });

        // Janice
        req.write(JSON.stringify({
            messaging_type: 'UPDATE',
            recipient: {
                id: '2101586909879073'
            },
            message: {
                text: message_content
            }
        }));
        req.end();

        req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                console.log(body.toString());
            });
        });

        // Michelle
        req.write(JSON.stringify({ messaging_type: 'UPDATE',
        recipient: { id: '2630309163652234' },
        message: { text: message_content } }));

        // End
        req.end();

        // make a get request to the predictive service
        // const https = require('https');
        // https.get('https://api.nasa.gov/planetary/apod?inputs=' + str_to_send, (resp) => {
        //     let data = '';

        //     // A chunk of data has been recieved.
        //     resp.on('data', (chunk) => {
        //         data += chunk;
        //     });

        //     // The whole response has been received. Print out the result.
        //     resp.on('end', () => {
        //         console.log(JSON.parse(data).explanation);
        //     });

        // }).on("error", (err) => {
        // console.log("Error: " + err.message);
        // });
    }

    // const request = require('request');

    //     //TODO: change url to actual model
    //     request('https://api.nasa.gov/planetary/apod?inputs=' + str_to_send, { json: true }, (err, res, body) => {
    //         if (err) { return console.log(err); }
    //         console.log(body.url);
    //         console.log(body.explanation);
    //     });
    // }

    //processing for a birth event
    // else {
    //     var birth = { cowId = req.body[0].cowId, timeBorn = req.body[0].Time_Born, timeStamp = Date.now() };
    //     //save the event in the birth table
    //     context.bindings.birthData = birth;
    // }

};