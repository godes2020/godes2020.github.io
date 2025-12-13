const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Change this in production

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = process.env.DATABASE_URL || './game.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDatabase();
  }
});

function initDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS game_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    game_data TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
}

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (username.length < 3 || username.length > 16 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password too short' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
      res.json({ token, user: { id: this.lastID, username } });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username } });
  });
});

app.get('/api/game-state', authenticateToken, (req, res) => {
  db.get('SELECT game_data FROM game_states WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ gameState: row ? JSON.parse(row.game_data) : null });
  });
});

app.post('/api/game-state', authenticateToken, (req, res) => {
  const { gameState } = req.body;

  if (!gameState) return res.status(400).json({ error: 'Game state required' });

  const gameData = JSON.stringify(gameState);

  db.run('INSERT OR REPLACE INTO game_states (user_id, game_data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    [req.user.id, gameData], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    });
});

app.get('/api/leaderboard', (req, res) => {
  const type = req.query.type || 'rebirths';
  
  let field;
  switch (type) {
    case 'rebirths':
      field = '$.rebirths';
      break;
    case 'gold':
      field = '$.gold';
      break;
    case 'clickDamage':
      field = '$.clickDamage';
      break;
    case 'autoDamage':
      field = '$.autoDamage';
      break;
    default:
      field = '$.rebirths';
  }

  db.all(`
    SELECT username, MAX(CAST(JSON_EXTRACT(game_data, '${field}') AS REAL)) as value
    FROM users u
    JOIN game_states gs ON u.id = gs.user_id
    GROUP BY username
    ORDER BY value DESC
    LIMIT 10
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ leaderboard: rows });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});