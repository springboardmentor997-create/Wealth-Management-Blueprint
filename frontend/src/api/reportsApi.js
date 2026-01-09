import client from './client';

export const downloadPDF = async () => {
  return await client.get('/reports/summary-pdf', {
    responseType: 'blob', // Important for files
  });
};

export const downloadCSV = async () => {
  return await client.get('/reports/export-csv', {
    responseType: 'blob',
  });
};