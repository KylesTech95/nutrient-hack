require('dotenv').config();

// vars
const express = require('express');
const app = express();
const path = require('path')
const PORT = 3000;
const bp = require('body-parser');
const cors = require('cors');
const expressSession = require('express-session');

const public = '../public'

// session options
const sessionOptions = {
    secret: process.env.SECRETY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        httpOnly: true,              // Protects cookie from client-side scripts
        secure: process.SECURE_HTTP === 'production' // Use HTTPS in production
    }
}

app.use(express.static(path.resolve(__dirname,public)))

app.use(cors());
app.use(bp.urlencoded({extended:true}));
app.use(expressSession(sessionOptions));



// run server
app.listen(PORT, '0.0.0.0', () => {
    console.log('Listening on port ' + PORT);
})