require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.post(
  '/api/echo',
  body('mensaje').isString().trim().isLength({ min: 1, max: 200 }).escape(),
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    res.json({ recibido: req.body.mensaje });
  }
);

app.get('/api/salud', (req, res) => {
  res.json({ status: 'ok' });
});

// Rutas del web service REST de tareas (Sesión 2)
const tareasRouter = require('./routes/tareas');
app.use('/api/tareas', tareasRouter);

const climaRouter = require('./routes/clima');
app.use('/api/clima', climaRouter);

const authRouter = require('./routes/auth');
const verificarToken = require('./middleware/auth');

app.use('/api/auth', authRouter);           // pública: registro y login
app.use('/api/tareas', verificarToken, tareasRouter);  // protegida
app.use('/api/clima', verificarToken, climaRouter);    // protegida

module.exports = app;