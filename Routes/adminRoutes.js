const express = require("express");
const router = express.Router();
const userCollection = require("../models/userCollection");
const dotenv = require("dotenv")
dotenv.config()


const adminCredentials = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
};

// Admin login route
router.get("/", (req, res) => {
    res.render("adminLogin", { message: null });
});

// Validate admin login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

         // Debug: Check if admin credentials from .env are loaded correctly
         console.log("Admin credentials from .env:", adminCredentials);

         // Debug: Check the email and password received from the login form
         console.log("User input - Email:", email);
         console.log("User input - Password:", password);

        if (email === adminCredentials.email && password === adminCredentials.password) {
            const userDetails = await userCollection.find();
            req.session.user = {
                email: email,
                role: 'admin'
            };
            return res.render("adminDashboard", { userDetails });
        } else {
            res.render("adminLogin", { message: "Incorrect Email or Password" });
        }
    } catch (error) {
        console.error("Admin login error:", error);
        res.redirect("/admin?message=Login failed");
    }
});

// Get user edit page
router.get("/userEdit/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const userData = await userCollection.findOne({ _id: id });
        if (!userData) {
            return res.status(404).send("User not found");
        }
        res.render("editUser", { userData });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Server Error");
    }
});

// Get admin dashboard
router.get("/dashboard", async (req, res) => {
    try {
        const userDetails = await userCollection.find();
        res.render("adminDashboard", { userDetails });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).send("Server Error");
    }
});

// Get add user page
router.get("/add-user", (req, res) => {
    res.render("add_user", { msg: null }); // Pass msg as null
});

// Add user route
router.post("/add-user", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userCollection.findOne({ email: email });
        if (existingUser) {
            return res.render("add_user", { msg: "User already exists!" }); // Pass error message
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userCollection({
            username: username,
            email: email,
            password: hashedPassword,
        });

        await newUser.save();
        res.redirect("/admin/dashboard"); // Redirect to the dashboard after adding the user
    } catch (error) {
        console.error("Error adding user:", error);
        res.render("add_user", { msg: "An error occurred while adding the user." }); // Pass error message
    }
});


// Update user route
router.post('/update/:id', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const id = req.params.id;

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await userCollection.findByIdAndUpdate(
            id,
            { username: username, email: email, password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Server Error");
    }
});

// Delete user route
router.get('/deleteUser/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const userData = await userCollection.findByIdAndDelete(id);
        if (!userData) {
            return res.status(404).send("User not found");
        }
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Server Error");
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/');
}

module.exports = router;
