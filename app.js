require('dotenv').config()
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const app = express();



const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});







app.set('view engine', 'hbs');

db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database.');
});


app.get('/', (req, res) => {
    res.render('index' , { title: 'Home Page' });
});

app.get('/register', (req, res) => {
    res.render('register' , { title: 'Register Page' });
});

app.get('/index', (req, res) => {
    res.render('index' , { title: 'Home Page' });
});
app.post('/register', (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    db.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)', 
        [first_name, last_name, email, password], 
        (err, result) => {
            if (err) {
                console.log('Error inserting user:', err);
                return res.status(500).send('Server error');
            }   
            res.redirect('/log-in');
        }
    );
});

app.get("/log-in", (req, res) => {
    res.render("log-in", { title: "Login Page" });
});
app.post('/log-in', (req, res) => {
    const { email, password } = req.body;
    db.query(
        'SELECT * FROM users WHERE email = ? AND password = ?', 
        [email, password], 
        (err, results) => {
            if (err) {
                console.log('Error fetching user:', err);
                return res.status(500).send('Server error');
            }
            if (results.length > 0) {
                // Store user info in session
                req.session.user = {
                    first_name: results[0].first_name,
                    last_name: results[0].last_name,
                    email: results[0].email
                };
                res.redirect('/home-page');
            } else {
                res.send('Invalid email or password');
            }
        }
    );
});

app.get('/home-page', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/log-in');
    }
    res.render('home', { 
        title: 'Home Page',
        user: req.session.user
    });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
