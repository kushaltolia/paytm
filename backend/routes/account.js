const express = require("express");
const { authMiddleware } = require("../middlewares/middleware");
const { Account } = require("../db");
const { mongo, default: mongoose } = require("mongoose");
const router = express.Router();
router.get("/balance", authMiddleware, async (req, res) => {
    console.log("pitu");
    const balance = await Account.findOne({userId : req.userId})
    res.status(200).json({
        balance : balance.balance
    })
})
router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let {amount, to} = req.body;
    amount = parseInt(amount);
    console.log(10 + amount);
    const account = await Account.findOne({userId : req.userId}).session(session);
    if(!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message : "Insufficient balance"
        })
    }
    const toAccount = await Account.findOne({userId : to}).session(session);
    if(!toAccount) {
        await session.abortTransaction();
        return (res.status(400).json({
            message : "Account details Invalid"
        }))
    }
    await Account.updateOne({userId : req.userId}, {$inc : {balance : -amount}}).session(session);
    console.log(req.userId)
    await Account.updateOne({userId : to}, {$inc : {balance : amount}}).session(session);
    await session.commitTransaction();
    res.json({
        message : "Transaction Completed"
    })
})
module.exports = router;