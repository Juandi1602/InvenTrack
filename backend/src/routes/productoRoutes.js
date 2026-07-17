const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, productoController.getAll);
router.get('/siguiente-sku', verificarToken, productoController.siguienteSku);
router.get('/:id', verificarToken, productoController.getById);
router.post('/', verificarToken, productoController.create);
router.put('/:id', verificarToken, productoController.update);
router.delete('/:id', verificarToken, soloAdmin, productoController.delete);

module.exports = router;