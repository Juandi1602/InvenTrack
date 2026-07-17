const Producto = require('../models/Producto');

const productoController = {
  async getAll(req, res) {
    try {
      const productos = await Producto.getAll();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const producto = await Producto.getById(req.params.id);
      if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
      res.json(producto);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const id = await Producto.create(req.body);
      res.status(201).json({ id, message: 'Producto creado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      await Producto.update(req.params.id, req.body);
      res.json({ message: 'Producto actualizado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      await Producto.delete(req.params.id);
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async siguienteSku(req, res) {
    try {
      const [rows] = await require('../config/db').query(
        `SELECT sku FROM productos WHERE sku REGEXP '^PROD-[0-9]+$' ORDER BY CAST(SUBSTRING(sku, 6) AS UNSIGNED) DESC LIMIT 1`
      );
      let siguiente = 1;
      if (rows.length > 0) {
        const num = parseInt(rows[0].sku.split('-')[1]);
        siguiente = num + 1;
      }
      const sku = `PROD-${String(siguiente).padStart(3, '0')}`;
      res.json({ sku });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = productoController;