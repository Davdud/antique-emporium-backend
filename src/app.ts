if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const passport: any = require('passport');
const session: any = require('express-session');
const flash = require('connect-flash');

//files
require('./config/passport')(passport);
const json = require('./data/products');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
connectDB();

//enviorment vars
const PORT = process.env.PORT || 5000;
const SECRET = process.env.SECRET;

//imports
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

//GraphQL
import { ApolloServer, gql } from 'apollo-server-express';
const graphqlHTTP = require('express-graphql');
const graphql = require('graphql');

const typeDefs = gql`
  type Query {
    hello: String!
  }
`

const resolvers = {
  Query: {
    hello: () => "hello"
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.applyMiddleware({ app });

let limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
});

app.use(
    cors({
        origin: 'https://antique-emporium.netlify.app',
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(limiter);

app.use(
    session({
        secret: SECRET,
        resave: true,
        saveUninitialized: true,
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

app.use((req: any, res: any, next: any) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use('/api', productRoutes);
app.use('/', require('./routes/registrationRoutes.js'));
app.use('/', require('./routes/loginRoutes.js'));

app.get('/status', (req: any, res: any) => {
    if (req.isAuthenticated()) {
        res.json({ message: 'you are logged in!' });
    } else {
        res.status(401).json({ message: 'you must log in' });
    }
});

app.listen(PORT, console.log(`Server running at port ${PORT}`));