require("dotenv").config(); // this is important!
module.exports = {
  development: {
    username: "root",
    password: "password",
    database: "nalandarubbers",
    host: "localhost",
    dialect: "mysql",
  },
  staging: {
    host: process.env.MYSQL_HOST,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    dialect: "mysql",
  },
  production: {
    host: process.env.MYSQL_HOST,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    dialect: "mysql",
  },
};
