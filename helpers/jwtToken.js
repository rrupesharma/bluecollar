const config = require('config');
const jwt = require('jsonwebtoken');

const privateKey = config.JWTPrivateKey;

async function generate(body,time) {
    return new Promise(function (resolve, reject) {
        jwt.sign(body, privateKey, { expiresIn: time+'h' }, function (err, token) {
            if (err) reject('invalid token');
            else resolve(token);
        });
    })
}

async function verify(body) {
    return new Promise(function (resolve, reject) {
        jwt.verify(body, privateKey, function (err, decoded) {
            if (err) {
                resolve(false)
            } else {
                resolve(decoded)
            };
        });
    })
}

async function generateLogin(body) {
    return new Promise(function (resolve, reject) {
        jwt.sign(body, privateKey, { expiresIn: '24h' }, function (err, token) {
            console.log(err);
            if (err) reject({message:'invalid token'});
            else resolve(token);
        });
    })
}

async function verifyUser(body) {
    return new Promise(function (resolve, reject) {
        jwt.verify(body, privateKey, function (err, decoded) {
            if (err) {
                reject('invalid token')
            } else {
                resolve(decoded)
            };
        });
    })
}

async function generateSession(body,expiresIn) {
    return new Promise(function (resolve, reject) {
        jwt.sign(body, privateKey, { expiresIn: "1hr" }, function (err, token) {
            console.log(err);
            if (err) reject('invalid token');
            else {resolve(token);
            console.log("token",token);
            }
        });
    })
}

exports.generate = generate;
exports.verify = verify;
exports.generateLogin = generateLogin;
exports.verifyUser = verifyUser;
exports.generateSession = generateSession;
