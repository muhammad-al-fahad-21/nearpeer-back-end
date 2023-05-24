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
            allowNull: true,
            validate: {
                min: 0,
                max: 5
            }
        },
        publisher: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_update: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
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