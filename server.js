require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Database Connection
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on("connected", () => console.log("✅ MongoDB Connected"));

// Schemas
const User = mongoose.model("User", new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

const Task = mongoose.model("Task", new mongoose.Schema({
    username: String,
    task: String,
    date: String,
    time: String,
    completed: { type: Boolean, default: false }
}));

// Auth Routes
app.post("/register", async (req, res) => {
    try {
        const exists = await User.findOne({ username: req.body.username });
        if (exists) return res.status(400).json({ success: false, message: "User exists" });
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post("/login", async (req, res) => {
    const user = await User.findOne({ username: req.body.username, password: req.body.password });
    if (user) res.json({ success: true });
    else res.json({ success: false });
});

// Task Routes
app.post("/task", async (req, res) => {
    await new Task(req.body).save();
    res.json({ success: true });
});

app.get("/tasks", async (req, res) => {
    const tasks = await Task.find({ username: req.query.username, completed: false });
    res.json(tasks);
});

app.get("/completed", async (req, res) => {
    const tasks = await Task.find({ username: req.query.username, completed: true });
    res.json(tasks);
});

app.put("/complete/:id", async (req, res) => {
    await Task.findByIdAndUpdate(req.params.id, { completed: true });
    res.json({ success: true });
});

app.delete("/delete/:id", async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
module.exports = app;