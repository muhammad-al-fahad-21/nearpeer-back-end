require('dotenv').config()
module.exports = {
    development: {
        username: "muhammadalfahad21",
        password: "Software12&",
        database: "postgres",
        host: "nearpeer.postgres.database.azure.com",
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true
            }
        },
        logging: false
    },
    test: {
        username: "muhammadalfahad21",
        password: "Software12&",
        database: "postgres",
        host: "nearpeer.postgres.database.azure.com",
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true
            }
        },
        logging: false
    },
    production: {
        username: "muhammadalfahad21",
        password: "Software12&",
        database: "postgres",
        host: "nearpeer.postgres.database.azure.com",
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true
            }
        },
        logging: false
    }
}