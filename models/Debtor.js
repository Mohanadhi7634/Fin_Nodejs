const mongoose = require("mongoose");

const InterestPaidSchema = new mongoose.Schema(
  {
    month: { type: String, required: true },
    date: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

const PaymentHistorySchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    method: { type: String, required: true },
  },
  { timestamps: true }
);

const DebtorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: String, required: true },
    photo: {
  url: { type: String },
  name: { type: String }
},
    debtAmount: { type: Number, required: true },
    debtDate: { type: String, required: true },
    remainingBalance: {
      type: Number,
      default: function () {
        return this.debtAmount;
      }
    },
    currentDate: { type: String, required: true },
    interestRate: { type: Number, required: true },
    interestAmount: { type: Number, required: true },
bondPapers: [
  {
    url: { type: String },
    name: { type: String }
  }
],
checkLeaves: [
  {
    url: { type: String },
    name: { type: String }
  }
],
    interestPaidMonths: [InterestPaidSchema],
    paymentHistory: [PaymentHistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Debtor", DebtorSchema);

