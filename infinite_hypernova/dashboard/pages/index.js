import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'INIT') {
        setTelemetry(msg.data);
      } else {
        setLogs(prev => [msg, ...prev].slice(0, 50));
        if (msg.type === 'PROFIT') {
           setTelemetry(prev => ({ ...prev, profit: (prev?.profit || 0) + msg.amount }));
        }
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', background: '#000', color: '#0f0', minHeight: '100vh' }}>
      <Head>
        <title>Infinite Hypernova Syndicate</title>
      </Head>
      <h1>INFINITE HYPERNOVA — SYNDICATE MANIFESTO v3.1</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ border: '1px solid #333', padding: 20 }}>
          <h2>Telemetry</h2>
          <p>Profit: {telemetry?.profit || 0} SOL</p>
          <p>Uptime: {telemetry?.uptime || 0}s</p>
          <p>Crashes: {JSON.stringify(telemetry?.crashes || {})}</p>
        </div>

        <div style={{ border: '1px solid #333', padding: 20 }}>
          <h2>Live Logs</h2>
          <div style={{ height: 300, overflowY: 'scroll' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ marginBottom: 5, borderBottom: '1px solid #111' }}>
                <span style={{ color: '#00f' }}>[{log.sender || 'SYSTEM'}]</span> {JSON.stringify(log)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
