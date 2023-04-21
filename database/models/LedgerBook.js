module.exports = function (sequelize, DataTypes) {
  var LedgerBook = sequelize.define(
    "LedgerBook",
    {
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      ledgerEntryDate: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true,
      },
      paymentType: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      totalAmount: {
        type: DataTypes.FLOAT(9, 2),
        allowNull: true,
      },
      paymentNotes: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "LedgerBook",
    }
  );

  LedgerBook.associate = function (models) {
    models.LedgerBook.belongsTo(models.LedgerCustomer, {
      foreignKey: "customerId",
    });
  };

  return LedgerBook;
};
