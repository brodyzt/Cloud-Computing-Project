module.exports = async function (context, req) {
    context.log(req.rawBody);
    return req.rawBody;
};