const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const cookeParser=require('cookie-parser')
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k4th77t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const prot = process.env.PORT || 5000;

app.use(cookeParser())
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


const logger=(req,res,next)=>{
  console.log('log method :',req.method,'url :',req.url);
  next()
}
const verifyToken=(req,res,next)=>{
  const token=req?.cookies.token
  // console.log('token in middlewre',token)
  if(!token){
    return res.status(401).send({message:"Unauthorize access"})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
    // err
    if(err){
      res.status(401).send({message:'unauthorize access'})
    }
    req.user=decoded
    next()

    // decoded undefined
  });

}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const queriesCollection = client.db("queriesDB").collection("queries");
    const recomendationCollection = client
      .db("queriesDB")
      .collection("recomendation");

    // jwt/ services related api
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log('user token',user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });
      res
      .cookie('token',token,{
        httpOnly:true,
        secure:false,
        sameSite:'strict'
      })
      .send({sussess:true})
    });
    app.post('/logout',(req,res)=>{
      const user=req.body;
      console.log('logout user',user)
      res.clearCookie('token',{maxAge:0}).send({sucess:true})

    })

    // post added query
    app.post("/addqueries", async (req, res) => {
      const data = req.body;
      const result = await queriesCollection.insertOne(data);
      res.send(result);
    });
    // add/ recomendation in recomendation collection
    app.post("/recomend", async (req, res) => {
      const data = req.body;
      const result = await recomendationCollection.insertOne(data);
      res.send(result);
    });

    // get all queryes
    app.get("/queryes", async (req, res) => {
      const data = req.body;
 
      const result = (await queriesCollection.find().sort({currentDate: -1 }).toArray())
      res.send(result);
    });

    // get spesipic queryes by id
    app.get("/queryes/:id", async (req, res) => {
      const id = req.params.id;
     
      const query = { _id: new ObjectId(id) };
      const result = await queriesCollection.findOne(query);
      res.send(result);
    });
    
    app.get('/myqueryes/:email',verifyToken,async(req,res)=>{
      const options = {
        sort: { currentDate: -1 },
      };
      const tokenEmail=req.user?.email
      const email = req.params.email;
    if(tokenEmail !== email){
      return res.status(403).send('forbidden access')
    }
      const query={email:email}
      const result=await queriesCollection.find(query,options).toArray()
      res.send(result)
    })



    app.delete("/queryes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await queriesCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/recomendation/:id", async (req, res) => {
      const options = {
        sort: { CurrentTimeStamp: -1 },
      };
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recomendationCollection.deleteOne(query,options);
      res.send(result);
    });

    // update query
    app.patch("/update/:id", async (req, res) => {
      const alldata = req.body;
      console.log(alldata);
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ProductName: alldata.ProductName,
          ProductBrand: alldata.ProductBrand,
          productPhoto: alldata.productPhoto,
          queryTItle: alldata.queryTItle,
          details: alldata.details,
        },
      };
      const result = await queriesCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // get recomendation by queryid
    app.get("/recomend/:id", async (req, res) => {
      const id = req.params.id;
      const query = { queryid: id };
      const result = await recomendationCollection.find(query).toArray();
      res.send(result);
    });
    // get my all recomendation
    app.get("/recomendation/:email",verifyToken, async (req, res) => {
    
      const tokenEmail=req.user?.email
      const email = req.params.email;
    if(tokenEmail !== email){
      return res.status(403).send('forbidden access')
    }
      const query = { userEmail: email };
      const result = await recomendationCollection.find(query).sort({ currentTime:-1 }).toArray();
      res.send(result);
    });
    // get all recomendtaion
    app.get("/recomendation",logger,verifyToken, async (req, res) => {
      
      console.log('owner info',req.user.email)
      let query={}
      if(req?.query?.email){
        query={email:req.query.email}
      }
      const data = req.data;
      const result = await recomendationCollection.find().sort({ currentTime:-1 }).toArray();
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (rq, res) => {
  res.send("allprodinfo server is running ");
});
app.listen(prot, () => {
  console.log(`server is running on port:${prot}`);
});
