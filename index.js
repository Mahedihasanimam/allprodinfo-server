const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k4th77t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const prot = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials:true,
    optionsSuccessStatus:200,
  })
);




// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
        const queriesCollection=client.db('queriesDB').collection('queries')
        const recomendationCollection=client.db('queriesDB').collection('recomendation')

        // post added query 
        app.post('/addqueries',async(req,res)=>{
            const data=req.body 
            const result=await queriesCollection.insertOne(data)
            res.send(result)
        })
        // add/ recomendation in recomendation collection 
        app.post('/recomend',async(req,res)=>{
          const data=req.body 
          const result=await recomendationCollection.insertOne(data)
          res.send(result)
      })

      // get all queryes 
        app.get('/queryes',async(req,res)=>{
          const data=req.body
          const result=await queriesCollection.find().toArray()
          res.send(result)
        })
  
       
        // get spesipic queryes by id 
        app.get('/queryes/:id',async(req,res)=>{
          const id=req.params.id
          const query={_id: new ObjectId(id)}
          const result=await queriesCollection.findOne(query)
          res.send(result)
        })
        app.delete('/queryes/:id',async(req,res)=>{
          const id=req.params.id
          const query={_id: new ObjectId(id)}
          const result=await queriesCollection.deleteOne(query)
          res.send(result)
        })

        // update query 
        app.patch('/update/:id',async(req,res)=>{
          const alldata=req.body
          console.log(alldata)
          const id=req.params.id
          const filter={_id:new ObjectId(id)}
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              ProductName:alldata.ProductName ,
              ProductBrand:alldata.ProductBrand, 
              productPhoto:alldata.productPhoto ,
              queryTItle:alldata.queryTItle ,
              details:alldata.details,
            },
          };
          const result=await queriesCollection.updateOne(filter,updateDoc,options)
          res.send(result)
        })
       // get recomendation by queryid 
       app.get('/recomend/:id',async(req,res)=>{
        const id=req.params.id
        const query={queryid: id}
        const result=await recomendationCollection.find(query).toArray()
        res.send(result)
      })

      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
