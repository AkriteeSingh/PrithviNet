// src/pages/AIReport.jsx
// Feature 1: Summary Report Generator

import { useState } from 'react'
import { FileText, Download, Loader, AlertCircle, BarChart2, Droplets, Volume2 } from 'lucide-react'

const API = 'http://localhost:3001'

function getToken() {
  return localStorage.getItem('prithvinet_token')
}

export default function AIReport() {
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)

  async function generateReport() {
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const res = await fetch(`${API}/api/ai/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ days })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate report')
      setReport(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function downloadReport() {
    if (!report) return
    const content = `PRITHVINET ENVIRONMENTAL MONITORING REPORT
Generated: ${new Date(report.generatedAt).toLocaleString()}
Period: Last ${report.periodDays} days

${report.report}

---
STATISTICS SUMMARY

AIR QUALITY:
${report.stats.airStats ? `
  Readings: ${report.stats.airStats.count}
  Average AQI: ${report.stats.airStats.avgAQI}
  Maximum AQI: ${report.stats.airStats.maxAQI}
  Average PM2.5: ${report.stats.airStats.avgPM25} µg/m³
  Violations: ${report.stats.airStats.violations}
` : '  No data available'}

WATER QUALITY:
${report.stats.waterStats ? `
  Readings: ${report.stats.waterStats.count}
  Average pH: ${report.stats.waterStats.avgPH}
  Average TDS: ${report.stats.waterStats.avgTDS} mg/L
  pH Violations: ${report.stats.waterStats.violations}
` : '  No data available'}

NOISE POLLUTION:
${report.stats.noiseStats ? `
  Readings: ${report.stats.noiseStats.count}
  Average Laeq: ${report.stats.noiseStats.avgLaeq} dB(A)
  Maximum Laeq: ${report.stats.noiseStats.maxLaeq} dB(A)
  Violations: ${report.stats.noiseStats.violations}
` : '  No data available'}

ALERTS:
  Critical: ${report.alerts.critical}
  Warning: ${report.alerts.warning}
  Total: ${report.alerts.total}
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prithvinet-report-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(16,185,129,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={20} color="#10b981" />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: 'var(--text-primary, #e2e8f0)' }}>
            AI Summary Report
          </h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary, #94a3b8)', fontSize: '14px' }}>
          Generate an AI-powered environmental monitoring report from your pollution data
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px', padding: '20px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '6px' }}>
            Report Period
          </label>
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '8px 14px', color: 'var(--text-primary, #e2e8f0)',
              fontSize: '14px', cursor: 'pointer', outline: 'none'
            }}
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          style={{
            marginTop: '20px',
            background: loading ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none', borderRadius: '10px', padding: '10px 24px',
            color: '#fff', fontSize: '14px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><FileText size={16} /> Generate Report</>}
        </button>

        {report && (
          <button
            onClick={downloadReport}
            style={{
              marginTop: '20px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px', padding: '10px 20px',
              color: 'var(--text-primary, #e2e8f0)', fontSize: '14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Download size={16} /> Download
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px', padding: '16px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171'
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '14px' }}>{error}. Make sure Ollama is running: <code>ollama serve</code></span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{
          background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '14px', padding: '40px', textAlign: 'center'
        }}>
          <Loader size={32} color="#10b981" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ color: '#10b981', fontSize: '15px', margin: 0 }}>AI is analyzing pollution data...</p>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '13px', marginTop: '6px' }}>This may take 20–40 seconds</p>
        </div>
      )}

      {/* Stats Cards */}
      {report && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {/* Air Stats */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <BarChart2 size={16} color="#10b981" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>Air Quality</span>
              </div>
              {report.stats.airStats ? (
                <>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary, #e2e8f0)' }}>{report.stats.airStats.avgAQI}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>Avg AQI · {report.stats.airStats.violations} violations</div>
                </>
              ) : <div style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>No data</div>}
            </div>

            {/* Water Stats */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Droplets size={16} color="#3b82f6" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>Water Quality</span>
              </div>
              {report.stats.waterStats ? (
                <>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary, #e2e8f0)' }}>{report.stats.waterStats.avgPH}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>Avg pH · {report.stats.waterStats.violations} violations</div>
                </>
              ) : <div style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>No data</div>}
            </div>

            {/* Noise Stats */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Volume2 size={16} color="#f59e0b" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#f59e0b' }}>Noise Level</span>
              </div>
              {report.stats.noiseStats ? (
                <>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary, #e2e8f0)' }}>{report.stats.noiseStats.avgLaeq}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>Avg dB(A) · {report.stats.noiseStats.violations} violations</div>
                </>
              ) : <div style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>No data</div>}
            </div>
          </div>

          {/* Report Text */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '14px', padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary, #e2e8f0)' }}>
                Generated Report
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                {new Date(report.generatedAt).toLocaleString()}
              </span>
            </div>
            <div style={{
              fontSize: '14px', lineHeight: '1.8',
              color: 'var(--text-secondary, #cbd5e1)',
              whiteSpace: 'pre-wrap'
            }}>
              {report.report}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}