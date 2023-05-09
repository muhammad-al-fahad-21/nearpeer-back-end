const app = require('./config/express');

app.listen(5000, () => {
    console.log('Server running on port 5000')
})

module.exports = app;


