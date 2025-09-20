const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Path to JSON file
const usersFile = path.join(__dirname, 'users.json');

// Helper function to load users
function loadUsers() {
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, JSON.stringify([]));
    }
    const data = fs.readFileSync(usersFile);
    return JSON.parse(data);
}

// Helper function to save users
function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Signup route
app.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    const users = loadUsers();
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ fullName, email, password: hashedPassword });
    saveUsers(users);

    res.send('Signup successful!');
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const users = loadUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Incorrect password');
    }

    res.send(`Welcome ${user.fullName}!`);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// Serve static files (HTML forms)
app.use(express.static(path.join(__dirname, 'public')));