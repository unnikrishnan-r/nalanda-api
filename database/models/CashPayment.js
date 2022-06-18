module.exports = function (sequelize, DataTypes) {
  var CashPayment = sequelize.define(
    "CashPayment",
    {
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Customer",
          key: "customerId",
        },
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true,
      },
      totalAmount: {
        type: DataTypes.FLOAT(9, 2),
        allowNull: true,
      },
      paymentType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentNotes: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "CashPayment",
    }
  );

  CashPayment.associate = function (models) {
    models.CashPayment.belongsTo(models.Customer, {
      foreignKey: "customerId",
    });
  };

  return CashPayment;
};
