const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const usuarioController = {
  async getAll(req, res) {
    try {
      const usuarios = await Usuario.getAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;

      const existente = await Usuario.getByEmail(email);
      if (existente) return res.status(400).json({ message: 'El email ya está registrado' });

      const hash = await bcrypt.hash(password, 10);
      const id = await Usuario.create({ nombre, email, password: hash, rol });

      res.status(201).json({ id, message: 'Usuario creado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      await Usuario.update(req.params.id, req.body);
      res.json({ message: 'Usuario actualizado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async toggleActivo(req, res) {
    try {
      const { activo } = req.body;
      await Usuario.toggleActivo(req.params.id, activo);
      res.json({ message: activo ? 'Usuario activado' : 'Usuario desactivado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = usuarioController;