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
        references: {
          model: "Customer",
          key: "customerId",
        },
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
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tareWeight: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      netWeight: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "LatexCollection",
    }
  );
  return LatexCollection;
};
