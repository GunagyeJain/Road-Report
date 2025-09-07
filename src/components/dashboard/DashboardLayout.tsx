import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, LogOut, Shield, Plus } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  isAdminView?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  isAdminView = false 
}) => {
  const { currentUser, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              background: isAdminView 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '8px',
              padding: '0.5rem'
            }}>
              {isAdminView ? <Shield size={24} color="white" /> : <User size={24} color="white" />}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                {title}
              </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                {subtitle}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {/* Toggle between user/admin view */}
            {isAdmin && (
              <>
                {isAdminView ? (
                  <Link to="/dashboard" className="btn" style={{ background: '#4facfe', color: 'white' }}>
                    <User size={20} />
                    My Issues
                  </Link>
                ) : (
                  <Link to="/admin" className="btn" style={{ background: '#8b5cf6', color: 'white' }}>
                    <Shield size={20} />
                    Admin View
                  </Link>
                )}
              </>
            )}
            
            <Link to="/report" className="btn btn-primary">
              <Plus size={20} />
              Report Issue
            </Link>
            
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 1rem' }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
