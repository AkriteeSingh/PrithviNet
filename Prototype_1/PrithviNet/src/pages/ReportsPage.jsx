import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Download, Calendar, Filter, FileText, ChevronDown } from 'lucide-react';

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

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Reports & Analytics</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Generate and download comprehensive environmental compliance reports.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <Calendar size={16} /> 
            {reportType === 'monthly' ? 'Monthly Report' : 'Yearly Report'}
            <ChevronDown size={14} />
          </button>
          
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--primary-color)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Generation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <ReportGeneratorCard 
          icon={<FileText size={20} color="#3b82f6" />} 
          title="Consolidated Monthly Report" 
          description="Detailed summary of all environmental parameters across requested regions." 
          date="Generated: Today, 08:30 AM"
          accent="#3b82f6"
        />
        <ReportGeneratorCard 
          icon={<FileText size={20} color="#ef4444" />} 
          title="Violation & Alert Digest" 
          description="Record of industries crossing prescribed limits and alerts triggered." 
          date="Generated: Yesterday, 18:00 PM"
          accent="#ef4444"
        />
        <ReportGeneratorCard 
          icon={<FileText size={20} color="#10b981" />} 
          title="AQI Trend Analysis" 
          description="Historical data matching predicting models for the Air Quality Index." 
          date="Generated: Oct 1, 2026"
          accent="#10b981"
        />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Main Trend Line Chart */}
        <div style={{ background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Annual Pollution Trends</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary-color)', borderRadius: '4px' }}>Avg AQI: 68</span>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="air" name="Air Quality (AQI)" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorAir)" />
                <Area type="monotone" dataKey="water" name="Water Quality Index" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorWater)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violations Bar Chart */}
        <div style={{ background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Violations by Region</h3>
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

function ReportGeneratorCard({ icon, title, description, date, accent }) {
  return (
    <div style={{ 
      background: 'rgba(30, 41, 59, 0.4)', 
      border: '1px solid var(--border-color)', 
      borderRadius: '12px', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', background: `rgba(${hexToRgb(accent)}, 0.1)`, borderRadius: '8px' }}>
          {icon}
        </div>
        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>{title}</h4>
      </div>
      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</p>
      <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{date}</span>
        <button style={{ background: 'transparent', border: 'none', color: accent, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Download <Download size={14} />
        </button>
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
