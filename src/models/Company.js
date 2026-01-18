import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const Company = sequelize.define(
    "Company",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        website: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        logoUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        thumbnailUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "companies",
        timestamps: true,
        freezeTableName: true,
    }
);

export default Company;
