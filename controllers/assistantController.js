const Anthropic = require("@anthropic-ai/sdk").default;
const db = require("../database/models");
const { Op } = require("sequelize");
const moment = require("moment");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an assistant for Nalanda Associates, a latex rubber billing management system.
Your job is to understand the user's natural language query and return a structured JSON response.

Available intents:
1. "latex_collection_summary" - User wants latex collection data for a time period or customer.
   Parameters: { "dateFrom": "YYYY-MM-DD", "dateTo": "YYYY-MM-DD", "customerName": "string" }
   All parameters are optional. Default date range is last 30 days if not specified.

2. "total_due_amount" - User wants customer balance/due information.
   Parameters: { "customerName": "string" }
   If no customer specified, return all customers with dues.

3. "cash_payment_summary" - User wants cash payment history.
   Parameters: { "dateFrom": "YYYY-MM-DD", "dateTo": "YYYY-MM-DD", "customerName": "string" }
   All parameters are optional.

4. "billing_summary" - User wants billing/invoice history.
   Parameters: { }

5. "customer_info" - User wants details about a specific customer.
   Parameters: { "customerName": "string" }

6. "customer_list" - User wants a list of all customers.
   Parameters: { }

7. "download_report" - User wants to download/export a report as CSV.
   Parameters: { "reportType": "latex"|"cash"|"billing", "dateFrom": "YYYY-MM-DD", "dateTo": "YYYY-MM-DD" }
   Default reportType is "latex" if not clear from context.

8. "general_help" - User is asking for help or the query doesn't match any intent.
   Parameters: { }

When dates are relative (e.g., "last 30 days", "this month", "since January"), calculate them relative to today.
Today's date is: {{TODAY_DATE}}

Respond ONLY with valid JSON in this exact format:
{
  "intent": "<intent_name>",
  "parameters": { ... },
  "friendlyMessage": "<A short friendly message describing what you understood>"
}`;

async function classifyIntent(message) {
  const systemPrompt = SYSTEM_PROMPT.replace(
    "{{TODAY_DATE}}",
    moment().format("YYYY-MM-DD")
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: "user", content: message }],
  });

  const text = response.content[0].text.trim();
  return JSON.parse(text);
}

async function resolveCustomerId(customerName) {
  if (!customerName) return null;
  const customers = await db.Customer.findAll({
    where: {
      customerName: { [Op.like]: `%${customerName}%` },
      customerStatus: true,
    },
    attributes: ["customerId", "customerName"],
  });
  return customers;
}

// Intent handlers

async function handleLatexCollectionSummary(params) {
  const where = {};

  const dateFrom =
    params.dateFrom || moment().subtract(30, "days").format("YYYY-MM-DD");
  const dateTo = params.dateTo || moment().format("YYYY-MM-DD");
  where.collectionDate = {
    [Op.between]: [dateFrom, moment(dateTo).endOf("day").toDate()],
  };

  if (params.customerName) {
    const customers = await resolveCustomerId(params.customerName);
    if (customers.length === 0) {
      return {
        success: true,
        friendlyMessage: `No customer found matching "${params.customerName}". Please check the name and try again.`,
        responseType: "text",
        data: null,
      };
    }
    if (customers.length > 1) {
      return {
        success: true,
        friendlyMessage: `Multiple customers match "${params.customerName}". Which one did you mean?`,
        responseType: "table",
        columns: ["Customer ID", "Customer Name"],
        data: customers.map((c) => [c.customerId, c.customerName]),
      };
    }
    where.customerId = customers[0].customerId;
  }

  const entries = await db.LatexCollection.findAll({
    include: [{ model: db.Customer, attributes: ["customerName"] }],
    where,
    order: [["collectionDate", "DESC"]],
    limit: 50,
  });

  const totalCount = await db.LatexCollection.count({ where });
  const totals = await db.LatexCollection.findAll({
    where,
    attributes: [
      [
        db.sequelizeConnection.fn("SUM", db.sequelizeConnection.col("netWeight")),
        "totalNetWeight",
      ],
      [
        db.sequelizeConnection.fn(
          "SUM",
          db.sequelizeConnection.col("totalAmount")
        ),
        "totalAmount",
      ],
      [
        db.sequelizeConnection.fn("COUNT", db.sequelizeConnection.col("seqNumber")),
        "entryCount",
      ],
    ],
    raw: true,
  });

  const data = entries.map((e) => [
    e.Customer ? e.Customer.customerName : "N/A",
    moment(e.collectionDate).format("DD-MMM-YYYY"),
    e.grossWeight,
    e.tareWeight,
    e.netWeight,
    e.drcPercent || "-",
    e.dryWeight || "-",
    e.totalAmount
      ? parseFloat(e.totalAmount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })
      : "-",
  ]);

  return {
    success: true,
    friendlyMessage: `Latex collection from ${moment(dateFrom).format(
      "DD-MMM-YYYY"
    )} to ${moment(dateTo).format("DD-MMM-YYYY")}`,
    responseType: "table",
    columns: [
      "Customer",
      "Date",
      "Gross Wt",
      "Tare Wt",
      "Net Wt",
      "DRC %",
      "Dry Wt",
      "Amount",
    ],
    data,
    summary: {
      totalNetWeight: totals[0]
        ? parseFloat(totals[0].totalNetWeight || 0).toFixed(2)
        : "0.00",
      totalAmount: totals[0]
        ? parseFloat(totals[0].totalAmount || 0).toFixed(2)
        : "0.00",
      recordCount: totalCount,
      showing: entries.length,
    },
  };
}

async function handleTotalDueAmount(params) {
  const where = { customerStatus: true };

  if (params.customerName) {
    where.customerName = { [Op.like]: `%${params.customerName}%` };
  }

  const customers = await db.Customer.findAll({
    where,
    attributes: ["customerId", "customerName", "customerBalance"],
    order: [["customerName", "ASC"]],
  });

  if (customers.length === 0) {
    return {
      success: true,
      friendlyMessage: params.customerName
        ? `No customer found matching "${params.customerName}".`
        : "No active customers found.",
      responseType: "text",
      data: null,
    };
  }

  const totalDue = customers.reduce(
    (sum, c) => sum + (parseFloat(c.customerBalance) || 0),
    0
  );

  const data = customers
    .filter((c) => c.customerBalance && parseFloat(c.customerBalance) !== 0)
    .map((c) => [
      c.customerName,
      parseFloat(c.customerBalance || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),
    ]);

  return {
    success: true,
    friendlyMessage: params.customerName
      ? `Due amount for customers matching "${params.customerName}"`
      : "Due amounts for all active customers",
    responseType: "table",
    columns: ["Customer Name", "Balance Due"],
    data,
    summary: {
      totalDue: totalDue.toFixed(2),
      customerCount: data.length,
    },
  };
}

async function handleCashPaymentSummary(params) {
  const where = {};

  if (params.dateFrom || params.dateTo) {
    const dateFrom =
      params.dateFrom || moment().subtract(30, "days").format("YYYY-MM-DD");
    const dateTo = params.dateTo || moment().format("YYYY-MM-DD");
    where.paymentDate = {
      [Op.between]: [dateFrom, moment(dateTo).endOf("day").toDate()],
    };
  }

  if (params.customerName) {
    const customers = await resolveCustomerId(params.customerName);
    if (customers.length === 0) {
      return {
        success: true,
        friendlyMessage: `No customer found matching "${params.customerName}".`,
        responseType: "text",
        data: null,
      };
    }
    if (customers.length === 1) {
      where.customerId = customers[0].customerId;
    }
  }

  const entries = await db.CashPayment.findAll({
    include: [{ model: db.Customer, attributes: ["customerName"] }],
    where,
    order: [["paymentDate", "DESC"]],
    limit: 50,
  });

  const totalAmount = entries.reduce(
    (sum, e) => sum + (parseFloat(e.totalAmount) || 0),
    0
  );

  const data = entries.map((e) => [
    e.Customer ? e.Customer.customerName : "N/A",
    moment(e.paymentDate).format("DD-MMM-YYYY"),
    parseFloat(e.totalAmount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
    e.paymentType,
    e.paymentNotes,
  ]);

  return {
    success: true,
    friendlyMessage: `Cash payment records${
      params.customerName ? ` for "${params.customerName}"` : ""
    }`,
    responseType: "table",
    columns: ["Customer", "Date", "Amount", "Type", "Notes"],
    data,
    summary: {
      totalAmount: totalAmount.toFixed(2),
      recordCount: entries.length,
    },
  };
}

async function handleBillingSummary() {
  const entries = await db.BillingSummary.findAll({
    order: [["seqNumber", "DESC"]],
    limit: 20,
  });

  const data = entries.map((e) => [
    e.billPeriod,
    moment(e.billDate).format("DD-MMM-YYYY"),
    moment(e.billFromDate).format("DD-MMM-YYYY"),
    moment(e.billToDate).format("DD-MMM-YYYY"),
    e.numberOfBills,
    parseFloat(e.totalBillAmount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
    parseFloat(e.unitRatePerKg || 0).toFixed(2),
    parseFloat(e.totalNetWeight || 0).toFixed(2),
  ]);

  return {
    success: true,
    friendlyMessage: "Billing summary history",
    responseType: "table",
    columns: [
      "Bill Period",
      "Bill Date",
      "From",
      "To",
      "No. of Bills",
      "Total Amount",
      "Rate/Kg",
      "Total Net Wt",
    ],
    data,
    summary: {
      recordCount: entries.length,
    },
  };
}

async function handleCustomerInfo(params) {
  if (!params.customerName) {
    return {
      success: true,
      friendlyMessage:
        "Please specify a customer name. For example: 'Tell me about customer Rajan'",
      responseType: "text",
      data: null,
    };
  }

  const customers = await db.Customer.findAll({
    where: {
      customerName: { [Op.like]: `%${params.customerName}%` },
    },
    attributes: [
      "customerId",
      "customerName",
      "customerAddress",
      "customerPhone",
      "customerEmail",
      "customerStatus",
      "customerBalance",
    ],
  });

  if (customers.length === 0) {
    return {
      success: true,
      friendlyMessage: `No customer found matching "${params.customerName}".`,
      responseType: "text",
      data: null,
    };
  }

  const data = customers.map((c) => [
    c.customerId,
    c.customerName,
    c.customerAddress,
    c.customerPhone,
    c.customerEmail || "-",
    c.customerStatus ? "Active" : "Inactive",
    parseFloat(c.customerBalance || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
  ]);

  return {
    success: true,
    friendlyMessage: `Customer details for "${params.customerName}"`,
    responseType: "table",
    columns: [
      "ID",
      "Name",
      "Address",
      "Phone",
      "Email",
      "Status",
      "Balance",
    ],
    data,
  };
}

async function handleCustomerList() {
  const customers = await db.Customer.findAll({
    where: { customerStatus: true },
    attributes: ["customerId", "customerName", "customerPhone", "customerBalance"],
    order: [["customerName", "ASC"]],
  });

  const data = customers.map((c) => [
    c.customerId,
    c.customerName,
    c.customerPhone,
    parseFloat(c.customerBalance || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    }),
  ]);

  return {
    success: true,
    friendlyMessage: `List of all active customers (${customers.length} total)`,
    responseType: "table",
    columns: ["ID", "Name", "Phone", "Balance"],
    data,
  };
}

async function handleDownloadReport(params) {
  const reportType = params.reportType || "latex";
  const dateFrom =
    params.dateFrom || moment().subtract(30, "days").format("YYYY-MM-DD");
  const dateTo = params.dateTo || moment().format("YYYY-MM-DD");

  let rows = [];
  let headers = [];

  if (reportType === "latex") {
    headers = [
      "Customer",
      "Date",
      "Gross Weight",
      "Tare Weight",
      "Net Weight",
      "DRC %",
      "Dry Weight",
      "Amount",
    ];
    const entries = await db.LatexCollection.findAll({
      include: [{ model: db.Customer, attributes: ["customerName"] }],
      where: {
        collectionDate: {
          [Op.between]: [dateFrom, moment(dateTo).endOf("day").toDate()],
        },
      },
      order: [["collectionDate", "DESC"]],
    });
    rows = entries.map((e) => [
      e.Customer ? e.Customer.customerName : "N/A",
      moment(e.collectionDate).format("DD-MMM-YYYY"),
      e.grossWeight,
      e.tareWeight,
      e.netWeight,
      e.drcPercent || "",
      e.dryWeight || "",
      e.totalAmount || "",
    ]);
  } else if (reportType === "cash") {
    headers = ["Customer", "Date", "Amount", "Type", "Notes"];
    const entries = await db.CashPayment.findAll({
      include: [{ model: db.Customer, attributes: ["customerName"] }],
      where: {
        paymentDate: {
          [Op.between]: [dateFrom, moment(dateTo).endOf("day").toDate()],
        },
      },
      order: [["paymentDate", "DESC"]],
    });
    rows = entries.map((e) => [
      e.Customer ? e.Customer.customerName : "N/A",
      moment(e.paymentDate).format("DD-MMM-YYYY"),
      e.totalAmount || "",
      e.paymentType,
      e.paymentNotes,
    ]);
  } else if (reportType === "billing") {
    headers = [
      "Bill Period",
      "Bill Date",
      "From",
      "To",
      "No. of Bills",
      "Total Amount",
      "Rate/Kg",
      "Net Weight",
    ];
    const entries = await db.BillingSummary.findAll({
      order: [["seqNumber", "DESC"]],
    });
    rows = entries.map((e) => [
      e.billPeriod,
      moment(e.billDate).format("DD-MMM-YYYY"),
      moment(e.billFromDate).format("DD-MMM-YYYY"),
      moment(e.billToDate).format("DD-MMM-YYYY"),
      e.numberOfBills,
      e.totalBillAmount || "",
      e.unitRatePerKg || "",
      e.totalNetWeight || "",
    ]);
  }

  // Build CSV string
  const csvLines = [headers.join(",")];
  rows.forEach((row) => {
    csvLines.push(
      row
        .map((cell) => {
          const str = String(cell);
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(",")
    );
  });
  const csvContent = csvLines.join("\n");

  return {
    success: true,
    friendlyMessage: `${reportType} report ready for download (${rows.length} records)`,
    responseType: "download",
    downloadData: {
      content: csvContent,
      filename: `${reportType}_report_${dateFrom}_to_${dateTo}.csv`,
      mimeType: "text/csv",
    },
  };
}

function handleGeneralHelp() {
  return {
    success: true,
    friendlyMessage: "Here's what I can help you with:",
    responseType: "text",
    data: [
      "- **Latex Collection**: 'Show latex collection for last 30 days' or 'What was the latex collection for Rajan?'",
      "- **Due Amounts**: 'What is the total due amount?' or 'Show dues for all customers'",
      "- **Cash Payments**: 'Show cash payments for this month'",
      "- **Billing History**: 'Show billing summary'",
      "- **Customer Info**: 'Tell me about customer Rajan' or 'List all customers'",
      "- **Download Reports**: 'Download latex collection report' or 'Export cash payment report'",
    ].join("\n"),
  };
}

const intentHandlers = {
  latex_collection_summary: handleLatexCollectionSummary,
  total_due_amount: handleTotalDueAmount,
  cash_payment_summary: handleCashPaymentSummary,
  billing_summary: handleBillingSummary,
  customer_info: handleCustomerInfo,
  customer_list: handleCustomerList,
  download_report: handleDownloadReport,
  general_help: handleGeneralHelp,
};

module.exports = {
  handleMessage: async function (req, res) {
    res.set("Access-Control-Allow-Origin", "*");

    try {
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.json({
          success: false,
          friendlyMessage: "Please type a message to get started.",
          responseType: "text",
        });
      }

      // Classify intent using Claude
      let classification;
      try {
        classification = await classifyIntent(message);
      } catch (err) {
        console.error("Claude API error:", err);
        return res.json({
          success: false,
          friendlyMessage:
            "I'm having trouble understanding your request right now. Please try again.",
          responseType: "text",
        });
      }

      const { intent, parameters, friendlyMessage } = classification;

      // Dispatch to handler
      const handler = intentHandlers[intent];
      if (!handler) {
        const helpResult = handleGeneralHelp();
        helpResult.friendlyMessage =
          "I'm not sure what you're looking for. " +
          helpResult.friendlyMessage;
        return res.json(helpResult);
      }

      const result = await handler(parameters || {});

      // Use Claude's friendly message if our handler didn't override it with something more specific
      if (friendlyMessage && result.friendlyMessage) {
        result.aiMessage = friendlyMessage;
      }

      return res.json(result);
    } catch (err) {
      console.error("Assistant error:", err);
      return res.json({
        success: false,
        friendlyMessage:
          "Something went wrong while processing your request. Please try again.",
        responseType: "text",
      });
    }
  },

  options: function (req, res) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Content-Type": "application/json",
    });
    res.json();
  },
};
