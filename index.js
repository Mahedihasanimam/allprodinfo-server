const express = require('express');
const app=express()
const cors = require('cors');
const prot=process.env.PORT || 5000;
app.use(cors())
app.use(express.json())

app.get('/',(rq,res)=>{
    res.send("allprodinfo server is running ")
})
app.listen(prot,()=>{
    console.log(`server is running on port:${prot}`)
})
 