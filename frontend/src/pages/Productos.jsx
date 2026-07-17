import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import TableSkeleton from '../components/TableSkeleton';
import Pagination from '../components/Pagination';

export default function Productos() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVacio());
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStock, setFiltroStock] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  function formVacio() {
    return {
      sku: '', nombre: '', descripcion: '', categoria_id: '', proveedor_id: '',
      precio_compra: '', precio_venta: '', stock_actual: '', stock_minimo: '',
      ubicacion: '', imagen_url: ''
    };
  }

  const cargarDatos = async () => {
    setLoading(true);
    const [p, c, pr] = await Promise.all([
      api.get('/productos'),
      api.get('/categorias'),
      api.get('/proveedores')
    ]);
    setProductos(p.data);
    setCategorias(c.data);
    setProveedores(pr.data);
    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, []);
  useEffect(() => { setPaginaActual(1); }, [busqueda, filtroCategoria, filtroStock]);
  useEffect(() => { setPaginaActual(1); }, [porPagina]);

  const abrirNuevo = async () => {
    setEditando(null);
    try {
      const { data } = await api.get('/productos/siguiente-sku');
      setForm({ ...formVacio(), sku: data.sku });
    } catch {
      setForm(formVacio());
    }
    setModalOpen(true);
  };

  const abrirEditar = (producto) => {
    setEditando(producto);
    setForm({ ...producto, categoria_id: producto.categoria_id || '', proveedor_id: producto.proveedor_id || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/productos/${editando.id}`, form);
        toast.success('Producto actualizado');
      } else {
        await api.post('/productos', form);
        toast.success('Producto creado');
      }
      setModalOpen(false);
      cargarDatos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/productos/${confirmDelete.id}`);
      toast.success('Producto eliminado');
      setConfirmDelete(null);
      cargarDatos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = !filtroCategoria || p.categoria_id === parseInt(filtroCategoria);
    const coincideStock = !filtroStock || (filtroStock === 'bajo' && p.stock_actual <= p.stock_minimo);
    return coincideBusqueda && coincideCategoria && coincideStock;
  });

  const totalPaginas = Math.ceil(productosFiltrados.length / porPagina) || 1;
  const productosPagina = productosFiltrados.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Productos</h1>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select
          value={filtroStock}
          onChange={(e) => setFiltroStock(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="">Todo el stock</option>
          <option value="bajo">Solo stock bajo</option>
        </select>
        <select
          value={porPagina}
          onChange={(e) => setPorPagina(Number(e.target.value))}
          className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton columns={6} />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Categoría</th>
                <th className="text-left px-4 py-3 font-medium">Stock</th>
                <th className="text-left px-4 py-3 font-medium">Precio Venta</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosPagina.map((p) => (
                <tr key={p.id} className="border-t border-slate-800 text-white hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-400">{p.sku}</td>
                  <td className="px-4 py-3">{p.nombre}</td>
                  <td className="px-4 py-3 text-slate-400">{p.categoria_nombre || '—'}</td>
                  <td className="px-4 py-3">
                    <StockBadge stock={p.stock_actual} minimo={p.stock_minimo} />
                  </td>
                  <td className="px-4 py-3">S/ {Number(p.precio_venta).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirEditar(p)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                        <Pencil size={15} />
                      </button>
                      {usuario.rol === 'admin' && (
                        <button onClick={() => setConfirmDelete(p)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productosFiltrados.length === 0 && <p className="text-center text-slate-500 py-8">No hay productos que coincidan</p>}
          <Pagination paginaActual={paginaActual} totalPaginas={totalPaginas} onCambiar={setPaginaActual} />
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Campo label="SKU" value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} required />
                <Campo label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} required />
              </div>

              <Campo label="Descripción" value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} textarea />

              <div className="grid grid-cols-2 gap-3">
                <Select label="Categoría" value={form.categoria_id} onChange={(v) => setForm({ ...form, categoria_id: v })} opciones={categorias} />
                <Select label="Proveedor" value={form.proveedor_id} onChange={(v) => setForm({ ...form, proveedor_id: v })} opciones={proveedores} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Precio Compra" type="number" step="0.01" value={form.precio_compra} onChange={(v) => setForm({ ...form, precio_compra: v })} required />
                <Campo label="Precio Venta" type="number" step="0.01" value={form.precio_venta} onChange={(v) => setForm({ ...form, precio_venta: v })} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {!editando && (
                  <Campo label="Stock Inicial" type="number" value={form.stock_actual} onChange={(v) => setForm({ ...form, stock_actual: v })} required />
                )}
                <Campo label="Stock Mínimo" type="number" value={form.stock_minimo} onChange={(v) => setForm({ ...form, stock_minimo: v })} required />
              </div>

              <Campo label="Ubicación" value={form.ubicacion} onChange={(v) => setForm({ ...form, ubicacion: v })} />

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-2.5 mt-2 transition-colors">
                {editando ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={!!confirmDelete}
        title="Eliminar producto"
        message={`¿Seguro que quieres eliminar "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function Campo({ label, value, onChange, type = 'text', textarea, required, step }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      {textarea ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
          rows={2}
        />
      ) : (
        <input
          type={type}
          step={step}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
        />
      )}
    </div>
  );
}

function Select({ label, value, onChange, opciones }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
      >
        <option value="">Sin asignar</option>
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>{o.nombre}</option>
        ))}
      </select>
    </div>
  );
}

function StockBadge({ stock, minimo }) {
  let estilo = 'bg-emerald-500/10 text-emerald-400';
  let label = stock;

  if (stock === 0) {
    estilo = 'bg-red-500/10 text-red-400';
  } else if (stock <= minimo) {
    estilo = 'bg-amber-500/10 text-amber-400';
  }

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${estilo}`}>
      {label}
    </span>
  );
}