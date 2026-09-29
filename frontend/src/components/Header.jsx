import React from 'react';
import { Layers, ShieldCheck, Cpu, Info } from 'lucide-react';

export default function Header({ onOpenArchitecture }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.35)'
          }}>
            <Layers size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: 0
              }} className="gradient-text-primary">
                ShiftFlow
              </h1>
              <span className="badge badge-even" style={{ fontSize: '0.68rem', padding: '1px 7px' }}>
                v1.0
              </span>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}>
              엑셀 교대 일정 자동 치환 &amp; 무결성 검증
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenArchitecture}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <Info size={14} color="var(--accent-cyan)" />
            변환 룰 &amp; 엔진
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            color: '#34D399',
            fontWeight: 600
          }}>
            <ShieldCheck size={13} />
            <span>무결성 엔진 ON</span>
          </div>
        </div>
      </div>
    </header>
  );
}
