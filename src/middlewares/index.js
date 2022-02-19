/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('../config');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (token === null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
        console.log(err.message || err);
        return res.sendStatus(401);
        }
        req.user = user;
        next();
    });
};

module.exports = {
    authenticateToken,
};
