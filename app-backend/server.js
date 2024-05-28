const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const User = require('./models/User'); // Define this model in the models directory

// Connect to MongoDB
mongoose.connect('mongodb+srv://ecommerce@ecomm.aoxn0vn.mongodb.net/?retryWrites=true&w=majority&appName=ecomm/ecom', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000 // 45 seconds
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});
// Signup Route
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) return res.status(400).send('User already exists');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    
    res.status(201).send('User created');
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid email or password');

    const token = jwt.sign({ id: user._id }, 'jwtSecret', { expiresIn: '1h' });
    res.status(200).json({ token });
});

// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
