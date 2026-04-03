import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactFlow, { Background, Controls, MarkerType, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Send, AlertTriangle, CheckCircle2, Table as TableIcon, Share2, MessageSquare, Activity, TerminalSquare, AlertCircle, Key, Link as LinkIcon } from 'lucide-react';
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
