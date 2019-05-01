module.exports = async function (context, req) {
    context.log("Starting:")
    context.log(req.rawbody);

    if (req.body) {
        let data_process = async function (datum) {

            context.log("Datum: ")
            context.log(datum)

            //TODO: add case statement for birth event vs sensor update
            var event_type = datum.eventType;

            if (event_type == 'update') {
                //for sharding on "farm id"
                context.log(datum.data.Group);

                //write to Cosmos DB
                //change the name [cowData] to whatever the document parameter name is
                // TODO: ADD ID FIELD TO JSON
                let current_time = Date.now();
                let request_data = datum.data;
                request_data.id = String(datum.cowId + "_" + current_time);
                request_data.time_received = current_time;

                context.bindings.cowData = request_data;

                //extract parameters for the ML model 
                var cowId = datum.cowId;
                var rum_raw = datum.data.Rumination_Raw_Data;
                var weekly_rum = datum.data.Weekly_Rumination_Average;
                var raw_act = datum.data.Raw_Activity_Data;
                var daily_act = datum.data.Daily_activity;

                //create the string to send to the predictive service
                var format_thing = 'inputs%5B%5D=';
                var str_to_send = '';
                var fields = [rum_raw, weekly_rum, raw_act, daily_act];

                for (var i = 0; i < fields.length; i++) {
                    //check if it's the last one, if so, don't append &
                    if (i == fields.length - 1) {
                        str_to_send += format_thing + fields[i];
                    } else {
                        str_to_send += format_thing + fields[i] + '&';
                    }
                }

                context.log(cowId);


                //make a get request to the predictive service
                const http = require('http');

                const url = "http://40.121.219.50/predict?" + str_to_send;
                context.log(url);

                var ml_req;
                const time_before = Date.now()

                let promise = new Promise(function (resolve, reject) {
                    ml_req = http.get(url, function (res) {
                        // context.log(res)
                        var chunks = [];

                        res.on("data", function (chunk) {
                            chunks.push(chunk);
                        });

                        res.on("end", function () {
                            var body = Buffer.concat(chunks);
                            context.log(body.toString());

                            if (parseInt(body.toString()) >= -2) {



                                //code for sending a message to cowzure notifications 
                                var https = require("https");

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

                                req = https.request(options, function (res) {
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

                                req = https.request(options, function (res) {
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

                                req = https.request(options, function (res) {
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
                                req.write(JSON.stringify({
                                    messaging_type: 'UPDATE',
                                    recipient: {
                                        id: '2630309163652234'
                                    },
                                    message: {
                                        text: message_content
                                    }
                                }));

                                // End
                                req.end();
                            }

                            resolve();
                        });
                    });
                });

                await promise;
                ml_req.end();
                const time_for_ml_run = Date.now() - time_before;

                context.bindings.latencyOutput = {
                    "runtime": time_for_ml_run
                }

            }

            //processing for a birth event
            // else {
            //     var birth = { cowId = datum.cowId, timeBorn = datum.Time_Born, timeStamp = Date.now() };
            //     //save the event in the birth table
            //     context.bindings.birthData = birth;
            // }
        }

        for (let i = 0; i < req.body.length; i += 1) {
            data_process(req.body[i])
        }

    } else {
        context.log("Request Body empty");
    }

};