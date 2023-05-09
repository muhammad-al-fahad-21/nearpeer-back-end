const jwt = require('jsonwebtoken');

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '30m'})
}

module.exports = createRefreshToken