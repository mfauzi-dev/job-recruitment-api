import Application from "./Application.js";
import Company from "./Company.js";
import Job from "./Job.js";
import Role from "./Role.js";
import User from "./User.js";

// User - Role
Role.hasMany(User, {
    foreignKey: "roleId",
    onDelete: "cascade",
});

User.belongsTo(Role, {
    foreignKey: "roleId",
    as: "role",
});

// User - Company
User.hasOne(Company, {
    foreignKey: "userId",
    onDelete: "CASCADE",
});
Company.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

// Company - Job
Company.hasMany(Job, {
    foreignKey: "companyId",
    onDelete: "CASCADE",
});
Job.belongsTo(Company, {
    foreignKey: "companyId",
    as: "company",
});

// Job - Application
Job.hasMany(Application, {
    foreignKey: "jobId",
    onDelete: "CASCADE",
});
Application.belongsTo(Job, {
    foreignKey: "jobId",
    as: "job",
});

// User - Application
User.hasMany(Application, {
    foreignKey: "userId",
    onDelete: "CASCADE",
});
Application.belongsTo(User, {
    foreignKey: "userId",
    as: "candidate",
});

export { Role, User, Company, Job, Application };
