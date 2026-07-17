import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/metricas')
      .then(({ data }) => setMetricas(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Cargando...</div>;
  if (!metricas) return <div className="p-8 text-red-400">Error al cargar métricas</div>;

  const cards = [
    { label: 'Valor de Inventario', value: `S/ ${Number(metricas.valor_inventario).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Total Productos', value: metricas.total_productos, icon: Package, color: 'text-indigo-400' },
    { label: 'Unidades en Stock', value: metricas.total_unidades, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Stock Bajo', value: metricas.productos_stock_bajo.length, icon: AlertTriangle, color: 'text-amber-400' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Productos más movidos</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metricas.productos_mas_movidos}>
              <XAxis dataKey="nombre" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.slice(0, 10)} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="total_movido" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Productos con stock bajo</h2>
          {metricas.productos_stock_bajo.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay productos con stock bajo 🎉</p>
          ) : (
            <ul className="space-y-2">
              {metricas.productos_stock_bajo.map((p) => (
                <li key={p.id} className="flex justify-between items-center bg-slate-800/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-white">{p.nombre}</span>
                  <span className="text-xs text-amber-400 font-medium">{p.stock_actual} / {p.stock_minimo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}