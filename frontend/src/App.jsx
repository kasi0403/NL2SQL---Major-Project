import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactFlow, { Background, Controls, MarkerType, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Send, AlertTriangle, CheckCircle2, Table as TableIcon, Share2, MessageSquare, Activity, TerminalSquare, AlertCircle, Key, Link as LinkIcon, Download, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './App.css';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function maskDbUrl(url) {
  if (!url) return '';
  const firstSlash = url.indexOf('/');
  const lastSlash = url.lastIndexOf('/');
  if (lastSlash === -1) return '***';
  return url.substring(0, firstSlash) + '***' + url.substring(lastSlash);
}

function MultiChart({ chart, id }) {
  const chartRef = useRef(null);
  const exportAsImage = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.download = `${chart.title || 'chart'}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  if (!chart || !chart.data || chart.data.length === 0) return null;

  return (
    <div id={id} style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, color: 'var(--primary)' }}>{chart.title}</h4>
        <button className="chat-submitBtn" style={{ background: 'transparent', padding: '5px' }} onClick={exportAsImage} title="Export Chart"><ImageIcon size={16} color="var(--primary)" /></button>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: 300, background: '#111', padding: '10px', borderRadius: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'pie' ? (
            <PieChart>
              <Pie data={chart.data} dataKey={chart.y} nameKey={chart.x} cx="50%" cy="50%" outerRadius={100} label>
                {chart.data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', color: '#fff' }} />
              <Legend />
            </PieChart>
          ) : chart.type === 'line' ? (
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={chart.x} stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey={chart.y} stroke="#82ca9d" name={chart.y} strokeWidth={3} />
            </LineChart>
          ) : (
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={chart.x} stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', color: '#fff' }} />
              <Legend />
              <Bar dataKey={chart.y} fill="#8884d8" name={chart.y} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SchemaDiagram({ schema }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!schema) return;

    let initialNodes = [];
    let initialEdges = [];

    Object.keys(schema).forEach((tableName, idx) => {
      // Calculate a simple grid layout avoiding overlaps
      const x = (idx % 3) * 350 + 50;
      const y = Math.floor(idx / 3) * 200 + 50;

      const pks = schema[tableName].columns.filter(c => c.is_pk).map(c => c.name);

      initialNodes.push({
        id: tableName,
        position: { x, y },
        style: {
          background: 'var(--bg-color)',
          border: '1px solid var(--primary)',
          borderRadius: '8px',
          padding: '10px',
          minWidth: '200px',
          color: 'var(--text-primary)',
          boxShadow: '0 4px 12px rgba(88,166,255,0.2)'
        },
        data: {
          label: (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderBottom: '1px solid var(--primary)', paddingBottom: '8px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={14} /> {tableName}
              </div>
              {pks.length > 0 && <div style={{ fontSize: '0.8rem', color: '#eab308', marginTop: '8px' }}>PK: {pks.join(', ')}</div>}
            </div>
          )
        }
      });

      schema[tableName].foreign_keys?.forEach((fk, fIdx) => {
        if (schema[fk.referred_table]) {
          initialEdges.push({
            id: `e-${tableName}-${fk.referred_table}-${fIdx}`,
            source: tableName,
            target: fk.referred_table,
            animated: true,
            label: `${fk.constrained_columns.join(',')} -> ${fk.referred_columns.join(',')}`,
            labelStyle: { fill: 'var(--accent)', fontSize: '10px', fontWeight: 'bold' },
            labelBgStyle: { fill: 'var(--bg-color)' },
            style: { stroke: 'var(--accent)', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'var(--accent)'
            }
          });
        }
      });
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [schema]);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 300px)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="var(--border-color)" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function App() {
  const [dbUrl, setDbUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [dbType, setDbType] = useState(null);
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [isUrlFocused, setIsUrlFocused] = useState(false);

  const [activeTab, setActiveTab] = useState('tables'); // 'tables', 'relations', 'chat'

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Hello! I am your Database Multi-Agent. You can ask me anything about your data.' }
  ]);
  const [isQuerying, setIsQuerying] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!dbUrl) return;

    setIsConnecting(true);
    setError(null);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/connect', { url: dbUrl });

      if (response.data.success) {
        setIsConnected(true);
        setDbType(response.data.db_type);
        setSchema(response.data.schema);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const exportToExcel = (results, title = "omni_data") => {
    if (!results || !results.length) return;
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Results");
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const exportToPDF = async (msg, msgIndex) => {
    if (!msg || !msg.results || !msg.results.length) return;
    const { results, insights, anomalies, sql, text, charts } = msg;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    // Report Header
    doc.setFontSize(22);
    doc.setTextColor(88, 166, 255);
    doc.text("OmniQuery Data Insights Report", 15, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Message ID: ${msgIndex}`, 15, currentY);
    currentY += 10;

    doc.setDrawColor(88, 166, 255);
    doc.setLineWidth(0.5);
    doc.line(15, currentY, pageWidth - 15, currentY);
    currentY += 10;

    // User Query
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.setFont("helvetica", "bold");
    doc.text("Analysis Context:", 15, currentY);
    currentY += 7;
    doc.setFont("helvetica", "normal");
    const queryLines = doc.splitTextToSize(text || 'Data analysis report', pageWidth - 30);
    doc.text(queryLines, 15, currentY);
    currentY += (queryLines.length * 7) + 5;

    // SQL
    if (sql) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(88, 166, 255);
      doc.text("Generated SQL Query:", 15, currentY);
      currentY += 7;
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      const sqlLines = doc.splitTextToSize(sql, pageWidth - 40);
      doc.setFillColor(245, 247, 250);
      doc.rect(15, currentY - 4, pageWidth - 30, (sqlLines.length * 5) + 6, 'F');
      doc.text(sqlLines, 20, currentY);
      currentY += (sqlLines.length * 5) + 12;
    }

    // Insights and Anomalies in Two columns or sequential
    const renderList = (title, items, color) => {
      if (!items || items.length === 0) return;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(color[0], color[1], color[2]);
      if (currentY > 260) { doc.addPage(); currentY = 20; }
      doc.text(title, 15, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      items.forEach(item => {
        const itemLines = doc.splitTextToSize(`• ${item}`, pageWidth - 35);
        if (currentY + (itemLines.length * 5) > 280) { doc.addPage(); currentY = 20; }
        doc.text(itemLines, 20, currentY);
        currentY += (itemLines.length * 6);
      });
      currentY += 5;
    };

    renderList("Smart Insights:", insights, [46, 160, 67]);
    renderList("Anomaly Detection:", anomalies, [215, 58, 73]);

    // Data Table
    if (results && results.length > 0) {
      const headers = [Object.keys(results[0])];
      const dataRows = results.map(row => Object.values(row));

      autoTable(doc, {
        startY: currentY + 5,
        head: headers,
        body: dataRows,
        theme: 'grid',
        headStyles: { fillColor: [88, 166, 255], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: 50 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
          currentY = data.cursor.y;
        }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Charts
    if (charts && charts.length > 0) {
      for (let i = 0; i < charts.length; i++) {
        const chartId = `chart-${msgIndex}-${i}`;
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
          try {
            const canvas = await html2canvas(chartElement, {
              backgroundColor: '#111',
              scale: 2
            });
            const imgData = canvas.toDataURL('image/png');
            if (currentY + 100 > 280) { doc.addPage(); currentY = 20; }
            doc.addImage(imgData, 'PNG', 15, currentY, pageWidth - 30, 95);
            currentY += 105;
          } catch (err) {
            console.error("Failed to capture chart for PDF", err);
          }
        }
      }
    }

    // Footer with Page Numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, 290);
      doc.text("OmniQuery Multi-Agent Systems Report", 15, 290);
    }

    doc.save(`OmniQuery_Analysis_${msgIndex}.pdf`);
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !isConnected) return;

    const userMessage = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsQuerying(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/query', { query: userMessage });

      if (response.data.success) {
        setMessages(prev => [...prev, {
          type: 'ai',
          sql: response.data.sql,
          results: response.data.results,
          insights: response.data.insights,
          anomalies: response.data.anomalies,
          charts: response.data.charts,
          follow_ups: response.data.follow_ups,
          text: 'Here is the analysis based on your query:'
        }]);
      } else {
        setMessages(prev => [...prev, { type: 'error', text: response.data.error }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: 'error', text: err.response?.data?.error || err.message }]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>OmniQuery</h1>
        <p>Natural Language to SQL Multi-Agent Tool</p>
      </header>

      <form className="connection-form" onSubmit={handleConnect}>
        <input
          type="text"
          className="connection-input"
          placeholder="postgresql://user:pass@localhost:5432/dbname"
          value={isUrlFocused && !isConnected ? dbUrl : (dbUrl ? maskDbUrl(dbUrl) : '')}
          onFocus={() => setIsUrlFocused(true)}
          onBlur={() => setIsUrlFocused(false)}
          onChange={(e) => setDbUrl(e.target.value)}
          disabled={isConnected || isConnecting}
        />
        <button type="submit" className="btn" disabled={isConnecting || isConnected}>
          {isConnecting ? (
            <><Activity size={18} className="animate-spin" /> Connecting<span className="loading-dots"></span></>
          ) : isConnected ? (
            <><CheckCircle2 size={18} color="var(--success)" /> {dbType} Connected</>
          ) : (
            <><Database size={18} /> Connect DB</>
          )}
        </button>
      </form>

      {error && (
        <div className="error-card glass-panel" style={{ marginBottom: "1rem" }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {isConnected && (
        <div className="dashboard">
          <div className="tabs">
            <button className={`tab-item ${activeTab === 'tables' ? 'active' : ''}`} onClick={() => setActiveTab('tables')}>
              <TableIcon size={18} /> Detailed Tables
            </button>
            <button className={`tab-item ${activeTab === 'relations' ? 'active' : ''}`} onClick={() => setActiveTab('relations')}>
              <Share2 size={18} /> Schema Relationships
            </button>
            <button className={`tab-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              <MessageSquare size={18} /> Chat Agent
            </button>
          </div>

          <main className="main-content glass-panel">
            {activeTab === 'tables' && (
              <div className="tab-pane tables-view">
                <div className="pane-header">
                  <h2>Database Description</h2>
                  <p>Detailed view of all tables, columns, constraints and types.</p>
                </div>
                <div className="tables-grid">
                  {schema && Object.keys(schema).map(tableName => (
                    <div key={tableName} className="desc-card">
                      <div className="desc-header">
                        <TerminalSquare size={18} color="var(--primary)" />
                        <span>{tableName}</span>
                      </div>
                      <div className="desc-table-wrap">
                        <table className="desc-table">
                          <thead>
                            <tr>
                              <th>Field</th>
                              <th>Type</th>
                              <th>Null</th>
                              <th>Key</th>
                            </tr>
                          </thead>
                          <tbody>
                            {schema[tableName].columns.map((col, idx) => (
                              <tr key={idx}>
                                <td className="field-name">{col.name}</td>
                                <td className="field-type">{col.type}</td>
                                <td>{col.nullable ? "YES" : "NO"}</td>
                                <td>
                                  {col.is_pk ? <span className="pk-badge"><Key size={12} /> PK</span> : ''}
                                  {schema[tableName].foreign_keys?.some(fk => fk.constrained_columns.includes(col.name)) ?
                                    <span className="fk-badge"><LinkIcon size={12} /> FK</span> : ''
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'relations' && (
              <div className="tab-pane relations-view">
                <div className="pane-header">
                  <h2>Entity-Relationship Diagram</h2>
                  <p>Visual map of foreign key referential relationships.</p>
                </div>
                <div className="canvas-wrapper" style={{ padding: 0 }}>
                  <SchemaDiagram schema={schema} />
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="tab-pane chat-view">
                <div className="chat-messages">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble ${msg.type}`}>
                      {msg.type === 'error' ? (
                        <div className="error-card">
                          <AlertCircle size={18} /> {msg.text}
                        </div>
                      ) : (
                        <>
                          <div className="msg-text">{msg.text}</div>
                          {msg.sql && (
                            <div className="sql-result">
                              <span className="sql-badge">Generated SQL</span>
                              <code>{msg.sql}</code>
                            </div>
                          )}

                          {msg.insights && msg.insights.length > 0 && (
                            <div style={{ background: 'rgba(46, 160, 67, 0.1)', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #2ea043', margin: '10px 0' }}>
                              <h4 style={{ margin: '0 0 10px 0', color: '#3fb950' }}>💡 Smart Insights</h4>
                              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {msg.insights.map((ins, i) => <li key={i} style={{ marginBottom: '5px' }}>{ins}</li>)}
                              </ul>
                            </div>
                          )}

                          {msg.anomalies && msg.anomalies.length > 0 && (
                            <div style={{ background: 'rgba(215, 58, 73, 0.1)', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #d73a49', margin: '10px 0' }}>
                              <h4 style={{ margin: '0 0 10px 0', color: '#f85149' }}>⚠️ Anomaly Detection</h4>
                              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {msg.anomalies.map((ano, i) => <li key={i} style={{ marginBottom: '5px' }}>{ano}</li>)}
                              </ul>
                            </div>
                          )}

                          {msg.charts && msg.charts.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                              {msg.charts.map((c, i) => <MultiChart key={i} chart={c} id={`chart-${idx}-${i}`} />)}
                            </div>
                          )}

                          {msg.results && msg.results.length > 0 && (
                            <div style={{ marginTop: '15px' }}>
                               <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <button onClick={() => exportToExcel(msg.results, 'omni_data')} style={{ background: '#333', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', padding: '5px 10px', display: 'flex', gap: '5px', alignItems: 'center' }}><FileSpreadsheet size={14} /> Excel</button>
                                <button onClick={() => exportToPDF(msg, idx)} style={{ background: '#333', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', padding: '5px 10px', display: 'flex', gap: '5px', alignItems: 'center' }}><FileText size={14} /> PDF</button>
                              </div>
                              <div className="table-responsive">
                                <table className="data-table">
                                  <thead>
                                    <tr>
                                      {Object.keys(msg.results[0]).map((k) => <th key={k}>{k}</th>)}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {msg.results.map((row, i) => (
                                      <tr key={i}>
                                        {Object.values(row).map((v, j) => <td key={j}>{String(v)}</td>)}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {msg.results && msg.results.length === 0 && (
                            <div className="empty-state">
                              Query executed successfully. 0 rows returned.
                            </div>
                          )}

                          {msg.follow_ups && msg.follow_ups.length > 0 && (
                            <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                              <h5 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Suggested Questions:</h5>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {msg.follow_ups.map((fq, i) => (
                                  <button key={i} onClick={() => { setChatInput(fq); }} style={{ background: 'var(--bg-color)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '15px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}>
                                    {fq}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {isQuerying && (
                    <div className="chat-bubble ai">
                      <span className="loading-dots">Agents are analyzing schema and generating SQL</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleQuerySubmit}>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask about your data... e.g. 'Show me all active users'"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={!isConnected || isQuerying}
                  />
                  <button
                    type="submit"
                    className="chat-submitBtn"
                    disabled={!isConnected || isQuerying || !chatInput.trim()}
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
