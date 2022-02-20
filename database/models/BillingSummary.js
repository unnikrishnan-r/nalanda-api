module.exports = function (sequelize, DataTypes) {
  var BillingSummay = sequelize.define(
    "BillingSummary",
    {
      billPeriod: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      billDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      billFromDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      billToDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      numberOfBills: {
        type: DataTypes.INTEGER,
      },
      totalBillAmount: {
        type: DataTypes.FLOAT(15, 2),
      },
      unitRatePerKg: {
        type: DataTypes.FLOAT(7, 2),
      },
      totalNetWeight: {
        type: DataTypes.FLOAT(10, 2),
      },
      totaldryWeight: {
        type: DataTypes.FLOAT(10, 2),
      },
    },
    {
      tableName: "BillingSummary",
    }
  );
  return BillingSummay;
};
