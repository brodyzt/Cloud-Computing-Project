module.exports = async function (context, req) {
    context.log(req.rawBody);
    context.done(null, "context data received");
};