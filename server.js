

const express = require('express');
const path = require('path');
require('dotenv').config();
const sqlite3= require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const db = new sqlite3.Database('database.db');
const SECRET_KEY=`sec1993`;
const axios = require('axios');


app.use(cors());
app.use(bodyParser.json());
const clientDistPath = path.join(__dirname,'todo-client' ,'dist', 'todo-client','browser');
const openaiApiKey = process.env.OPENAI_API_KEY;




app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
 const hashedPassword = await bcrypt.hash(password, 10);
  const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
  db.run(sql, [username, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        res.status(409).json({ error: 'Username already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }

    res.status(201).json({ id: this.lastID, username });
  });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const sql = `SELECT * FROM users WHERE username = ?`;
  db.get(sql, [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '2h' });

    res.json({ token });
  });
});



function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; 
    next();
  });
}



db.serialize(() => {
      db.run('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT NOT NULL, completed INTEGER  DEFAULT 0)');
});



app.get('/todos', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = `SELECT * FROM todos WHERE user_id = ?`;
  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.use(express.static(clientDistPath));




app.post('/todos', authenticateToken, (req, res) => {
  const { task } = req.body;
  const userId = req.user.id;

  if (!task|| typeof task !== 'string'|| !task.trim()) {
    return res.status(400).json({ error: 'Task is required' });
  }
  const sql = `INSERT INTO todos (task, completed, user_id) VALUES (?, 0, ?)`;
  db.run(sql, [task, userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, task, completed: 0 });
  });
});



app.put('/todos/:id', (req, res) => {
    const taskID = req.params.id;
db.run(`UPDATE todos SET completed = 1 WHERE id = ?`, [taskID], function(err) {
    if (err) {
        res.status(500).json({ error: err.message });
        return;
    }
    res.json({message: `Task ${taskID} marked as completed`});
});
});

app.delete('/todos/:id', (req, res) => {
    const taskID = req.params.id;
db.run(`DELETE FROM todos WHERE id = ?`, [taskID], function(err) {
    if (err) {
        res.status(500).json({ error: err.message });
        return;
    }
    res.json({message: `Task ${taskID} deleted`});
});
});




//קישור ל openAI
app.post(`/api/classify-task`, async (req, res) => {
  const taskText = req.body.task;
  if (!taskText) {
    return res.status(400).json({ error: 'Task text is required' });
  }
  try{
    const response=await axios.post(
      `https://api.openai.com/v1/chat/completions`,
      {
        model: `gpt-3.5-turbo`,
        messages: [{ role: `user`, 
             content: `סווג את המשימה שלהלן לקטגוריה אחת בלבד מתוך: עבודה, קניות, בית, אישי,אוכל, קריאה, ספורט , אחר.
החזר רק את שם הקטגוריה, ללא הסברים, ללא תוספות, בלי גרשיים.
משימה: ${taskText}`
          }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          
        }
      }
    );
    const category = response.data.choices[0].message.content.trim();
    res.json({ category });
  } catch (error) {
    console.error('OpenAI API error:', error.response.data|| error.message);
    res.status(500).json({ error: 'Failed to classify task' });
  }
})

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.csr.html'));
});


const port= process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
    return
});

