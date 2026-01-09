import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as portfolioApi from '../../api/portfolioApi'; 
import Loader from '../../components/common/Loader';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await portfolioApi.getTransactionHistory();
        console.log("Transaction Data:", response.data); // Debugging

        const data = response.data;
        // Handle different response structures
        if (Array.isArray(data)) setTransactions(data);
        else if (data?.transactions) setTransactions(data.transactions);
        else if (data?.data) setTransactions(data.data);
        else setTransactions([]);
        
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatMoney = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

  if (loading) return <div className="flex justify-center p-10"><Loader /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={() => navigate('/portfolio')} className="mb-6 text-slate-500 hover:text-slate-800">
        &larr; Back to Portfolio
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Asset</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Units</th>
              <th className="p-4 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {transactions.map((tx, index) => (
              <tr key={index} className="hover:bg-slate-50">
                <td className="p-4 text-slate-600">{formatDate(tx.created_at || new Date())}</td>
                
                {/* CORRECT KEYS MATCHING BACKEND */}
                <td className="p-4 font-bold text-slate-800">{tx.asset_name}</td>
                <td className="p-4 text-slate-500">{tx.category}</td>
                <td className="p-4 text-right text-slate-600">{tx.units}</td>
                <td className="p-4 text-right font-bold text-slate-900">
                  {formatMoney(tx.amount_invested)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;