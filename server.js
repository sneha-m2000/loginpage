const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nocache = require('nocache');
const router = require('./Routes/userRoutes');
const adminRouter = require("./Routes/adminRoutes");
const connectDB = require('./database/connection');
const app = express();
const session = require('express-session');
const dotenv = require("dotenv");
dotenv.config()
// Initialize session middleware
app.use(session({
  secret: 'secret', // Replace with a strong and secure secret
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 60000 } // Adjust cookie settings as needed
}));

connectDB(); // Ensure this function correctly connects to your database

const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(nocache());

app.set('view engine', 'ejs');

app.use('/statics', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/route', router);
app.use('/admin', adminRouter);

// Home route
app.get('/', (req, res) => {
  try {
    const user = req.session.user;
    const messages = req.session.message;
    req.session.message = null; // Clear the message after retrieving it
    console.log(user);
    if (user) {
      console.log("Logged in user:", user);
      res.render('dashboard',{title:'dashboard',user});
    } else {
      // const msg = req.query.message;
      res.render('base', { title: 'Login System', message: messages });
    }
  } catch (error) {
    console.error("Error in home route:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on localhost:${port}`);
});


