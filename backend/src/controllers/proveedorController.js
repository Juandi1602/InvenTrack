const Proveedor = require('../models/Proveedor');

const proveedorController = {
  async getAll(req, res) {
    try {
      const proveedores = await Proveedor.getAll();
      res.json(proveedores);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const proveedor = await Proveedor.getById(req.params.id);
      if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
      res.json(proveedor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const id = await Proveedor.create(req.body);
      res.status(201).json({ id, message: 'Proveedor creado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      await Proveedor.update(req.params.id, req.body);
      res.json({ message: 'Proveedor actualizado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      await Proveedor.delete(req.params.id);
      res.json({ message: 'Proveedor eliminado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = proveedorController;