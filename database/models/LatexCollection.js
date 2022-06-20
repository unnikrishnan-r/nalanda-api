/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  var LatexCollection = sequelize.define(
    "LatexCollection",
    {
      seqNumber: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: 
          {
            model: "Customer",
            key: "customerId",
          }
        ,
      },
      collectionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true,
      },
      barrelNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      grossWeight: {
        type: DataTypes.FLOAT(6, 2),
        allowNull: false,
      },
      tareWeight: {
        type: DataTypes.FLOAT(6, 2),
        allowNull: false,
      },
      netWeight: {
        type: DataTypes.FLOAT(6, 2),
        allowNull: false,
      },
      drcPercent: {
        type: DataTypes.FLOAT(6, 2),
        allowNull: true,
      },
      dryWeight: {
        type: DataTypes.FLOAT(6, 2),
        allowNull: true,
      },
      unitRatePerKg: {
        type: DataTypes.FLOAT(7, 2),
        allowNull: true,
      },
      totalAmount: {
        type: DataTypes.FLOAT(9, 2),
        allowNull: true,
      },
      paymentStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "LatexCollection",
    }
  );
  LatexCollection.associate = function (models) {
    models.LatexCollection.hasMany(models.CashPayment, {
      foreignKey: "customerId",
    });

    models.LatexCollection.belongsTo(models.Customer, {
      foreignKey: "customerId",
    });

  };

  return LatexCollection;
};
