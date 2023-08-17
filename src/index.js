const app = require('./config/express');

app.get("/", async (req, res) => {
    res.send("<h1> Hello World!</h1>");
})

const PORT = process.env.PORT || 5005

const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT} `)
})

module.exports = server;


