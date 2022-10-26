const db = require("../database/models");
var Sequelize = require("sequelize");
var moment = require("moment");

const Op = Sequelize.Op;

module.exports = {
  netdueCalculation: async function (req, res) {
    let customerBillObject = await db.Customer.findAll({
      attributes: ["Customer.customerId"],
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
                `(select MAX(c.updatedAt) from CashPayment C where (CashPayments.customerId = C.customerId AND C.paymentType = 0))`
              ),
            },
          },
        },
      ],
    });

    let customerPaidObject = await db.Customer.findAll({
      attributes: ["Customer.customerId"],
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
                `(select MAX(c.updatedAt) from CashPayment C where (CashPayments.customerId = C.customerId AND C.paymentType = 1 AND c.paymentNotes = "Bill Settlement"))`
              ),
            },
          },
        },
      ],
    });
    console.log(customerPaidObject)
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
