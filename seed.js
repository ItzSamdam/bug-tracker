// seeds.js - Seed database with initial data
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Bug = require('./src/models/Bug');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bug_tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

// Create seed data
const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Bug.deleteMany({});

        console.log('Previous data cleared');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            username: 'admin',
            password: adminPassword,
            isAdmin: true
        });
        await admin.save();

        // Create regular users
        const user1Password = await bcrypt.hash('user123', 10);
        const user1 = new User({
            username: 'user1',
            password: user1Password,
            isAdmin: false
        });
        await user1.save();

        const user2Password = await bcrypt.hash('user123', 10);
        const user2 = new User({
            username: 'user2',
            password: user2Password,
            isAdmin: false
        });
        await user2.save();

        console.log('Users created');

        // Create sample bugs
        const bugs = [
            {
                page: '/products',
                description: 'Add to cart button doesn\'t work on mobile devices. When tapping the button, nothing happens and no items are added to the cart. This issue occurs on both iOS and Android devices.',
                imageUrl: '/images/placeholder.png',
                status: 'open',
                creator: 'user1',
                creatorId: user1._id,
                createdAt: new Date('2025-05-01T10:30:00')
            },
            {
                page: '/login',
                description: 'Password reset email is not being sent. When users request a password reset, they never receive the email. Confirmed this is happening for multiple email providers including Gmail and Outlook.',
                imageUrl: '/images/placeholder.png',
                status: 'in-progress',
                creator: 'user2',
                creatorId: user2._id,
                createdAt: new Date('2025-05-03T14:15:00')
            },
            {
                page: '/checkout',
                description: 'Payment form validation error on Safari browser. When submitting the payment form on Safari, users get a generic "Invalid form" error even when all fields are correctly filled.',
                imageUrl: '/images/placeholder.png',
                status: 'resolved',
                creator: 'user1',
                creatorId: user1._id,
                createdAt: new Date('2025-04-28T09:20:00')
            },
            {
                page: '/profile',
                description: 'Profile picture upload not working. The spinner appears but then nothing happens and the default avatar remains.',
                imageUrl: '/images/placeholder.png',
                status: 'open',
                creator: 'user2',
                creatorId: user2._id,
                createdAt: new Date('2025-05-05T11:45:00')
            },
            {
                page: '/search',
                description: 'Search results not filtered correctly when using category filters. When selecting a category, all results are still shown instead of just the relevant ones.',
                imageUrl: '/images/placeholder.png',
                status: 'cancelled',
                creator: 'user1',
                creatorId: user1._id,
                createdAt: new Date('2025-04-20T16:10:00')
            }
        ];

        await Bug.insertMany(bugs);
        console.log('Sample bugs created');

        console.log('Database seeded successfully!');
        console.log('You can log in with:');
        console.log('- Admin: username="admin", password="admin123"');
        console.log('- User: username="user1", password="user123"');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

// Run the seed function
seedDatabase();