const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const { run, get, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Servidor activo' });
});

app.post('/api/contact', async (req, res) => {
  try {
    const {
      nombre = '',
      empresa = '',
      email = '',
      telefono = '',
      motivo = '',
      area = '',
      mensaje = '',
    } = req.body;

    if (!nombre.trim() || !empresa.trim() || !email.trim() || !motivo.trim() || !mensaje.trim()) {
      return res.status(400).json({ ok: false, message: 'Completa todos los campos obligatorios.' });
    }

    await run(
      `INSERT INTO contact_requests (nombre, empresa, email, telefono, motivo, area, mensaje)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        empresa.trim(),
        email.trim().toLowerCase(),
        telefono.trim(),
        motivo.trim(),
        area.trim(),
        mensaje.trim(),
      ]
    );

    res.json({ ok: true, message: 'Solicitud registrada correctamente en la base de datos.' });
  } catch (error) {
    console.error('Error al guardar solicitud:', error);
    res.status(500).json({ ok: false, message: 'No se pudo guardar la solicitud.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { userId = '', password = '' } = req.body;

    if (!userId.trim() || !password.trim()) {
      return res.status(400).json({ ok: false, message: 'Ingresa tu ID y contraseña.' });
    }

    const user = await get('SELECT * FROM users WHERE user_id = ?', [userId.trim()]);

    if (!user) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas.' });
    }

    res.json({
      ok: true,
      message: 'Inicio de sesión correcto.',
      user: {
        id: user.id,
        userId: user.user_id,
        nombre: user.nombre,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ ok: false, message: 'No se pudo iniciar sesión.' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email = '' } = req.body;

    if (!email.trim()) {
      return res.status(400).json({ ok: false, message: 'Ingresa un correo válido.' });
    }

    await run(
      'INSERT INTO password_reset_requests (email) VALUES (?)',
      [email.trim().toLowerCase()]
    );

    res.json({ ok: true, message: 'Solicitud de recuperación registrada.' });
  } catch (error) {
    console.error('Error en recuperación:', error);
    res.status(500).json({ ok: false, message: 'No se pudo registrar la solicitud.' });
  }
});

app.get('/admin/solicitudes', async (_req, res) => {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(path.join(__dirname, 'zevorus.db'));
    db.all('SELECT * FROM contact_requests ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error al consultar solicitudes');
      }

      const rowsHtml = rows.map((row) => `
        <tr>
          <td>${row.id}</td>
          <td>${escapeHtml(row.nombre)}</td>
          <td>${escapeHtml(row.empresa)}</td>
          <td>${escapeHtml(row.email)}</td>
          <td>${escapeHtml(row.telefono || '')}</td>
          <td>${escapeHtml(row.motivo)}</td>
          <td>${escapeHtml(row.area || '')}</td>
          <td>${escapeHtml(row.mensaje)}</td>
          <td>${row.created_at}</td>
        </tr>
      `).join('');

      res.send(`<!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Solicitudes | Zevorus</title>
        <style>
          body{font-family:Arial,sans-serif;background:#071629;color:#f5f8fc;margin:0;padding:24px}
          h1{margin-top:0}
          table{width:100%;border-collapse:collapse;background:#0f2440}
          th,td{border:1px solid rgba(255,255,255,.12);padding:10px;vertical-align:top;text-align:left}
          th{background:#102947}
          tr:nth-child(even){background:#0b213c}
        </style>
      </head>
      <body>
        <h1>Solicitudes registradas</h1>
        <p>Vista rápida de formularios guardados en SQLite.</p>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Empresa</th><th>Email</th><th>Teléfono</th><th>Motivo</th><th>Área</th><th>Mensaje</th><th>Fecha</th>
            </tr>
          </thead>
          <tbody>${rowsHtml || '<tr><td colspan="9">Sin solicitudes aún.</td></tr>'}</tbody>
        </table>
      </body>
      </html>`);
      db.close();
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno');
  }
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor Zevorus listo en http://localhost:${PORT}`);
      console.log('Usuario demo: cliente.demo');
      console.log('Contraseña demo: Zevorus2026*');
    });
  })
  .catch((error) => {
    console.error('No se pudo inicializar la base de datos:', error);
    process.exit(1);
  });
