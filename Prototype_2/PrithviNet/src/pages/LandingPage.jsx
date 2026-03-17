import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, Droplets, Wind, Volume2, TreePine, Map, Factory, Network } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const roles = [
    {
      id: 'SUPER_ADMIN',
      title: 'Super Admin',
      description: 'System administration and overall governance',
      icon: <Shield className="h-6 w-6 text-emerald-500" />
    },
    {
      id: 'REGIONAL_OFFICER',
      title: 'Regional Officer',
      description: 'Regional monitoring and compliance management',
      icon: <Map className="h-6 w-6 text-emerald-500" />
    },
    {
      id: 'MONITORING_TEAM',
      title: 'Monitoring Team',
      description: 'Field data collection and equipment management',
      icon: <Activity className="h-6 w-6 text-emerald-500" />
    },
    {
      id: 'INDUSTRY_USER',
      title: 'Industry User',
      description: 'Submit compliance reports and monitor facility',
      icon: <Factory className="h-6 w-6 text-emerald-500" />
    }
  ];

  const handleRoleSelect = (roleId) => {
    // In a real app, you might pass the selected role as state to preset the login form
    navigate('/login', { state: { selectedRole: roleId } });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
            <Network size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>
            Prithvi<span style={{ color: '#10b981' }}>Net</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #1e293b', background: 'transparent', color: '#cbd5e1', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#334155'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = '#1e293b'; }}
          >
            Public Portal
          </button>
          <button 
            onClick={() => setShowRoleSelection(true)}
            style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
            onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ padding: '4rem 5%', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background glow effects */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: 'rgba(16, 185, 129, 0.15)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '999px', color: '#34d399', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
             GovTech Environmental Monitoring Platform
          </div>
          
          <h2 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Smart Environmental <br />
            <span style={{ color: '#10b981', WebkitTextFillColor: '#10b981' }}>Monitoring Dashboard</span>
          </h2>
          
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            A unified GovTech platform for real-time tracking of Air Quality, Water Pollution, and Noise levels across regional and industrial sectors. Ensuring compliance and citizen transparency.
          </p>

          {!showRoleSelection ? (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => navigate('/dashboard')}
                style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Users size={20} /> Enter Public Portal
              </button>
              <button 
                onClick={() => setShowRoleSelection(true)}
                style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '12px', border: '1px solid #334155', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(51, 65, 85, 0.8)'; e.currentTarget.style.borderColor = '#475569'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'; e.currentTarget.style.borderColor = '#334155'; }}
              >
                <Shield size={20} /> Auth Access
              </button>
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '800px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', color: '#e2e8f0' }}>Select Your Role to Continue</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', textAlign: 'left' }}>
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    style={{ 
                      padding: '1.5rem', 
                      borderRadius: '16px', 
                      background: 'rgba(30, 41, 59, 0.4)', 
                      border: '1px solid #334155', 
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                      e.currentTarget.style.borderColor = '#334155';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                      {role.icon}
                    </div>
                    <div>
                      <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>{role.title}</h4>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>{role.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setShowRoleSelection(false)}
                style={{ marginTop: '2rem', padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                ← Back to Home
              </button>
            </div>
          )}
        </div>

        {/* Environmental Statistics Preview */}
        {!showRoleSelection && (
          <div style={{ marginTop: '5rem', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '5rem auto 0 auto' }}>
            <StatCard icon={<Wind size={24} color="#38bdf8" />} title="Air Quality Nodes" value="2,543" trend="+12% active" color="rgba(56, 189, 248, 0.1)" borderColor="#0284c7" />
            <StatCard icon={<Droplets size={24} color="#60a5fa" />} title="Water Monitored" value="894 km" trend="Sustainable" color="rgba(96, 165, 250, 0.1)" borderColor="#2563eb" />
            <StatCard icon={<Volume2 size={24} color="#f43f5e" />} title="Noise Violations" value="128" trend="-5% this month" color="rgba(244, 63, 94, 0.1)" borderColor="#e11d48" />
            <StatCard icon={<TreePine size={24} color="#10b981" />} title="Protected Zones" value="45" trend="Fully compliant" color="rgba(16, 185, 129, 0.1)" borderColor="#059669" />
          </div>
        )}

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

function StatCard({ icon, title, value, trend, color, borderColor }) {
  return (
    <div style={{ 
      background: 'rgba(30, 41, 59, 0.5)', 
      backdropFilter: 'blur(10px)', 
      border: '1px solid #1e293b', 
      borderTop: `2px solid ${borderColor}`,
      borderRadius: '16px', 
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ background: color, padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem' }}>
        {icon}
      </div>
      <h4 style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white', margin: '0 0 0.5rem 0' }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 500 }}>{trend}</div>
    </div>
  );
}
