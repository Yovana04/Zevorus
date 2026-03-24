# Zevorus Fullstack

Este proyecto convierte tu sitio estático en una versión con backend y base de datos.

## Incluye
- Backend con Node.js + Express
- Base de datos SQLite (`zevorus.db` se crea automáticamente al arrancar)
- Formulario de contacto funcional
- Login de soporte funcional
- Solicitudes de recuperación de contraseña
- Vista rápida de registros en `/admin/solicitudes`

## Instalación
1. Abre la carpeta en VS Code
2. En la terminal ejecuta:

```bash
npm install
npm start
```

3. Abre en el navegador:
- `http://localhost:3000/index.html`
- `http://localhost:3000/Contacto.html`
- `http://localhost:3000/Soporte.html`

## Credenciales demo de soporte
- Usuario: `cliente.demo`
- Contraseña: `Zevorus2026*`

## Endpoints
- `POST /api/contact`
- `POST /api/login`
- `POST /api/forgot-password`
- `GET /admin/solicitudes`

## Notas
- Si más adelante quieres usar MySQL o PostgreSQL, se puede migrar.
- En producción conviene agregar sesiones, JWT, validaciones extra y panel admin protegido.
