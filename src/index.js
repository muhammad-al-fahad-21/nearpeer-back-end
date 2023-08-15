const app = require('./config/express');

const PORT = process.env.PORT || 5005

const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT} `)
})

module.exports = server;


