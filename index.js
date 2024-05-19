const express = require("express")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors')
const port = 4000;
const dotenv = require("dotenv").config();

// middlewares
app.use(cors())
app.use(express.json())
 

// const link ='mongodb+srv://my-balance-admin:my-balance-admin@cluster0.if4agm4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// console.log(link)

const uri = `${process.env.URI}`;


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

        await client.connect();
        const userCollection = client.db('my-balance-db').collection("user-collection")
        const userBalanceCollection = client.db('my-balance-db').collection("user-balance-collection")
        
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.get('/user',async (req, res)=>{
            let query = {}
            if(req.query?.email){
                query = {userEmail: req.query.email}
            }
            const result = await userBalanceCollection.findOne(query)
            res.send(result)
        })

       

        app.post('/create-user', async (req, res)=>{
            const newUser = req.body;
           
            const result = await userCollection.insertOne(newUser.userInfo);
            if(result.insertedId){
                const info = newUser.userBalanceInfo;
                info.userInsertedId = result.insertedId
                const newBalance = await userBalanceCollection.insertOne(info)
               res.send(newBalance)
            }
        })

        app.delete('/user', async (req, res) => {
            let query = {}
            if(req.query?.email){
                query = {userEmail: req.query.email}
            }
            
        })


        app.post('/income',async (req, res) =>{
            const userData = req.body.userData;
            const incomeData = req.body.incomeData;
            console.log(userData, incomeData)

            const filter = {userEmail:userData.userEmail}
            const updateDoc ={
                    $push:{"income.allIncomes": incomeData},
                    $inc: { "mainBalance": incomeData.incomeAmount }
            }
            const result = await userBalanceCollection.updateOne(filter, updateDoc, {})
            //     {_id: new userData._id} , // Match document by _id
            //     { 
            //       $push: { "income.allIncomes": { 
            //         "IncomeTitle": "loan", 
            //         "ammount": 300, 
            //         "date": "12-2-24", 
            //         "description": "the tiek" 
            //       }}, // Push new income object to allIncomes array
            //       $inc: { "mainBalance": 300 } // Increment mainBalance by 300
            //     }
            //   )
            //   console.log({userEmail: userData.userEmail})
            console.log(result)
        })


    } finally {
        
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('hello dear')
})




app.listen(`${port}`, () => {
    console.log(`server is running on the ${port} port`)
})

