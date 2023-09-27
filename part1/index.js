const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect("mongodb://0.0.0.0:27017/mydatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define Mongoose schema and model for users
const userSchema = new mongoose.Schema({
  title: String,
  firstName: String,
  lastName: String,
  userId: String,
  picture: String,
});

const User = mongoose.model("User", userSchema);

// Define Mongoose schema and model for posts
const postSchema = new mongoose.Schema({
  id: String,
  image: String,
  likes: Number,
  tags: [String],
  text: String,
  publishDate: String,
  owner: {
    id: String,
    title: String,
    firstName: String,
    lastName: String,
    picture: String,
  },
});

const Post = mongoose.model("Post", postSchema);

// Fetch users data from the API and store it in the database
const fetchAndStoreUsers = async () => {
  try {
    const response = await axios.get("https://dummyapi.io/data/v1/user", {
      headers: { "app-id": "6514141cbac0bd66c84cabdb" },
    });

    const users = response.data.data;

    // Store users in the database
    await User.insertMany(users);

    console.log("Users data has been fetched and stored.");
  } catch (error) {
    console.error("Error fetching and storing users data:", error.message);
  }
};

// Fetch posts data for a given user ID from the API and store it in the database
const fetchAndStorePosts = async (userId) => {
  try {
    const response = await axios.get(
      `https://dummyapi.io/data/v1/user/${userId}/post`,
      {
        headers: { "app-id": "6514141cbac0bd66c84cabdb" },
      }
    );

    const posts = response.data.data;

    // Store posts in the database
    await Post.insertMany(posts);

    console.log(`Posts data for user ${userId} has been fetched and stored.`);
  } catch (error) {
    console.error(
      `Error fetching and storing posts data for user ${userId}:`,
      error.message
    );
  }
};

// Route to fetch and store users
app.get("/fetch-users", async (req, res) => {
  await fetchAndStoreUsers();
  res.send("Fetching and storing users data...");
});

// Route to fetch and store posts for a given user
app.get("/fetch-posts/:userId", (req, res) => {
  const userId = req.params.userId;
  fetchAndStorePosts(userId);
  res.send(`Fetching and storing posts data for user ${userId}...`);
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
