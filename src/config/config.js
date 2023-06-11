require('dotenv').config()
module.exports = {
    development: {
        username: "postgres",
        password: "12345678",
        database: "mern_test",
        host: "localhost",
        port: 5431,
        dialect: "postgres",
        logging: false
    },
    test: {
        username: "postgres",
        password: "12345678",
        database: "mern_test",
        host: "localhost",
        port: 5431,
        dialect: "postgres",
        logging: false
    },
    production: {
        username: "postgres",
        password: "12345678",
        database: "mern_test",
        host: "localhost",
        port: 5431,
        dialect: "postgres",
        logging: false
    }
}