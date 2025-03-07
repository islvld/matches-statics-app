const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // пользователь MySQL
  password: 'admin', //пароль MySQL
  database: 'sport_stat', // замените на имя вашей базы данных
  port: '3306'
});

db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
  } else {
    console.log('Подключение к базе данных успешно установлено');
  }
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Секретный ключ для JWT
const JWT_SECRET = 'FORTUNA812';

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  // Хешируем пароль
  const passwordHash = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (username, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `; 

  db.query(sql, [username, email, passwordHash, role || 'user'], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Пользователь успешно зарегистрирован' });
  });
});

// Вход пользователя
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Пользователь не найден' });
    }

    const user = results[0];

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Неверный пароль' });
    }

    // Генерируем JWT-токен
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  });
});

// Middleware для проверки авторизации
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
};

// Middleware для проверки роли администратора
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  next();
};

// DISCIPLINES

// Добавление дисциплины
app.post('/api/disciplines', authenticate, isAdmin, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [result] = await connection.query(
      'INSERT INTO disciplines (name, description) VALUES (?, ?)',
      [req.body.name, req.body.description]
    );

    await connection.query(
      'INSERT INTO audit_log (action, user_id) VALUES (?, ?)',
      ['create_discipline', req.user.id]
    );

    await connection.commit();
    res.json({ id: result.insertId });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: "Transaction failed" });
  } finally {
    connection.release();
  }
});

// Редактирование дисциплины
app.put('/api/disciplines/:id', authenticate, isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const sql = 'UPDATE disciplines SET name = ?, description = ? WHERE id = ?';
  db.query(sql, [name, description, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Дисциплина успешно обновлена' });
  });
});

app.delete('/api/disciplines/:id', authenticate, isAdmin, (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM disciplines WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Дисциплина успешно удалена' });
  });
});

app.get('/api/disciplines', (req, res) => {
  // Запрос для получения дисциплин
  const sql = 'SELECT * FROM disciplines';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// MATCHESZ
app.get('/api/matches', (req, res) => {
  const { disciplineId } = req.query;

  const sql = `
    SELECT 
      m.id, 
      m.start_time, 
      m.end_time, 
      m.status, 
      t1.name AS team1_name, 
      t2.name AS team2_name, 
      m.winner_team_id,
      ms.team1_score,
      ms.team2_score
    FROM matches m
    JOIN teams t1 ON m.team1_id = t1.id
    JOIN teams t2 ON m.team2_id = t2.id
    LEFT JOIN match_statistics ms ON m.id = ms.match_id
    WHERE m.discipline_id = ?
  `;

  db.query(sql, [disciplineId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});