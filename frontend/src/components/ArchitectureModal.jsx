import React from 'react';
import { X, Layers, Cpu, ShieldCheck, CheckCircle2, FileSpreadsheet, ArrowDown } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel animate-slide-down" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0F172A',
        border: '1px solid var(--border-glow)',
        padding: '28px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Layers size={22} color="var(--accent-primary-light)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
            ShiftFlow 파이프라인 아키텍처 &amp; 변환 룰
          </h2>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          수작업 일정표 작성 시 발생하는 날짜 오기입과 서식 깨짐을 방지하기 위해 5단계 파이프라인과 3중 무결성 검증을 거칩니다.
        </p>

        {/* 5-Step Pipeline Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 800,
              flexShrink: 0
            }}>1</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF' }}>파일명 파싱 및 짝/홀 식별</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                업로드된 파일명에서 '짝수', '홀수' 키워드를 감지하여 스케쥴의 속성을 판별합니다.
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 800,
              flexShrink: 0
            }}>2</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF' }}>주차 룰 엔진 (일~토 기준 격주 순환)</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                연초(1월 1일) 주차를 1주차(짝수주)로 시작하여 [짝수주 → 홀수주] 순서로 엄격히 교대 계산합니다.
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 800,
              flexShrink: 0
            }}>3</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF' }}>openpyxl 스타일 보존 날짜 치환</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                '업무일' 컬럼만 탐색하여 동일 요일의 대상 날짜로 1:1 치환하며, 셀 서식/폰트/배경색/빈 셀을 완벽 보존합니다.
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--accent-emerald)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 800,
              flexShrink: 0
            }}>4</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF' }}>pandas 3중 무결성 검증 엔진</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                1) Shape(행/열) 일치, 2) '업무일' 제외 모든 컬럼 <code>equals()</code> 불변성 검증, 3) 대상 날짜 및 요일 유효성 검증.
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--accent-cyan)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 800,
              flexShrink: 0
            }}>5</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF' }}>즉시 다운로드 스트림 응답</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <code>사용자요청월_짝수스케쥴.xlsx</code> 및 ZIP 파일 스트림으로 원본 서식을 담아 배포합니다.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-primary"
          style={{ width: '100%', padding: '12px' }}
        >
          확인 및 닫기
        </button>
      </div>
    </div>
  );
}
