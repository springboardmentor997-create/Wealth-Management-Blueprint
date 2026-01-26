import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Trash2, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';

const WatchlistTable = ({ items, onRemove, prices }) => {
    // Helper to generate mock sparkline data if no history available
    const getSparklineData = (changePercent) => {
        const data = [];
        let val = 100;
        const trend = changePercent >= 0 ? 1 : -1;
        for (let i = 0; i < 20; i++) {
            val += (Math.random() - 0.5 + (0.1 * trend));
            data.push({ v: val });
        }
        return data;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Symbol</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">Sparkline</th>
                        <th className="px-4 py-3 font-medium text-right">Price</th>
                        <th className="px-4 py-3 font-medium text-right">Change</th>
                        <th className="px-4 py-3 font-medium text-right">Change %</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        // Use live price if available, else fallback to db price
                        const liveData = prices[item.symbol] || {};
                        const price = liveData.price || item.current_price;
                        const change = liveData.change ?? (price - item.price_at_added);

                        // Calculate percentage based on previous day (if live) or added price (if static)
                        // For live data, change_percent is usually a string "1.2%"
                        let changePercentStr = liveData.change_percent;
                        if (!changePercentStr && liveData.price && item.price_at_added > 0) {
                            const pct = ((liveData.price - item.price_at_added) / item.price_at_added) * 100;
                            changePercentStr = `${pct.toFixed(2)}%`;
                        } else if (!changePercentStr) {
                            changePercentStr = `${item.price_change_percent}%`;
                        }

                        const isPositive = parseFloat(changePercentStr) >= 0;
                        const trendColor = isPositive ? 'text-green-500' : 'text-red-500';
                        const bgTrend = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';

                        return (
                            <motion.tr
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                layout
                                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                            >
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${bgTrend} ${trendColor}`}>
                                            {item.symbol[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">{item.symbol}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">{item.name}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-4 hidden md:table-cell w-[150px]">
                                    <div className="h-10 w-24 opacity-50">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={getSparklineData(parseFloat(changePercentStr))}>
                                                <Line
                                                    type="monotone"
                                                    dataKey="v"
                                                    stroke={isPositive ? '#22c55e' : '#ef4444'}
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                                <YAxis domain={['dataMin', 'dataMax']} hide />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-right font-mono font-medium">
                                    <div className="animate-pulse-green">
                                        ₹{price.toFixed(2)}
                                    </div>
                                </td>

                                <td className={`px-4 py-4 text-right font-mono text-sm ${trendColor}`}>
                                    {change > 0 ? '+' : ''}{change.toFixed(2)}
                                </td>

                                <td className="px-4 py-4 text-right">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${bgTrend} ${trendColor}`}>
                                        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                        {changePercentStr.replace('%', '')}%
                                    </span>
                                </td>

                                <td className="px-4 py-4 text-right">
                                    <button
                                        onClick={() => onRemove(item.id, item.symbol)}
                                        className="p-2 hover:bg-red-500/20 rounded-full text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </motion.tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default WatchlistTable;
