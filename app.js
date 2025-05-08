// app.js - Main application file
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bug_tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Configure middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Configure session
app.use(session({
    secret: 'bug-tracker-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/bug_tracker' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Configure flash messages
app.use(flash());

// Configure Passport
app.use(passport.initialize());
app.use(passport.session());

// Load models
const User = require('./src/models/User');
const Bug = require('./src/models/Bug');

// Configure Passport Local Strategy
passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
        try {
            // Find user by username
            const user = await User.findOne({ username });

            // If user not found
            if (!user) {
                return done(null, false, { message: 'Invalid username or password' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Invalid username or password' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Middleware to set global variables
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    res.locals.isAdmin = req.user && req.user.isAdmin || false;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Authentication middleware
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/login');
};

// Admin middleware
const ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    req.flash('error_msg', 'Access denied. Admin privileges required.');
    res.redirect('/dashboard');
};

// Routes

// Home route
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    res.render('index');
});

// Login route - GET
app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});

// Login route - POST
app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

// Logout route
app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            console.error('Logout error:', err);
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });
});

// Register route - GET
app.get('/register', (req, res) => {
    res.render('register');
});

// Register route - POST
app.post('/register', async (req, res) => {
    try {
        const { username, password, password2 } = req.body;
        let errors = [];

        // Validate input
        if (!username || !password || !password2) {
            errors.push({ msg: 'Please fill in all fields' });
        }
        if (password !== password2) {
            errors.push({ msg: 'Passwords do not match' });
        }
        if (password.length < 6) {
            errors.push({ msg: 'Password should be at least 6 characters' });
        }

        if (errors.length > 0) {
            return res.render('register', { errors, username });
        }

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            errors.push({ msg: 'Username already exists' });
            return res.render('register', { errors, username });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            isAdmin: false
        });

        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/login');
    } catch (err) {
        console.error('Registration error:', err);
        req.flash('error_msg', 'Registration failed. Please try again.');
        res.redirect('/register');
    }
});

// Dashboard route
app.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const bugs = await Bug.find().sort({ createdAt: -1 });
        res.render('dashboard', { bugs });
    } catch (err) {
        console.error('Dashboard error:', err);
        req.flash('error_msg', 'Failed to load dashboard');
        res.redirect('/');
    }
});

// Report bug route - GET
app.get('/bugs/new', ensureAuthenticated, (req, res) => {
    res.render('new_bug');
});

// Report bug route - POST
app.post('/bugs', ensureAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { page, description } = req.body;

        // Create new bug
        const newBug = new Bug({
            page,
            description,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : '/images/placeholder.png',
            status: 'open',
            creator: req.user.username,
            creatorId: req.user._id
        });

        await newBug.save();
        req.flash('success_msg', 'Bug reported successfully');
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Bug report error:', err);
        req.flash('error_msg', 'Failed to report bug');
        res.redirect('/bugs/new');
    }
});

// Bug details route
app.get('/bugs/:id', ensureAuthenticated, async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) {
            req.flash('error_msg', 'Bug not found');
            return res.redirect('/dashboard');
        }
        res.render('bug_detail', { bug });
    } catch (err) {
        console.error('Bug detail error:', err);
        req.flash('error_msg', 'Failed to load bug details');
        res.redirect('/dashboard');
    }
});

// Update bug status route - Admin only
app.put('/bugs/:id/status', ensureAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const bug = await Bug.findById(id);

        if (!bug) {
            req.flash('error_msg', 'Bug not found');
            return res.redirect('/dashboard');
        }

        // Only admin can update status (unless it's cancellation by creator)
        if (req.user.isAdmin || (status === 'cancelled' && bug.creator === req.user.username)) {
            bug.status = status;
            await bug.save();
            req.flash('success_msg', `Bug status updated to ${status}`);
        } else {
            req.flash('error_msg', 'You do not have permission to perform this action');
        }

        res.redirect(`/bugs/${id}`);
    } catch (err) {
        console.error('Status update error:', err);
        req.flash('error_msg', 'Failed to update bug status');
        res.redirect('/dashboard');
    }
});

// Admin routes

// Admin dashboard
app.get('/admin', ensureAdmin, async (req, res) => {
    try {
        const bugs = await Bug.find().sort({ createdAt: -1 });
        const users = await User.find({}, 'username isAdmin');
        res.render('admin_dashboard', { bugs, users });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        req.flash('error_msg', 'Failed to load admin dashboard');
        res.redirect('/dashboard');
    }
});

// Update user role (Admin only)
app.put('/users/:id/role', ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isAdmin } = req.body;

        // Don't allow admins to demote themselves
        if (id === req.user.id.toString()) {
            req.flash('error_msg', 'You cannot change your own role');
            return res.redirect('/admin');
        }

        await User.findByIdAndUpdate(id, { isAdmin: isAdmin === 'true' });
        req.flash('success_msg', 'User role updated');
        res.redirect('/admin');
    } catch (err) {
        console.error('Role update error:', err);
        req.flash('error_msg', 'Failed to update user role');
        res.redirect('/admin');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});