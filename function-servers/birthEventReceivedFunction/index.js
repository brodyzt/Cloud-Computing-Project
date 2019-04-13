module.exports = async function (context, req) {
    context.log(req.rawBody);
    context.done(null, "birth data received");
};