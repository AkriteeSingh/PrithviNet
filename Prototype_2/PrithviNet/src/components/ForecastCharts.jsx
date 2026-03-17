import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

const API = 'http://localhost:3001';

const PARAM_CONFIG = {
  air: {
    label: 'AQI (Air)',
    dataKey: 'predicted',
    color: '#10b981',
    safeLimit: 100,
    unit: 'AQI',
    locationEndpoint: 'AIR'
  },
  water: {
    label: 'pH (Water)',
    dataKey: 'predicted',
    color: '#3b82f6',
    safeLimit: 8.5,
    unit: 'pH',
    locationEndpoint: 'WATER'
  },
  noise: {
    label: 'dB(A) (Noise)',
    dataKey: 'predicted',
    color: '#ef4444',
    safeLimit: 75,
    unit: 'dB(A)',
    locationEndpoint: 'NOISE'
  }
};

const ForecastCharts = () => {
  const [activeParam, setActiveParam] = useState('air');
  const [forecastData, setForecastData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch monitoring locations for dropdown
  useEffect(() => {
    async function fetchLocations() {
      try {
        const token = localStorage.getItem('prithvinet_token');
        const res = await fetch(
          `${API}/api/monitoring-locations?type=${PARAM_CONFIG[activeParam].locationEndpoint}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          const locs = Array.isArray(data) ? data : (data.locations || []);
          setLocations(locs);
          if (locs.length > 0) {
            setSelectedLocation(locs[0].id);
          } else {
            setSelectedLocation('demo');
          }
        } else {
          setSelectedLocation('demo');
        }
      } catch {
        setSelectedLocation('demo');
      }
    }
    fetchLocations();
  }, [activeParam]);

  // Fetch forecast when location or param changes
  useEffect(() => {
    if (!selectedLocation) return;
    fetchForecast();
  }, [selectedLocation, activeParam]);

  async function fetchForecast() {
    setLoading(true);
    setError(null);
    try {
      const locationId = selectedLocation === 'demo' ? 'demo-location' : selectedLocation;
      const res = await fetch(
        `${API}/api/ai/forecast/${activeParam}/${locationId}?days=14`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      // Format forecast data for chart — show every 4 hours
      const chartData = data.forecast
        .filter((_, i) => i % 4 === 0)
        .map(f => ({
          time: new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(f.timestamp).toLocaleDateString([], { weekday: 'short' }),
          predicted: f.predicted,
          uncertaintyMin: f.min,
          uncertaintyMax: f.max,
          hour: f.hour
        }));

      setForecastData(chartData);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const config = PARAM_CONFIG[activeParam];

  const TrendIcon = summary?.trend === 'increasing'
    ? TrendingUp
    : summary?.trend === 'decreasing'
    ? TrendingDown
    : Minus;

  const trendColor = summary?.trend === 'increasing'
    ? '#ef4444'
    : summary?.trend === 'decreasing'
    ? '#10b981'
    : '#f59e0b';

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--accent-secondary)" />
            AI Predictive Forecasting (72h)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Powered by trend analysis & surrogate models
          </p>
        </div>

        {/* Tab switcher */}
        <div className="glass-panel" style={{ padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)' }}>
          {Object.entries(PARAM_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveParam(key)}
              style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                color: activeParam === key ? 'white' : 'var(--text-secondary)',
                background: activeParam === key ? cfg.color : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s'
              }}>
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location selector + summary stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {locations.length > 0 && (
          <select
            value={selectedLocation || ''}
            onChange={e => setSelectedLocation(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '6px 12px', color: 'var(--text-primary)',
              fontSize: '0.8rem', cursor: 'pointer', outline: 'none'
            }}
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        )}

        {summary && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem' }}>
              <TrendIcon size={14} color={trendColor} />
              <span style={{ color: trendColor, fontWeight: 600, textTransform: 'capitalize' }}>{summary.trend}</span>
            </div>
            <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Current: <strong style={{ color: 'var(--text-primary)' }}>{summary.currentValue} {config.unit}</strong>
            </div>
            {summary.exceedanceHours > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', fontSize: '0.8rem', color: '#f87171' }}>
                <AlertTriangle size={14} />
                Exceeds limit for {summary.exceedanceHours}h
              </div>
            )}
          </>
        )}
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: '250px', position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', zIndex: 10 }}>
            <span style={{ color: config.color, fontSize: '0.9rem' }}>Loading forecast...</span>
          </div>
        )}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#f87171', fontSize: '0.85rem' }}>Could not load forecast data</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUncertainty" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(255,255,255,0.1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="rgba(255,255,255,0.1)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
            />
            <Tooltip content={<CustomTooltip unit={config.unit} color={config.color} />} />

            {/* Safe limit line */}
            <ReferenceLine
              y={config.safeLimit}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              opacity={0.5}
              label={{ position: 'insideTopLeft', value: 'Safe Limit', fill: '#f59e0b', fontSize: 10 }}
            />

            {/* Uncertainty band */}
            <Area type="monotone" dataKey="uncertaintyMax" stroke="none" fill="url(#colorUncertainty)" />
            <Area type="monotone" dataKey="uncertaintyMin" stroke="none" fill="#060913" />

            {/* Main forecast line */}
            <Area
              type="monotone"
              dataKey="predicted"
              stroke={config.color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorForecast)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '2px', background: config.color }}></div> Point Forecast
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}></div> 95% Confidence Interval
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '2px', background: '#f59e0b', borderTop: '1px dashed #f59e0b' }}></div> Safe Limit
        </span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, unit, color }) => {
  if (active && payload && payload.length) {
    const predicted = payload.find(p => p.dataKey === 'predicted')?.value;
    const min = payload.find(p => p.dataKey === 'uncertaintyMin')?.value;
    const max = payload.find(p => p.dataKey === 'uncertaintyMax')?.value;
    const day = payload[0]?.payload?.date;

    return (
      <div className="glass-panel" style={{ padding: '12px', background: 'rgba(10,15,25,0.9)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{day}, {label}</p>
        <p style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600, color: color || '#10b981' }}>
          Forecast: {predicted} {unit}
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Range: {min} – {max}
        </p>
      </div>
    );
  }
  return null;
};

export default ForecastCharts;