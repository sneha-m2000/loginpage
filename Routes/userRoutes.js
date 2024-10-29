const express = require("express");
const bcrypt = require("bcrypt");
const userCollection = require("../models/userCollection");

const router = express.Router();

// User login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userCollection.findOne({ email: email });

        if (!user) {
            req.session.message = 'User not found';
            return res.redirect('/');
        }

        // Compare the provided password with the hashed password in the database
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            req.session.message = 'Invalid password';
            return res.redirect('/');
        }

        // If authentication is successful, set user in session
        req.session.user = user;
        console.log("req.session.user", req.session.user);

        // Redirect to dashboard
        res.render('dashboard', { title: 'Login System', user: req.session.user });
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/?message=Login failed');
    }
});

// User signup route
router.get('/signup', (req, res) => {
    res.render('signup', { msg: null });
    console.log("Inside signup GET");
});

router.post('/signup', async (req, res) => {
    console.log("Inside signup POST");
    const { username, email, password, confirm_password } = req.body;

    try {
        const userData = await userCollection.findOne({ email: email });
        if (userData) {
            return res.render('signup', { msg: 'User already exists' });
        }

        if (password !== confirm_password) {
            return res.render('signup', { msg: 'Passwords do not match' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userCollection({
            username: username,
            email: email,
            password: hashedPassword // Save hashed password
        });

        await user.save();
        req.session.message = 'Account created successfully! Please log in.';
        res.redirect("/");
    } catch (error) {
        console.error("Error during signup:", error);
        res.redirect('/?message=Signup failed');
    }
});

// Example logout route
router.get('/logout', (req, res) => {
    try {
        req.session.destroy();
        res.redirect("/");
    } catch (error) {
        console.error("Logout error:", error);
    }
});

module.exports = router;
