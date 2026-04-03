import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactFlow, { Background, Controls, MarkerType, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Send, AlertTriangle, CheckCircle2, Table as TableIcon, Share2, MessageSquare, Activity, TerminalSquare, AlertCircle, Key, Link as LinkIcon, Download, FileText, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import Tree from 'react-d3-tree';
import './App.css';

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
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <div style={{borderBottom: '1px solid var(--primary)', paddingBottom: '8px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Database size={14}/> {tableName}
              </div>
              {pks.length > 0 && <div style={{fontSize: '0.8rem', color: '#eab308', marginTop: '8px'}}>PK: {pks.join(', ')}</div>}
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

  const exportToCSV = (results, query) => {
    if (!results || results.length === 0) return;
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_${query.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (results, query) => {
    if (!results || results.length === 0) return;
    const doc = new jsPDF();
    doc.text(`Query: ${query}`, 14, 15);
    autoTable(doc, {
      head: [Object.keys(results[0])],
      body: results.map(row => Object.values(row)),
      startY: 20
    });
    doc.save(`export_${query.replace(/\s+/g, '_')}.pdf`);
  };

  const exportDashboard = async (elementId, query) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = data;
    link.download = `dashboard_${query.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const buildTreeData = (data, idCol, parentCol, labelCol) => {
    if (!data || data.length === 0) return { name: 'No Data' };
    const map = {};
    const roots = [];
    
    // First pass: create node objects
    data.forEach(item => {
      const id = item[idCol];
      map[id] = { 
        name: String(item[labelCol] || id || 'Unknown'), 
        attributes: { id: String(id) }, 
        children: [] 
      };
    });
    
    // Second pass: link parents to children
    data.forEach(item => {
      const id = item[idCol];
      const parentId = item[parentCol];
      if (parentId && map[parentId]) {
        map[parentId].children.push(map[id]);
      } else {
        roots.push(map[id]);
      }
    });
    
    return roots.length > 0 ? roots[0] : { name: 'Root' };
  };

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
          insights: response.data.insights || {},
          queryText: userMessage,
          text: 'Here is the result of your query:' 
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
          value={dbUrl}
          onChange={(e) => setDbUrl(e.target.value)}
          disabled={isConnected || isConnecting}
        />
        <button type="submit" className="btn" disabled={isConnecting || isConnected}>
          {isConnecting ? (
            <><Activity size={18} className="animate-spin" /> Connecting<span className="loading-dots"></span></>
          ) : isConnected ? (
            <><CheckCircle2 size={18} color="var(--success)"/> {dbType} Connected</>
          ) : (
            <><Database size={18} /> Connect DB</>
          )}
        </button>
      </form>

      {error && (
        <div className="error-card glass-panel" style={{marginBottom: "1rem"}}>
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
                        <TerminalSquare size={18} color="var(--primary)"/>
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
                                  {col.is_pk ? <span className="pk-badge"><Key size={12}/> PK</span> : ''}
                                  {schema[tableName].foreign_keys?.some(fk => fk.constrained_columns.includes(col.name)) ? 
                                    <span className="fk-badge"><LinkIcon size={12}/> FK</span> : ''
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
                          
                          {msg.results && msg.results.length > 0 && (
                            <div id={`dashboard-export-${idx}`} className="dashboard-container" style={{background: 'var(--bg-color)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '10px'}}>
                              <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
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

                              {msg.insights && msg.insights.insights && msg.insights.insights.length > 0 && (
                                <div className="smart-insights" style={{marginTop: '20px', padding: '15px', background: 'rgba(88, 166, 255, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--primary)'}}>
                                  <h4 style={{display:'flex', alignItems:'center', gap:'8px', marginBottom: '10px', color: 'var(--primary)'}}>
                                    <Activity size={18}/> Smart Summary & Anomalies
                                  </h4>
                                  <ul style={{paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)'}}>
                                    {msg.insights.insights.map((ins, i) => <li key={i} style={{marginBottom: '5px'}}>{ins}</li>)}
                                  </ul>
                                </div>
                              )}

                              {msg.insights && msg.insights.charts && msg.insights.charts.length > 0 && (
                                <div className="charts-grid" style={{
                                    display: 'grid', 
                                    gridTemplateColumns: msg.insights.charts.length > 1 ? '1fr 1fr' : '1fr', 
                                    gap: '20px', 
                                    marginTop: '20px'
                                }}>
                                  {msg.insights.charts.map((chart, cIdx) => (
                                    <div key={cIdx} className="chart-wrapper" style={{background: 'var(--bg-dark)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                                      <h5 style={{textAlign: 'center', marginBottom: '15px', color: 'var(--text-primary)'}}>{chart.title}</h5>
                                      <ResponsiveContainer width="100%" height={250}>
                                        {chart.type === 'line' ? (
                                          <LineChart data={msg.results}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis dataKey={chart.x_axis} stroke="#ccc"/>
                                            <YAxis stroke="#ccc"/>
                                            <RechartsTooltip contentStyle={{backgroundColor: '#222', borderColor: '#444'}}/>
                                            <Legend />
                                            <Line type="monotone" dataKey={chart.y_axis} stroke="#58a6ff" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}}/>
                                          </LineChart>
                                        ) : chart.type === 'tree' ? (
                                          <div style={{width: '100%', height: '100%', minHeight: '250px'}}>
                                             <Tree 
                                               data={buildTreeData(msg.results, chart.id_col, chart.parent_col, chart.label_col)} 
                                               orientation="vertical"
                                               pathFunc="step"
                                               translate={{x: 200, y: 30}}
                                               nodeSize={{x: 120, y: 60}}
                                               renderCustomNodeElement={({ nodeDatum }) => (
                                                 <g>
                                                   <rect width="100" height="40" x="-50" y="-20" fill="var(--bg-color)" stroke="var(--primary)" strokeWidth="1" rx="5"/>
                                                   <text fill="var(--text-primary)" strokeWidth="0" x="0" y="0" dominantBaseline="middle" textAnchor="middle" fontSize="12">
                                                     {nodeDatum.name.substring(0, 15)}
                                                   </text>
                                                 </g>
                                               )}
                                             />
                                           </div>
                                        ) : chart.type === 'pie' ? (
                                          <PieChart>
                                            <Pie data={msg.results} dataKey={chart.y_axis} nameKey={chart.x_axis} cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label>
                                              {msg.results.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={['#58a6ff', '#3fb950', '#d29922', '#f85149', '#8957e5', '#2fdaee'][index % 6]} />
                                              ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{backgroundColor: '#222', borderColor: '#444'}}/>
                                            <Legend />
                                          </PieChart>
                                        ) : (
                                          <BarChart data={msg.results}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis dataKey={chart.x_axis} stroke="#ccc"/>
                                            <YAxis stroke="#ccc"/>
                                            <RechartsTooltip contentStyle={{backgroundColor: '#222', borderColor: '#444'}}/>
                                            <Legend />
                                            <Bar dataKey={chart.y_axis} fill="#58a6ff" radius={[4, 4, 0, 0]} />
                                          </BarChart>
                                        )}
                                      </ResponsiveContainer>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {msg.results && msg.results.length > 0 && (
                            <div className="export-toolbar" style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                              <button className="btn outline" onClick={() => exportToCSV(msg.results, msg.queryText || 'query')} style={{padding: '6px 12px', fontSize: '13px'}}>
                                <FileText size={14}/> CSV
                              </button>
                              <button className="btn outline" onClick={() => exportToPDF(msg.results, msg.queryText || 'query')} style={{padding: '6px 12px', fontSize: '13px'}}>
                                <Download size={14}/> PDF
                              </button>
                              <button className="btn outline" onClick={() => exportDashboard(`dashboard-export-${idx}`, msg.queryText || 'query')} style={{padding: '6px 12px', fontSize: '13px'}}>
                                <BarChart2 size={14}/> Export Dashboard
                              </button>
                            </div>
                          )}

                          {msg.insights && msg.insights.follow_up_questions && msg.insights.follow_up_questions.length > 0 && (
                            <div className="follow-ups" style={{marginTop: '20px'}}>
                              <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px'}}>Suggested Follow-ups:</p>
                              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                {msg.insights.follow_up_questions.map((q, i) => (
                                  <button key={i} className="follow-up-btn" onClick={() => {
                                    setChatInput(q);
                                  }} style={{background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '20px', color: 'var(--accent)', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s'}}>
                                    💬 {q}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {msg.results && msg.results.length === 0 && (
                            <div className="empty-state">
                              Query executed successfully. 0 rows returned.
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
