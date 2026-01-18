import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Job from "./Job.js";
import User from "./User.js";

const Application = sequelize.define(
    "Application",
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
        jobId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "jobs",
                key: "id",
            },
        },
        status: {
            type: DataTypes.ENUM("pending", "accepted", "rejected"),
            defaultValue: "pending",
        },
        coverLetterUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "applications",
        timestamps: true,
        freezeTableName: true,
    },
);

export default Application;
