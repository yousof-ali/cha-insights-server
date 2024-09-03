const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000 ;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.CLIENT_USERNAME }:${process.env.CLIENT_PASSWORD}@cluster0.lewcb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version:ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        await client.connect();

        const database = client.db("chaDB");
        const chaCollections = database.collection("CHAinsights");

        app.post('/cha',async(req,res) => {
            const newCha = req.body;
            const result = await chaCollections.insertOne(newCha);
            res.send(result);
        })

        app.get('/allcha',async(req,res) => {
            const cursor = chaCollections.find();
            const allcha = await cursor.toArray();
            res.send(allcha);
        })

        app.put('/edit/:id',async(req,res) => {
            const id = req.params.id
            const query = {_id : new ObjectId(id)}
            const update = req.body
            const option = {upsert:true}

            const updateData = {
                $set:{
                    name:update.name,
                    taste:update.taste,
                    price:update.price,
                    category:update.category,
                    chef:update.chef,
                    details:update.details,
                    photo:update.photo
                }
            };
            console.log(updateData)
            const result = await chaCollections.updateOne(query,updateData,option)
            res.send(result)
        })


        app.delete('/delete/:id',async(req,res) => {
            const ids = req.params.id
            const query = {_id : new ObjectId(ids)}
            const result = await chaCollections.deleteOne(query);
            res.send(result);
        })

        app.get('/details/:id',async(req,res) => {
            const chaID = req.params.id
            const query = {_id: new ObjectId(chaID)}
            const data = await chaCollections.findOne(query);
            res.send(data);
        })

        await client.db("admin").command({ping: 1});
        console.log("successfully connected to mongodb! ")
    } finally {
        // await client.close();
    }
};
run().catch(console.dir);


app.get('/', (req,res) => {
     res.send("CHA Insights ")
});


app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})
