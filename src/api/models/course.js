const { Sequelize } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    const courses = sequelize.define('courses', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        publisher: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastest_update: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true
        },
        upload_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'courses',
        schema: 'public',
        timestamps: false
    })

    courses.associate = (models) => {
        courses.belongsTo(models.users, {
            foreignKey: 'user_id',
            sourceKey: 'id',
            as: 'user'
        })
    }

    return courses
}