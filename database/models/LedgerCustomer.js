/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
    var LedgerCustomer = sequelize.define(
      "LedgerCustomer",
      {
        customerId: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        customerName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        customerAddress: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        customerPhone: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        customerEmail: {
          type: DataTypes.STRING,
        },
        customerStatus: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        customerBalance: {
          type: DataTypes.FLOAT(9, 2),
        },
      },
      {
        tableName: "LedgerCustomer",
      }
    );
  
    LedgerCustomer.associate = function (models) {
      models.LedgerCustomer.hasMany(models.LedgerBook, {
        foreignKey: "customerId",
      });
    };
  
    return LedgerCustomer;
  };
  