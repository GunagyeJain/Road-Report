import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import IssueReportForm from '../components/issue/IssueReportForm';

const ReportIssuePage: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Navigation Header */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link 
              to="/dashboard" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: '#6b7280',
                textDecoration: 'none',
                fontSize: '0.875rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            
            <div style={{ 
              width: '1px', 
              height: '20px', 
              background: '#e5e7eb' 
            }}></div>
            
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Report New Issue
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="btn"
                style={{ 
                  background: '#8b5cf6', 
                  color: 'white',
                  fontSize: '0.875rem',
                  padding: '0.5rem 1rem'
                }}
              >
                Admin View
              </Link>
            )}
            
            <Link 
              to="/dashboard" 
              className="btn btn-secondary"
              style={{ 
                fontSize: '0.875rem',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Home size={16} />
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '2rem auto', 
        padding: '0 1rem'
      }}>
        {/* Progress Indicator */}
        <div style={{ 
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              1
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                Report a Civic Issue
              </h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                Help improve your community by reporting problems that need attention
              </p>
            </div>
          </div>
          
          <div style={{ 
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.875rem',
            color: '#0369a1'
          }}>
            💡 <strong>Tip:</strong> Take a clear photo, enable location access, and provide detailed description for faster resolution.
          </div>
        </div>

        {/* Issue Report Form */}
        <IssueReportForm />
        
        {/* Bottom Navigation */}
        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <Link 
            to="/dashboard"
            style={{ 
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            ← Cancel and return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReportIssuePage;
