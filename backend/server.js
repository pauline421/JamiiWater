const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// --- Simulated Data Store (Replaces MongoDB) ---
// In a real application, replace this with Mongoose models and MongoDB connection.
let users = [];
let privateWaterLevels = {}; // Keyed by userId
let communityPosts = [];

// --- Middleware Setup ---
app.use(cors()); // Allow frontend access on different ports
app.use(bodyParser.json());

// --- Utility Functions (Simulating JWT/Database Operations) ---

// Simple, non-secure token generation for simulation
const generateToken = (id, email) => {
    return `mock-jwt-${id}-${Date.now()}`;
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token missing or invalid.' });
    }
    const token = authHeader.split(' ')[1];
    
    // In a real app, verify the JWT signature here.
    // For simulation, we just check the format and extract the user ID part.
    if (token.startsWith('mock-jwt-')) {
        const parts = token.split('-');
        req.userId = parts[2]; // The user ID is the third part
        next();
    } else {
        res.status(401).json({ message: 'Invalid token format.' });
    }
};

// --- API Endpoints ---

// 1. Authentication Endpoints

app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ message: 'User already exists.' });
    }
    const userId = 'user-' + (users.length + 1);
    const newUser = { id: userId, email, password };
    users.push(newUser);

    const token = generateToken(userId, email);
    res.json({ token, userId, email });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user.id, user.email);
    res.json({ token, userId: user.id, email: user.email });
});


// 2. Private Data (Water Levels) Endpoint

app.get('/api/levels', verifyToken, (req, res) => {
    const userId = req.userId;
    let levels = privateWaterLevels[userId];
    
    if (!levels) {
        // Initialize default levels if none exist
        levels = { tank1: 65.3, tank2: 80.1, pot: 44.8 };
        privateWaterLevels[userId] = levels;
    }
    res.json(levels);
});

app.post('/api/levels', verifyToken, (req, res) => {
    const userId = req.userId;
    const newLevels = req.body;
    
    // Validate keys before updating
    if (newLevels && (newLevels.tank1 || newLevels.tank2 || newLevels.pot)) {
        privateWaterLevels[userId] = { ...privateWaterLevels[userId], ...newLevels };
        return res.json({ message: 'Levels updated successfully.' });
    }
    res.status(400).json({ message: 'Invalid data format.' });
});

// 3. Public Data (Community Posts) Endpoints

app.get('/api/community', verifyToken, (req, res) => {
    // Sort posts by timestamp (simulated descending)
    const sortedPosts = [...communityPosts].sort((a, b) => b.createdAt - a.createdAt);
    // Limit to 20 posts
    const limitedPosts = sortedPosts.slice(0, 20);
    res.json(limitedPosts);
});

app.post('/api/community', verifyToken, (req, res) => {
    const { content } = req.body;
    const userId = req.userId;
    const newPost = {
        id: Date.now().toString(),
        content,
        userId,
        username: `User-${userId.substring(5, 9)}`, // Simulating username based on ID
        createdAt: Date.now(),
        // Convert timestamp to human-readable string for frontend display consistency
        createdAtString: new Date().toLocaleString(),
    };
    communityPosts.unshift(newPost); // Add to the beginning

    // Maintain a reasonable array size in memory
    if (communityPosts.length > 50) {
        communityPosts.pop();
    }
    
    res.status(201).json(newPost);
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`JamiiWater Backend running on http://localhost:${PORT}`);
    console.log('Use the copy shortcut (CTRL+C) to stop the server.');
});