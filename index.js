
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();
const app = express();


app.use(express.json());
app.use(cors());



const uri =
  "mongodb+srv://mdraihan51674:LrmOH0Ya7CSITTSu@cluster0.gxawu34.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let productCollection;
let cartCollection;
let wishlistCollection;
let bannerCollection;
let allusers;


async function run() {
  try {
    await client.connect();
    const database = client.db("Off-White");
      productCollection = database.collection("All-Product");
      cartCollection = database.collection("cart");
       wishlistCollection = database.collection("wishlist");
       bannerCollection=database.collection("Banner")
       allusers=database.collection("All-Users")

    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
  }
}
run().catch(console.dir);




app.get("/", (req, res) => {
  res.send("✅ API is running...");
});


// Add a new user
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      // You can add validation here if needed

      try {
        const result = await  allusers.insertOne(newUser);
        res.status(201).json({ message: 'User added', userId: result.insertedId });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add user' });
      }
    });









// Add product
app.post("/products", async (req, res) => {
  try {
    const data = req.body;
    const result = await productCollection.insertOne(data);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to add product" });
  }
});
//CoatsJackets
//MEN,Clothing/T-shirt
app.get("/products/filter", async (req, res) => {
  try {
    const { category, subCategory, type } = req.query;

    const query = {};

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (type) query.type = type;

    const result = await productCollection.find(query).toArray();

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch filtered products" });
  }
});

//product search api 
app.get("/products/search", async (req, res) => {
  try {
    const { name } = req.query;

    const query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" }; // case-insensitive search
    }

    const result = await productCollection.find(query).toArray();
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to search products" });
  }
});

// ✅ Get Product by ID (Product Details API)
app.get("/api/products/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const query = { _id: new ObjectId(id) };
    const product = await productCollection.findOne(query);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product details:", error);
    res.status(500).json({ message: "Failed to fetch product details" });
  }
});
// GET all products
app.get("/products", async (req, res) => {
  try {
    const products = await productCollection.find().toArray();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
});

//view all category
app.get("/api/men-products", async (req, res) => {
      try {
        const menProducts = await productCollection
          .find({ category: "MEN" }) // filter by category MEN
          .toArray();
        res.json(menProducts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch MEN products" });
      }
    });

    app.get("/api/women-products", async (req, res) => {
      try {
        const menProducts = await productCollection
          .find({ category: "WOMEN" }) // filter by category MEN
          .toArray();
        res.json(menProducts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch WOMEN products" });
      }
    });

        app.get("/api/kid-products", async (req, res) => {
      try {
        const menProducts = await productCollection
          .find({ category: "KID" }) // filter by category MEN
          .toArray();
        res.json(menProducts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch KID products" });
      }
    });






// DELETE product by id
app.delete("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error });
  }
});

//cart add
app.post("/cart", async (req, res) => {
  try {
    const cartItem = req.body;
    const result = await cartCollection.insertOne(cartItem);
    res.status(201).json({ message: "✅ Product added to cart", insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to add product to cart" });
  }
});
//wishlist add
app.post("/api/wishlist", async (req, res) => {
  try {
    const { productId, email } = req.body;

    if (!productId || !email) {
      return res.status(400).json({ message: "productId and email are required" });
    }

    const result = await wishlistCollection.insertOne({
      productId: new ObjectId(productId),
      email,
      addedAt: new Date(),
    });

    res.status(201).json({ message: "Added to wishlist", insertedId: result.insertedId });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
//isngle  data
// app.get("/api/wishlist", async (req, res) => {
//   try {
//     const { email } = req.query;

//     if (!email) {
//       return res.status(400).json({ message: "Email query parameter is required" });
//     }

//     const wishlistItems = await wishlistCollection
//       .find({ email })
//       .toArray();

//     res.status(200).json(wishlistItems);
//   } catch (error) {
//     console.error("Error fetching wishlist:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });


// Assuming you have productCollection & wishlistCollection defined
app.get("/api/wishlist", async (req, res) => {
  const { email } = req.query;

  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    // Get wishlist items for this user
    const wishlistItems = await wishlistCollection.find({ email }).toArray();

    // Fetch full product details for each wishlist item
    const detailedWishlist = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await productCollection.findOne({ _id: new ObjectId(item.productId) });
        return product
          ? { ...product, wishlistId: item._id } // Keep wishlist _id for remove
          : null;
      })
    );

    // Filter out nulls (in case product no longer exists)
    res.status(200).json(detailedWishlist.filter(Boolean));
  } catch (err) {
    console.error("❌ Error fetching wishlist with products:", err);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});







//deleted
app.delete("/api/wishlist/:id", async (req, res) => {
  const id = req.params.id;
  const result = await wishlistCollection.deleteOne({ productId: new ObjectId(id) });
  res.json({ message: "Removed from wishlist", deletedCount: result.deletedCount });
});


 // ✅ POST API - Save Banner URL
    app.post("/banners", async (req, res) => {
      try {
        const { imageUrl,type  } = req.body;

        if (!imageUrl || !type) {
          return res.status(400).json({ message: "Image URL is required" });
        }

        const result = await bannerCollection.insertOne({ 
      imageUrl, 
      type, 
      createdAt: new Date() 
    });
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ message: "Failed to save banner", error });
      }
    });

    // ✅ GET API - Fetch all Banners
app.get("/banners", async (req, res) => {
  try {
    const { type } = req.query;

    // Build filter condition
    const filter = type ? { type: type.toUpperCase() } : {};

    const banners = await bannerCollection.find(filter).toArray();
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch banners", error });
  }
});
// ✅ Delete Banner API
app.delete("/banners/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await bannerCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Banner deleted successfully" });
    } else {
      res.status(404).json({ message: "Banner not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete banner", error });
  }
});








const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
