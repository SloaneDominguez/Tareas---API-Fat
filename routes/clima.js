const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const { obtenerClima } = require('../services/clima');

function validar(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
  next();
}

// GET /api/clima/:ciudad — consulta el clima de una ciudad, independiente de las tareas
router.get(
  '/:ciudad',
  param('ciudad')
    .trim()
    .notEmpty().withMessage('La ciudad no puede estar vacía')
    .isLength({ min: 2, max: 60 }).withMessage('La ciudad debe tener entre 2 y 60 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('La ciudad solo puede contener letras y espacios')
    .escape(),
  validar,
  async (req, res) => {
    try {
      const clima = await obtenerClima(req.params.ciudad);
      res.status(200).json(clima);
    } catch (error) {
      // No exponemos el error técnico crudo del servicio externo,
      // solo un mensaje claro para el cliente.
      res.status(502).json({
        error: 'No se pudo obtener el clima del servicio externo',
        detalle: error.message
      });
    }
  }
);

module.exports = router;