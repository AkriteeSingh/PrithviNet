import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Download, Calendar, Filter, FileText, ChevronDown, X, Loader2 } from 'lucide-react';

const yearlyData = [
  { month: 'Jan', air: 65, water: 45, noise: 55 },
  { month: 'Feb', air: 59, water: 48, noise: 58 },
  { month: 'Mar', air: 80, water: 52, noise: 60 },
  { month: 'Apr', air: 81, water: 50, noise: 62 },
  { month: 'May', air: 56, water: 46, noise: 54 },
  { month: 'Jun', air: 55, water: 42, noise: 50 },
  { month: 'Jul', air: 40, water: 38, noise: 45 },
  { month: 'Aug', air: 60, water: 45, noise: 48 },
  { month: 'Sep', air: 75, water: 50, noise: 55 },
  { month: 'Oct', air: 85, water: 55, noise: 60 },
  { month: 'Nov', air: 90, water: 58, noise: 65 },
  { month: 'Dec', air: 75, water: 52, noise: 62 },
];

const violationData = [
  { name: 'North Region', violations: 124 },
  { name: 'South Region', violations: 86 },
  { name: 'East Region', violations: 156 },
  { name: 'West Region', violations: 94 },
  { name: 'Central Region', violations: 110 },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('monthly');
  const [region, setRegion] = useState('all');
  const [aiReport, setAiReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [cardReport, setCardReport] = useState(null);
  const [cardGenerating, setCardGenerating] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function generateAIReport() {
    setGenerating(true);
    try {
      const token = localStorage.getItem('prithvinet_token');
      const res = await fetch('http://localhost:3001/api/ai/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ days: reportType === 'monthly' ? 30 : 7 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiReport(data);
    } catch (err) {
      alert('Could not generate report. Make sure you are logged in and backend is running.');
    } finally {
      setGenerating(false);
    }
  }

  async function generateCardReport(cardTitle) {
    setCardGenerating(cardTitle);
    try {
      const token = localStorage.getItem('prithvinet_token');
      let days = reportType === 'monthly' ? 30 : 7;
      let cardReportType = 'consolidated';
      if (cardTitle === 'Violation & Alert Digest') {
        cardReportType = 'violations';
      } else if (cardTitle === 'AQI Trend Analysis') {
        cardReportType = 'trends';
        days = reportType === 'monthly' ? 30 : 365;
      }
      const res = await fetch('http://localhost:3001/api/ai/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ days, reportType: cardReportType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCardReport({ title: cardTitle, report: data.report });
      setSelectedReport(cardTitle);
    } catch (err) {
      alert('Could not generate report. Make sure you are logged in and backend is running.');
    } finally {
      setCardGenerating(null);
    }
  }

  function downloadCardReport() {
    if (!cardReport) return;
    const blob = new Blob([cardReport.report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prithvinet-${cardReport.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadReport() {
    if (!aiReport) return;
    const blob = new Blob([aiReport.report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prithvinet-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Reports & Analytics</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Generate and download comprehensive environmental compliance reports.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={generateAIReport}
            disabled={generating}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--primary-color)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
            <Download size={16} /> {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
      {aiReport && (
        <div style={{ background: 'var(--surface-color)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Environmental Monitoring Report</h3>
            <button onClick={downloadReport} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>
              <Download size={14} /> Download
            </button>
          </div>
          <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-muted)' }}
            dangerouslySetInnerHTML={{ __html: aiReport.report
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*\*/g, '')
              .replace(/^#{1,6} (.+)$/gm, '<h3 style="color:var(--text-primary);margin:24px 0 8px;font-size:1rem;font-weight:600;padding-bottom:6px;border-bottom:1px solid var(--border-color);">$1</h3>')
              .replace(/^---$/gm, '<hr style="border-color:var(--border-color);margin:16px 0"/>')
              .replace(/\n\n/g, '<br/><br/>')
              .replace(/^- (.+)$/gm, '<li style="margin:4px 0;list-style:disc;margin-left:20px">$1</li>')
            }}
          />
        </div>
      )}
      {/* Generation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <ReportGeneratorCard 
          icon={<FileText size={20} color="#3b82f6" />} 
          title="Consolidated Monthly Report" 
          description="Detailed summary of all environmental parameters across requested regions." 
          date="Generated: Today, 08:30 AM"
          accent="#3b82f6"
          onClick={() => generateCardReport('Consolidated Monthly Report')}
          loading={cardGenerating === 'Consolidated Monthly Report'}
        />
        <ReportGeneratorCard 
          icon={<FileText size={20} color="#ef4444" />} 
          title="Violation & Alert Digest" 
          description="Record of industries crossing prescribed limits and alerts triggered." 
          date="Generated: Yesterday, 18:00 PM"
          accent="#ef4444"
          onClick={() => generateCardReport('Violation & Alert Digest')}
          loading={cardGenerating === 'Violation & Alert Digest'}
        />
        <ReportGeneratorCard 
          icon={<FileText size={20} color="#10b981" />} 
          title="AQI Trend Analysis" 
          description="Historical data matching predicting models for the Air Quality Index." 
          date="Generated: Oct 1, 2026"
          accent="#10b981"
          onClick={() => generateCardReport('AQI Trend Analysis')}
          loading={cardGenerating === 'AQI Trend Analysis'}
        />
      </div>

      {/* Report Viewer Modal */}
      {selectedReport && cardReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setSelectedReport(null)}>
          <div style={{ background: 'var(--surface-color, #1e293b)', border: '1px solid var(--border-color, #334155)', borderRadius: '16px', padding: '32px', maxWidth: '800px', width: '100%', maxHeight: '80vh', overflow: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary, #e2e8f0)', fontSize: '1.3rem' }}>{cardReport.title}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={downloadCardReport} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Download size={14} /> Download
                </button>
                <button onClick={() => setSelectedReport(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'transparent', border: '1px solid var(--border-color, #334155)', borderRadius: '8px', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-muted, #94a3b8)' }}
              dangerouslySetInnerHTML={{ __html: cardReport.report
                .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary, #e2e8f0)">$1</strong>')
                .replace(/\*\*/g, '')
                .replace(/^#{1,6} (.+)$/gm, '<h3 style="color:var(--text-primary, #e2e8f0);margin:24px 0 8px;font-size:1rem;font-weight:600;padding-bottom:6px;border-bottom:1px solid var(--border-color, #334155);">$1</h3>')
                .replace(/^---$/gm, '<hr style="border-color:var(--border-color, #334155);margin:16px 0"/>')
                .replace(/\n\n/g, '<br/><br/>')
                .replace(/^- (.+)$/gm, '<li style="margin:4px 0;list-style:disc;margin-left:20px">$1</li>')
              }}
            />
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Main Trend Line Chart */}
        <div style={{ background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Annual Pollution Trends</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '4px' }}>Avg AQI: {(yearlyData.reduce((s, d) => s + d.air, 0) / yearlyData.length).toFixed(0)}</span>
              <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '4px' }}>Avg Noise: {(yearlyData.reduce((s, d) => s + d.noise, 0) / yearlyData.length).toFixed(0)} dB</span>
              <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', borderRadius: '4px' }}>Avg WQI: {(yearlyData.reduce((s, d) => s + d.water, 0) / yearlyData.length).toFixed(0)}</span>
            </div>
          </div>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNoise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="air" name="Air Quality (AQI - µg/m³)" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorAir)" />
                <Area type="monotone" dataKey="water" name="Water Quality (pH)" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorWater)" />
                <Area type="monotone" dataKey="noise" name="Noise Level (dB)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorNoise)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violations Bar Chart */}
        <div style={{ background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Total Violations by Region</h3>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="violations" name="Total Violations" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

function ReportGeneratorCard({ icon, title, description, date, accent, onClick, loading }) {
  return (
    <div 
      onClick={!loading ? onClick : undefined}
      style={{ 
        background: 'rgba(30, 41, 59, 0.4)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '12px', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(${hexToRgb(accent)}, 0.15)`; } }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', background: `rgba(${hexToRgb(accent)}, 0.1)`, borderRadius: '8px' }}>
          {loading ? <Loader2 size={20} color={accent} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
        </div>
        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>{title}</h4>
      </div>
      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</p>
      <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{date}</span>
        <span style={{ color: accent, fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {loading ? 'Generating...' : 'Click to view'} <FileText size={14} />
        </span>
      </div>
    </div>
  );
}

// Helper to pass simple rgb transparency from hex
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129';
}
