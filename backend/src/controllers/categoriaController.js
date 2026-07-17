const Categoria = require('../models/Categoria');

const categoriaController = {
  async getAll(req, res) {
    try {
      const categorias = await Categoria.getAll();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const categoria = await Categoria.getById(req.params.id);
      if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
      res.json(categoria);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const id = await Categoria.create(req.body);
      res.status(201).json({ id, message: 'Categoría creada' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      await Categoria.update(req.params.id, req.body);
      res.json({ message: 'Categoría actualizada' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      await Categoria.delete(req.params.id);
      res.json({ message: 'Categoría eliminada' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = categoriaController;