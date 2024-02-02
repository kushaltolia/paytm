const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const {JWT_SECRET} = require("../config");
const { authMiddleware } = require("../middlewares/middleware");
const userBody = zod.object({
    username : zod.string().email(),
    firstName : zod.string(),
    lastName : zod.string(),
    password : zod.string()

});
router.put("/", authMiddleware, async (req, res) =>  {
    await User.updateOne({
        _id : req.userId
    }, req.body);
    res.status(200).json({
        message : "Updated successfully"
    })
})
router.post("/signup", async (req, res) => {
    const userDetails = userBody.safeParse(req.body);
    if(!userDetails.success) {
        res.status(411).json({
            message : "Your details are Invalid"
        })
    }
    const existingUser = await User.findOne({
        username : req.body.username
    });
    if(existingUser) {
        res.status(411).json({
            message : "email already exist"
        })
    }
    const user = await User.create({
        username : req.body.username,
        password : req.body.password,
        firstName : req.body.firstName,
        lastName : req.body.lastName
    })
    const userId = user._id;

    await Account.create({
        userId, 
        balance : 1 + Math.random() * 1000
    })
    const token = jwt.sign({
        userId
    }, JWT_SECRET)
    console.log("hi");
    res.status(200).json({
        message : "user created successfully",
        token : token
    })

})
const userSignin = zod.object({
    username : zod.string().email(),
    password : zod.string()
})
router.post("/signin", async (req, res) => {
    const userDetails = userSignin.safeParse(req.body);
    if(!userDetails.success) {
        res.status(411).json({
            message : "Incorrect username or password"
        })
    }
    const userExist = await User.findOne({
        username : req.body.username,
        password : req.body.password
    })
    if(userExist) {
        const token = jwt.sign({
            userId : userExist._id
        }, JWT_SECRET);
        res.json({
            token : token
        })
        return;
    } 
    res.status(411).json({
        message : "Incorrect username or pasword"
    })
})
router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";
    const users = await User.find({
        $or: [{
            firstName : {
                "$regex" : filter
            }
        }, {
            lastName : {
                "$regex" : filter
            }
        }]
    })
    console.log(users.toString());
    res.status(200).send({
        users: users.map(user => ({
            username : user.username,
            firstName : user.firstName,
            lastName : user.lastName
        }) )
    })
})
module.exports = router;