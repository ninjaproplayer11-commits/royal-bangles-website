import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  orders: any[];
}

const SalesChart: React.FC<Props> = ({ orders }) => {
  const monthlyData = useMemo(() => {
    const months: Record<string, { revenue: number; count: number }> = {};
    const now = new Date();

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months[key] = { revenue: 0, count: 0 };
    }

    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (months[key]) {
        months[key].revenue += o.total || 0;
        months[key].count += 1;
      }
    });

    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  }, [orders]);

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    orders.forEach(o => o.items?.forEach((i: any) => {
      cats[i.category || 'Other'] = (cats[i.category || 'Other'] || 0) + (i.price * i.quantity);
    }));
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  const totalCatRevenue = categoryData.reduce((acc, [, v]) => acc + v, 0) || 1;

  const catColors = ['bg-gold', 'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-pink-400'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Revenue Bar Chart */}
      <div className="bg-[#111] p-12 rounded-[4rem] border border-white/5">
        <h3 className="text-2xl font-playfair font-bold mb-2 italic text-gold">Monthly Revenue</h3>
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-10">Last 6 months</p>
        <div className="flex items-end gap-4 h-48">
          {monthlyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <span className="text-[9px] text-white/30 font-bold">
                {d.revenue > 0 ? `₹${(d.revenue / 1000).toFixed(0)}k` : ''}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                className="w-full bg-gold/20 rounded-t-xl relative overflow-hidden group hover:bg-gold/30 transition-colors cursor-pointer min-h-[4px]"
                style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 2)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-gold/60 to-gold/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              <span className="text-[8px] text-white/30 font-bold uppercase">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-[#111] p-12 rounded-[4rem] border border-white/5">
        <h3 className="text-2xl font-playfair font-bold mb-2 italic text-gold">Revenue by Category</h3>
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-10">Top performing categories</p>
        {categoryData.length === 0 ? (
          <p className="text-white/20 italic text-center py-10">No data yet</p>
        ) : (
          <div className="space-y-6">
            {categoryData.map(([cat, rev], i) => (
              <div key={cat}>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{cat}</span>
                  <span className="text-[10px] font-bold text-gold">₹{rev.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(rev / totalCatRevenue) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full ${catColors[i] || 'bg-gold'} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;
