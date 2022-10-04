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
          attributes: [
            [
              Sequelize.literal(`CASE
            WHEN SUM(totalAmount) IS NULL THEN 0
            ELSE SUM(totalAmount)
        END`),
              "BillAmount",
            ],
          ],
          where: {
            paymentType: 0,
          },
        },
      ],
      group: ["Customer.customerId"],
    });

    let customerPaidObject = await db.Customer.findAll({
      attributes: ["Customer.customerId"],
      raw: true,
      include: [
        {
          model: db.CashPayment,
          required: false,
          raw: true,
          attributes: [
            [
              Sequelize.literal(`CASE
            WHEN SUM(totalAmount) IS NULL THEN 0
            ELSE SUM(totalAmount)
        END`),
              "PaidAmount",
            ],
          ],
          where: {
            paymentType: 1,
            paymentNotes: "Bill Settlement",
          },
        },
      ],
      group: ["Customer.customerId"],
    });

    let calculatedNetDueArray = [];
    customerBillObject.map((element) => {
      let x = customerPaidObject.find(
        (x) => x.customerId === element["customerId"]
      );
      calculatedNetDueArray.push({
        customerId: element["customerId"],
        billAmount: element["CashPayments.BillAmount"],
        paidAmount: x["CashPayments.PaidAmount"],
        netDue: Number(
          (
            element["CashPayments.BillAmount"] - x["CashPayments.PaidAmount"]
          ).toFixed(2)
        ),
      });
    });

    await Promise.all(
      calculatedNetDueArray.map(async(customer) => {
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
