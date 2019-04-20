var http = require("https");

let message_content = "hopefully this works"

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