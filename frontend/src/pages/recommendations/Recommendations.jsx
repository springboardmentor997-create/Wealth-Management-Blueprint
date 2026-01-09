import React, { useEffect, useState } from 'react';
import client from '../../api/client';

const Recommendations = () => {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    client.get('/recommendations/').then(res => setRecs(res.data));
  }, []);

  const getTypeStyle = (type) => {
    switch(type) {
      case 'warning': return 'border-l-4 border-yellow-400 bg-yellow-50';
      case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
      case 'success': return 'border-l-4 border-green-500 bg-green-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-slate-900">AI Insights</h1>
      <p className="text-slate-500 mb-8">Personalized recommendations based on your portfolio.</p>

      <div className="space-y-4">
        {recs.map((rec) => (
          <div key={rec.id} className={`p-6 rounded-r-xl shadow-sm ${getTypeStyle(rec.type)}`}>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{rec.title}</h3>
            <p className="text-slate-600">{rec.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Recommendations;