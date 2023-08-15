require('dotenv').config()
module.exports = {
    development: {
        username: "default",
        password: "leH9Xt4UbczT",
        database: "verceldb",
        host: "ep-weathered-darkness-04769553-pooler.us-east-1.postgres.vercel-storage.com",
        dialect: "postgres",
        logging: false
    },
    test: {
        username: "default",
        password: "leH9Xt4UbczT",
        database: "verceldb",
        host: "ep-weathered-darkness-04769553-pooler.us-east-1.postgres.vercel-storage.com",
        dialect: "postgres",
        logging: false
    },
    production: {
        username: "default",
        password: "leH9Xt4UbczT",
        database: "verceldb",
        host: "ep-weathered-darkness-04769553-pooler.us-east-1.postgres.vercel-storage.com",
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true
            }
        },
        logging: false
    }
}