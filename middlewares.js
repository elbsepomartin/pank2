const Users = require('./models/User');
const Sessions = require('./models/Session');

exports.RequestBodyIsValidJson = (err, req, res, next) => {
    // body-parser will set this to 400 if the json is in error
    if (err.status === 400)
        return res.status(err.status).send('Malformed JSON');
    return next(err); // if it's not a 400, let the default error handling do it.
}

exports.RequestHeadersHaveCorrectContentType = (req, res, next) => {
    // Catch invalid Content-Types
    var RE_CONTYPE = /^application\/(?:x-www-form-urlencoded|json)(?:[\s;]|$)/i;
    if (req.method !== 'GET' && !RE_CONTYPE.test(req.headers['content-type'])) {
        res.setStatus = 406
        return res.send('Content-Type is not application/json');
    }
    next();
}

exports.validateToken = async (req, res, next) => {
    if (typeof req.headers.authorization === 'undefined'
        || req.headers.authorization.split(' ')[0] !== 'Bearer'
        || typeof req.headers.authorization.split(' ')[1] === 'undefined'){
            return res.status(401).json({error: 'Missing token'});
    }
    const sessionId = req.headers.authorization.split(' ')[1]

    // A function to find a session from the database
    const session = await Sessions.findOne({ _id:sessionId });
    if (!session){
        return res.status(401).json({error: 'Invalid token'});
    }
    const user = await Users.findOne({ _id:session.userId });
    if (!user){
        return res.status(401).json({error: 'Unknown user'});
    }
    req.headers.authenticatedUserId = user._id
    req.headers.sessionId = sessionId
    next();
}