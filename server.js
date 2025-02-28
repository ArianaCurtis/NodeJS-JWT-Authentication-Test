const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const path = require('path');
const exp = require('constants');
const jwt = require('jsonwebtoken');
var { expressjwt: exjwt } = require("express-jwt");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

const PORT = 3001;

const secretKey = 'My Secret Key';

const jwtMW = exjwt({

    secret: secretKey,
    algorithms: ['HS256'],
    onExpired: async (req, err) => {
        if (new Date() - err.inner.expiredAt < 5000) { return;}
        req.res.redirect('/')
    }
});

let users = [
    {
        id: 1,
        username: 'ariana',
        password: '123'
    },
    {
        is: 2,
        username: 'curtis',
        password: '456'
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username}, secretKey, { expiresIn: 180000});
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        }
        else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect.'
            });
        }
    }
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

app.get('/api/prices', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the price: $9.99.'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'The settings are here.'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next){
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect. 2' 
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});