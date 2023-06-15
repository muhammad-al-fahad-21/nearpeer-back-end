require('dotenv').config()
module.exports = {
    development: {
        username: "docker",
        password: "12345678",
        database: "development",
        host: "postgres",
        dialect: "postgres",
        logging: false
    },
    test: {
        username: "docker",
        password: "12345678",
        database: "test",
        host: "postgres",
        dialect: "postgres",
        logging: false
    },
    production: {
        username: "docker",
        password: "12345678",
        database: "production",
        host: "postgres",
        dialect: "postgres",
        logging: false
    }
}