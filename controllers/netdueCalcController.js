const db = require("../database/models");
var Sequelize = require("sequelize");
var moment = require("moment");

const Op = Sequelize.Op;

module.exports = {
  netdueCalculation: async function (req, res) {
    let customerObjectWhereClause = req.body.customerId
      ? { customerId: req.body.customerId }
      : {
          customerId: {
            [Op.gte]: 0,
          },
        };
    let customerBillObject = await db.Customer.findAll({
      attributes: ["Customer.customerId"],
      where: customerObjectWhereClause,
      raw: true,
      include: [
        {
          model: db.CashPayment,
          required: false,
          raw: true,
          attributes: ["totalAmount", "updatedAt"],
          where: {
            paymentType: 0,
            updatedAt: {
              [Op.in]: Sequelize.literal(
                `(select MAX(C.updatedAt) from CashPayment C where (CashPayments.customerId = C.customerId AND C.paymentType = 0))`
              ),
            },
          },
        },
      ],
    });

    let customerPaidObject = await db.Customer.findAll({
      attributes: ["Customer.customerId"],
      where: customerObjectWhereClause,
      raw: true,
      include: [
        {
          model: db.CashPayment,
          required: false,
          raw: true,
          attributes: ["totalAmount", "updatedAt"],
          where: {
            paymentType: 1,
            paymentNotes: "Bill Settlement",
            updatedAt: {
              [Op.in]: Sequelize.literal(
                `(select MAX(C.updatedAt) from CashPayment C where (CashPayments.customerId = C.customerId AND C.paymentType = 1 AND C.paymentNotes = "Bill Settlement"))`
              ),
            },
          },
        },
      ],
    });
    console.log(customerPaidObject);
    let calculatedNetDueArray = [];
    customerBillObject.map((element) => {
      let x = customerPaidObject.find(
        (x) => x.customerId === element["customerId"]
      );
      calculatedNetDueArray.push({
        customerId: element["customerId"],
        billAmount: element["CashPayments.totalAmount"],
        paidAmount: x["CashPayments.totalAmount"],
        netDue: Number(
          (
            element["CashPayments.totalAmount"] - x["CashPayments.totalAmount"]
          ).toFixed(2)
        ),
      });
    });

    await Promise.all(
      calculatedNetDueArray.map(async (customer) => {
        console.log(customer);
        db.Customer.update(
          { customerBalance: customer.netDue },
          {
            where: { customerId: customer.customerId },
          }
        )
          .then((dbModel) => console.log("Customer Due Amount updated"))
          .catch((err) => res.status(422).json(err));
      })
    );

    res.json(calculatedNetDueArray);
  },

  netdueCalculationNew: async function (req, res) {
    let customerObjectWhereClause = req.body.customerId
      ? { customerId: req.body.customerId }
      : {
          customerId: {
            [Op.gte]: 0,
          },
        };

    let latexEntriesWhereClause = req.body.billFromDate
      ? {
          collectionDate: {
            [Op.lte]: req.body.billFromDate,
          },
        }
      : {
          collectionDate: {
            [Op.lte]: moment().format("YYYY-MM-DD"),
          },
        };

    let cashPaymentWhereClause = req.body.billFromDate
      ? {
          paymentDate: {
            [Op.lte]: req.body.billFromDate,
          },
          paymentType: 1,
        }
      : {
          paymentDate: {
            [Op.lte]: moment().format("YYYY-MM-DD"),
          },
          paymentType: 1,
        };
    let customerLatexObject = await db.Customer.findAll({
      attributes: [
        "Customer.customerId",
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "totalLatexAmount"],
      ],
      where: customerObjectWhereClause,
      raw: true,
      group: ["customerId"],
      include: [
        {
          model: db.LatexCollection,
          required: false,
          raw: true,
          attributes: [],
          where: latexEntriesWhereClause,
        },
      ],
    });

    let customerPaidObject = await db.Customer.findAll({
      attributes: [
        "Customer.customerId",
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "totalCashPaid"],
      ],
      where: customerObjectWhereClause,
      raw: true,
      group: ["customerId"],
      include: [
        {
          model: db.CashPayment,
          required: false,
          raw: true,
          attributes: [],
          where: cashPaymentWhereClause,
        },
      ],
    });

    let calculatedNetDueArray = [];
    customerLatexObject.map((element) => {
      let x = customerPaidObject.find(
        (x) => x.customerId === element["customerId"]
      );
      calculatedNetDueArray.push({
        customerId: element["customerId"],
        billAmount: element["totalLatexAmount"],
        paidAmount: x["totalCashPaid"],
        netDue: Number(
          (element["totalLatexAmount"] - x["totalCashPaid"]).toFixed(2)
        ),
      });
    });

    await Promise.all(
      calculatedNetDueArray.map(async (customer) => {
        console.log(customer);
        db.Customer.update(
          { customerBalance: customer.netDue },
          {
            where: { customerId: customer.customerId },
          }
        )
          .then((dbModel) => console.log("Customer Due Amount updated"))
          .catch((err) => res.status(422).json(err));
      })
    );

    res.json(calculatedNetDueArray);
  },

  options: function (req, res) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Content-Type": "application/json",
    }),
      res.json();
  },
};
