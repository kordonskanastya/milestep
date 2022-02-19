const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const {auth, pages} = require('./src/routes');
const {authenticateToken} = require('./src/middlewares');
const {port} = require('./src/config');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', exphbs({
    extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', 'views');


app.get('/', (req, res) => {
    res.render('home');
});

app.use('/auth', auth);

app.use(authenticateToken);

app.use('/pages', pages);

app.listen(port);
