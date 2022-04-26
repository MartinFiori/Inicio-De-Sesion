import express from 'express';
import handlebars from 'express-handlebars';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import MongoStore from 'connect-mongo';
import {
    Strategy as LocalStrategy
} from 'passport-local';
import {
    dirname
} from 'path';
import {
    fileURLToPath
} from 'url';

const __dirname = dirname(fileURLToPath(
    import.meta.url));

// Using express
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// Initializing handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

// Connecting MongoDB
const URL = 'mongodb+srv://teco:123@codercluster.rx1gy.mongodb.net/InicioDeSesionDB?retryWrites=true&w=majority'
mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw new Error("Couldn't connect to db 😓")
    console.log('db connected 😎')
})

// creating a session
const tenMins = 60 * 10
app.use(session({
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://teco:123@codercluster.rx1gy.mongodb.net/InicioDeSesionDB?retryWrites=true&w=majority',
        ttl: tenMins
    }),
    secret: '6EZWQvFAFp8PjZYm73TEmAdBSqrnZanVFcJ7yZhPd2f8RQjNH34Et',
    resave: true,
    saveUninitialized: true,
}))

// Settings passport
app.use(passport.initialize());
app.use(passport.session());

// Serialización del passport
passport.serializeUser((user, done) => {
    return done(null, user.id);
})

// Deserialización
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        return done(err, user)
    })
})

// Setting passport Strategy
passport.use('regist', new LocalStrategy({
    passReqToCallback: true
}, (req, username, password, done) => {
    User.findOne({
        username: username
    }, (err, user) => {
        if (err) return done(err);
        if (user) return done(null, false, {
            message: 'user already exists'
        });
        const newUser = {
            name: req.body.name,
            username: username,
            password: createHash(password)
        }
        User.create(newUser, (err, userCreated) => {
            if (err) return done(err);
            return done(null, userCreated)
        })
    })
}))

// Crypting passwords
const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}


// ROUTES
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/mierda', (req, res) => {
    res.render('mierda');
});

app.post('/signupForm', passport.authenticate('regist', {
    failureRedirect: '/signup'
}), (req, res) => {
    // res.redirect('/')
    console.log(req.body)
    res.send(`<h1>${req.body.username}</h1>`)
})