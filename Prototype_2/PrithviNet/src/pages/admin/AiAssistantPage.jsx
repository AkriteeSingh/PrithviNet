import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Activity, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function AiAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Hello! I am the PrithviNet Environmental AI Assistant. I can help you analyze pollution trends, predict future outcomes, or review compliance data. How can I assist you today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking and response
    try {
      const token = localStorage.getItem('prithvinet_token');
      const res = await fetch('http://localhost:3001/api/ai/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: userMessage.text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, type: 'ai', text: data.answer }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, type: 'ai', text: 'Sorry, I could not connect to the AI engine. Make sure Ollama is running.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page-container" style={{ padding: '0', height: 'calc(100vh - 40px)', display: 'flex' }}>

      {/* Sidebar Suggestions */}
      <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', background: 'var(--surface-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={24} color="#10b981" />
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>Prithvi AI</h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>GovTech Compliance & Prediction Assistant</p>
        </div>

        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '16px' }}>Suggested Queries</h3>

          <SuggestionButton
            icon={<Activity size={16} />}
            text="If an industry reduces emissions by 30%, how will regional pollution change?"
            onClick={() => setInput("If an industry reduces emissions by 30%, how will regional pollution change?")}
          />
          <SuggestionButton
            icon={<AlertCircle size={16} />}
            text="Show me the industries with the most violations this quarter."
            onClick={() => setInput("Show me the industries with the most violations this quarter.")}
          />
          <SuggestionButton
            icon={<FileText size={16} />}
            text="Generate a quick summary of water quality in the South Region."
            onClick={() => setInput("Generate a quick summary of water quality in the South Region.")}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', position: 'relative' }}>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 10%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: '16px', flexDirection: msg.type === 'user' ? 'row-reverse' : 'row' }}>

              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: msg.type === 'user' ? 'var(--primary-color)' : 'rgba(16, 185, 129, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: msg.type === 'user' ? 'white' : '#10b981'
              }}>
                {msg.type === 'user' ? <User size={18} /> : <Bot size={20} />}
              </div>

              <div style={{
                maxWidth: '80%',
                background: msg.type === 'user' ? 'var(--primary-color)' : 'var(--surface-color)',
                color: msg.type === 'user' ? 'white' : 'var(--text-primary)',
                padding: '16px',
                borderRadius: '16px',
                borderTopRightRadius: msg.type === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.type === 'ai' ? '4px' : '16px',
                boxShadow: msg.type === 'user' ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                border: msg.type === 'ai' ? '1px solid var(--border-color)' : 'none'
              }}>
                {msg.type === 'user' ? (
                  <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                ) : (
                  <div className="markdown-content" style={{ margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}

                {/* AI Insights Rendering */}
                {msg.insights && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: msg.type === 'user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border-color)' }}>
                    {msg.insights.type === 'prediction' && (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {msg.insights.data.map((item, idx) => (
                          <div key={idx} style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '8px', minWidth: '120px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.insights.type === 'summary' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {msg.insights.data.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-color)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.label}</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: item.alert ? '#ef4444' : 'var(--text-primary)' }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Bot size={20} />
              </div>
              <div style={{ padding: '16px', background: 'var(--surface-color)', borderRadius: '16px', borderTopLeftRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <div className="typing-dot"></div>
                <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '24px 10%', background: 'var(--surface-color)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Prithvi AI about compliance limits, predictions, or reports..."
              style={{
                width: '100%',
                padding: '16px 60px 16px 20px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                resize: 'none',
                minHeight: '24px',
                maxHeight: '120px',
                fontFamily: 'inherit'
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                position: 'absolute',
                right: '12px',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: input.trim() ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                color: input.trim() ? 'white' : '#64748b',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              <Send size={18} style={{ marginLeft: '2px', marginTop: '2px' }} />
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: '#64748b' }}>
            PrithviAI can make mistakes. Always verify predictive models with official regional guidelines.
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .typing-dot {
          width: 6px; height: 6px; background: #64748b; border-radius: 50%;
          animation: typingPulse 1.4s infinite ease-in-out both;
        }
        @keyframes typingPulse { 0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        
        /* Markdown Styles */
        .markdown-content p { margin-top: 0; margin-bottom: 8px; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content ul, .markdown-content ol { margin-top: 0; margin-bottom: 8px; padding-left: 20px; }
        .markdown-content li { margin-bottom: 4px; }
        .markdown-content strong { font-weight: 600; color: var(--text-primary); }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { margin-top: 12px; margin-bottom: 8px; font-weight: 600; color: var(--text-primary); }
        .markdown-content code { background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        [data-theme='dark'] .markdown-content code { background: rgba(255,255,255,0.1); }

      `}} />
    </div>
  );
}

function SuggestionButton({ icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '12px', marginBottom: '8px', borderRadius: '8px',
        background: 'var(--bg-color)', border: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
        cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-primary)'
      }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      <div style={{ color: 'var(--primary-color)' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: '0.8rem', lineHeight: 1.4 }}>{text}</div>
      <ChevronRight size={14} color="#64748b" />
    </button>
  );
}
