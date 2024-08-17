const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({ origin: "http://localhost:5173" }));

// MongoDB connection setup
const uri = "mongodb+srv://product:ZBXP6A33pkU7FJoI@cluster0.rne3uly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    
    const database = client.db("product");
    const productCollection = database.collection("Products");

    // Define route to fetch products with filters, sorting, and pagination
    app.get('/products', async (req, res) => {
      const search = req.query.search || '';
      const category = req.query.category || '';
      const brand = req.query.brand || '';
      const priceRange = req.query.priceRange ? req.query.priceRange.split('-').map(Number) : [];
      const sort = req.query.sort || 'createdAt';
      const order = req.query.order === 'asc' ? 1 : -1;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      

      const query = {
        productName: { $regex: search, $options: 'i' },
        ...(category && { category: category }),
        ...(brand && { brand: brand }),
        ...(priceRange.length === 2 && { price: { $gte: priceRange[0], $lte: priceRange[1] } }),
      };

      try {
        const products = await productCollection.find(query)
          .sort({ [sort]: order })
          .skip(skip)
          .limit(limit)
          .toArray();
        const totalProducts = await productCollection.countDocuments(query);

        res.json({
          products,
          totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          currentPage: page,
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
      }
    });
    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Uncomment this if you want to close the connection after the server stops
    // await client.close();
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
