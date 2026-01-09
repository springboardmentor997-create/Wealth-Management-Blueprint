import React, { useState } from 'react';
import Card from '../../components/common/Card';
import * as reportsApi from '../../api/reportsApi';

const Reports = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (type) => {
    setLoading(true);
    try {
      let response;
      let filename = 'report';

      if (type === 'pdf') {
        response = await reportsApi.downloadPDF();
        filename = 'Wealth_Report.pdf';
      } else {
        response = await reportsApi.downloadCSV();
        filename = 'Portfolio_Export.csv';
      }

      // Create a hidden link to trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports Center</h1>
      <p className="text-slate-500 mb-8">Generate official documents and export your data.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PDF Card */}
        <Card className="p-8 hover:shadow-lg transition-shadow border-t-4 border-red-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded-full text-2xl">📄</div>
            <h3 className="text-xl font-bold text-slate-800">PDF Statement</h3>
          </div>
          <p className="text-slate-600 mb-6 h-12">
            Get a formal Net Worth statement with asset breakdown. Useful for documentation.
          </p>
          <button 
            onClick={() => handleDownload('pdf')}
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Download PDF'}
          </button>
        </Card>

        {/* CSV Card */}
        <Card className="p-8 hover:shadow-lg transition-shadow border-t-4 border-green-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-full text-2xl">📊</div>
            <h3 className="text-xl font-bold text-slate-800">Excel Export (CSV)</h3>
          </div>
          <p className="text-slate-600 mb-6 h-12">
            Download raw data of all your investments for analysis in Excel or Google Sheets.
          </p>
          <button 
            onClick={() => handleDownload('csv')}
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
             {loading ? 'Generating...' : 'Export CSV'}
          </button>
        </Card>

      </div>
    </div>
  );
};

export default Reports;