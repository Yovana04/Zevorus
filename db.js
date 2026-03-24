const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./zevorus.db');

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS contactos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      correo TEXT,
      mensaje TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS soporte (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT,
      password TEXT
    )
  `);

  db.run(`INSERT INTO soporte (usuario, password) VALUES ('admin', '1234')`);
});

module.exports = db;
