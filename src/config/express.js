const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const route = require('../api/routes')

const app = express()

app.use(cors())
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', route)
app.get('/', async (req, res) => {
    res.send("<h1> Backend Work Correctlt </h1>")
})

module.exports = app