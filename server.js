const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/contacto', (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  db.run(
    'INSERT INTO contactos (nombre, correo, mensaje) VALUES (?, ?, ?)',
    [nombre, correo, mensaje],
    function(err) {
      if (err) return res.status(500).send(err);
      res.send({ success: true });
    }
  );
});

app.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  db.get(
    'SELECT * FROM soporte WHERE usuario = ? AND password = ?',
    [usuario, password],
    (err, row) => {
      if (row) res.send({ success: true });
      else res.send({ success: false });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
