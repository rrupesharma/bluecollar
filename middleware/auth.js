const {verifyUser} = require('../helpers/jwtToken');

async function verify(req, res, next) {
    const token = req.header('x-auth');
    if(!token) return res.status(401).send('Access denied. No token provided.');
    verifyUser(token).then(function (data) {
        req.user = data;
        next();
    }).catch(function () {
        return res.status(400).send('Invalid token...');
    });
}


exports.verify = verify;