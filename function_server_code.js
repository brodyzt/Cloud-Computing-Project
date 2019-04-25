module.exports = async function (context, req) {
    //TODO: add case statement for birth event vs sensor update
    var event_type = req.body[0].eventType;

    if (event_type == 'update') {
        context.log(req.body[0].cowId);
        context.log(req.body[0].data.Rumination_Raw_Data);
        context.log(req.body[0].data.Weekly_Rumination_Average);
        context.log(req.body[0].data.Raw_Activity_Data);
        context.log(req.body[0].data.Daily_activity);
        //for sharding on "farm id"
        context.log(req.body[0].data.Group);

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

        //make a get request to the predictive service
        const https = require('https');
        https.get('104.41.149.27?inputs=' + str_to_send, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                context.log(JSON.parse(data).explanation);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }

    //processing for a birth event
    else {

    }

};