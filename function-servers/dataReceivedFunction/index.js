module.exports = async function (context, req) {
    context.log("Starting:")

    if (req.body) {
        const datum = req.body[0];
        // context.log(datum);

        var event_type = datum.eventType;

        if (event_type == 'update') {
            //write to Cosmos DB
            //change the name [cowData] to whatever the document parameter name is
            let current_time = Date.now();
            let request_data = datum.data;
            request_data.id = String(datum.cowId + "_" + current_time);
            request_data.time_received = current_time;

            context.bindings.cowData = request_data;

            //extract parameters for the ML model 
            var cowId = datum.cowId;
            var daily_rum = datum.data.Daily_Rumination;
            var weekly_rum = datum.data.Weekly_Rumination_Average;

            //create the string to send to the predictive service
            var rumination_amount = daily_rum / weekly_rum;
            var str_to_send = 'inputs%5B%5D=' + String(rumination_amount);

            //make a get request to the predictive service
            const http = require('http');

            const url = "http://23.99.139.81/predict?" + str_to_send;

            var ml_req;
            const time_before = Date.now()

            let promise = new Promise(function (resolve, reject) {
                ml_req = http.get(url, function (res) {
                    var chunks = [];

                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on("end", function () {
                        var body = Buffer.concat(chunks);

                        //our model predicts whether the cow will give birth in the next 10 periods (20 hours)
                        //so we can verify our accuracy this way;
                        if ((parseInt(body.toString()) == 1) && (datum.data.period_to_calving >= -10)) {
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
        else {
            var birth = { "cowId":datum.cowId, "timeBorn" : datum.Time_Born, "timeStamp" : Date.now() };
            //save the event in the birth table
            context.bindings.birthData = birth;
        }

    } else {
        context.log("Request Body empty");
    }

};