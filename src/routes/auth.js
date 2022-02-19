const express = require('express');
const {createUser, getUserByEmail} = require('../db');
const {getHashedPassword, generateAccessToken} = require('../utils');

const auth = express.Router();

auth.get('/login', (req, res) => {
    res.render('login');
});

auth.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const {password: passwordDB} = await getUserByEmail(email);
    if (passwordDB === getHashedPassword(password)) {
        const accessToken = generateAccessToken(email);
        res.cookie('accessToken', accessToken);
        res.redirect('/pages/protected');
    } else {
        res.render('login', {
            message: 'Invalid username or password',
            messageClass: 'alert-danger'
        });
    }
});


auth.get('/register', (req, res) => {
    res.render('register');
});

auth.post('/register', async (req, res) => {
    const { email, firstName: allNames, password, confirmPassword } = req.body;
    const firstName = allNames[0];
    const lastName = allNames[1];

    if (password === confirmPassword) {
        if (await getUserByEmail(email)) {
            res.render('register', {
                message: 'User already registered.',
                messageClass: 'alert-danger'
            });
            return;
        }
        const hashedPassword = getHashedPassword(password);
        await createUser({
          email,
          firstName,
          lastName,
          password: hashedPassword
        });
        res.render('login', {
            message: 'Registration Complete. Please login to continue.',
            messageClass: 'alert-success'
        });
    } else {
        res.render('register', {
            message: 'Password does not match.',
            messageClass: 'alert-danger'
        });
    }
});

module.exports = auth;
