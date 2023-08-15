const jwt = require('jsonwebtoken');

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN, {expiresIn: '1d'})
}

module.exports = createRefreshToken;