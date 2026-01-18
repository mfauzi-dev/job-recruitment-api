import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Role from "./Role.js";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3,
            references: {
                model: "roles",
                key: "id",
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        curriculumVitaeUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        resetPasswordToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        resetPasswordExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        verificationToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        verificationTokenExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "users",
        timestamps: true,
        freezeTableName: true,
    },
);

export default User;
