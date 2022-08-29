var bcrypt = require("bcryptjs");

module.exports = function (sequelize, DataTypes) {
  var Employee = sequelize.define(
    "Employee",
    {
      username: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      indexes: [
        // Create a unique index on username
        {
          unique: true,
          fields: ["username"],
        },
      ],
    }
  );

  // Creating a custom method for our Employee model. This will check if an unhashed password entered by
  //the user can be compared to the hashed password stored in our database
  Employee.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  // Hooks are automatic methods that run during various phases of the Employee Model lifecycle
  // In this case, before a User is created, we will automatically hash their password
  Employee.addHook("beforeCreate", function (employee) {
    employee.password = bcrypt.hashSync(
        employee.password,
      bcrypt.genSaltSync(10),
      null
    );
  });

  return Employee;
};
