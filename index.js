const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const prot = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5000"],
    credentials:true,
    optionsSuccessStatus:200,
  })
);



app.get("/", (rq, res) => {
  res.send("allprodinfo server is running ");
});
app.listen(prot, () => {
  console.log(`server is running on port:${prot}`);
});
