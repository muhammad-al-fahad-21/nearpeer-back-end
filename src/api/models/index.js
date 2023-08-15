const fs = require('fs');
const path = require('path')
const Sequelize = require('sequelize')
const config = require('../../config/config');
const basename = path.basename(__filename);

const env = process.env.NODE_ENV ?  process.env.NODE_ENV : 'development';
const dbConfig = config[env];

const db = {};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

fs
    .readdirSync(__dirname)
    .filter((file) => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach((file) => {
        try{
            const model = require(path.join(__dirname, file))(sequelize, Sequelize)
            db[model.name] = model

        }catch(err) {
            console.log("error occured", err.message)
        }
    })

const connect = sequelize.authenticate()

connect.then(() => {
    console.info('INFO - Database connected.')
}).catch(err => {
    console.error('ERROR - Unable to connect to the database:', err)
})

Object.keys(db).forEach((model) => {
    if(db[model].associate){
        db[model].associate(db)
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db