require('dotenv').config()
module.exports = {
    development: {
        username: "docker",
        password: "12345678",
        database: "docker",
        host: "postgres",
        dialect: "postgres",
        logging: false
    },
    test: {
        username: "docker",
        password: "12345678",
        database: "docker",
        host: "postgres",
        dialect: "postgres",
        logging: false,
        pool: {
            max: 100,
            min: 0,
            idle: 200000,
            acquire: 1000000,
        }
    },
    production: {
        username: "docker",
        password: "12345678",
        database: "docker",
        host: "postgres",
        dialect: "postgres",
        logging: false
    }
}