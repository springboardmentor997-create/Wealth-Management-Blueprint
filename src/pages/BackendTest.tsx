import { useState } from 'react';

export const BackendTest = () => {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setStatus('Testing...');
    try {
      const response = await fetch('http://localhost:8000/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setStatus('✅ Backend is running!');
      } else {
        setStatus(`❌ Backend responded with status ${response.status}`);
      }
    } catch (error: any) {
      setStatus(`❌ Cannot reach backend: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Backend Connection Test</h2>
      <button onClick={testBackend} disabled={loading} style={{ padding: '10px 20px', marginBottom: '10px' }}>
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>
      <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{status}</p>
    </div>
  );
};

export default BackendTest;
