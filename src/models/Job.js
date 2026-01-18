import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Company from "./Company.js";

const Job = sequelize.define(
    "Job",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "companies",
                key: "id",
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        location: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("open", "closed"),
            defaultValue: "open",
        },
    },
    {
        tableName: "jobs",
        timestamps: true,
        freezeTableName: true,
    },
);

export default Job;
