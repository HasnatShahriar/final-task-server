const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173" // Removed the trailing slash
    ],
  })
);

// MongoDB connection setup
const uri = "mongodb+srv://product:ZBXP6A33pkU7FJoI@cluster0.rne3uly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    
    const database = client.db("product");
    const productCollection = database.collection("Products");

    // Define route to fetch products
    app.get('/products', async (req, res) => {
      try {
        const result = await productCollection.find({}).toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close(); // Uncomment this if you want to close the connection after the server stops
  }
}
run().catch(console.dir);

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
