const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const rootRouter = require("./routes/index");
const cors = require("cors");
// app.use(cors);
app.use(bodyParser.json());
app.use("/api/v1", rootRouter);
app.listen(3000, () => {
    console.log("Server is up");
});