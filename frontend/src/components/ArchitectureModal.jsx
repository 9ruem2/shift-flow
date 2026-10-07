import React from 'react';
import { X, Layers, Cpu, ShieldCheck, CheckCircle2, FileSpreadsheet, ArrowDown, UserCheck, Calendar } from 'lucide-react';

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
        maxWidth: '740px',
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

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
          수작업 일정표 작성 시 발생하는 날짜 오기입, 기사 배정 실수 및 서식 깨짐을 방지하기 위해 <b>5단계 파이프라인</b>과 <b>4대 정밀 무결성 검증 엔진</b>을 거칩니다.
        </p>

        {/* 5-Step Pipeline Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {/* Step 1 */}
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
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF' }}>
                파일명 파싱 및 짝/홀 템플릿 자동 식별
              </h4>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                업로드된 파일명에서 '짝수', '홀수' 키워드를 감지(macOS 한글 자모 분리 완벽 대응)하여 짝/홀수 템플릿으로 슬롯에 자동 매핑합니다.
              </p>
            </div>
          </div>

          {/* Step 2 */}
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
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF' }}>
                연초 기준 격주 순환 주차 룰 엔진 (일요일 ~ 토요일)
              </h4>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                모든 주차는 일요일 시작 ~ 토요일 종료 기준이며, 연도 시작(1월 1일) 주차를 1주차(짝수주)로 시작하여 <code>[짝수주 → 홀수주]</code> 순서로 엄격히 교대 계산합니다.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
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
              background: 'linear-gradient(135deg, #6366F1, #A855F7)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 800,
              flexShrink: 0
            }}>3</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>업무일 우선 치환 + [옵션] 용차 기사(이름/ID) 치환 엔진</span>
              </h4>
              <div style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <p style={{ margin: '0 0 3px 0' }}>
                  • <b>1단계(업무일 우선 치환):</b> '업무일' 컬럼을 탐색하여 동일 요일의 대상 날짜로 1:1 치환합니다.
                </p>
                <p style={{ margin: '0 0 3px 0' }}>
                  • <b>2단계(용차 기사 &amp; ID 치환):</b> 변경된 새 업무일 기준 기존 기사명을 찾아 용차 기사명 및 정적 마스터(<code>contract_drivers.json</code>)의 고유 ID로 치환합니다.
                </p>
                <p style={{ margin: 0, color: 'var(--accent-emerald)' }}>
                  ✓ 셀 폰트, 배경색, 테두리, 수식, 행 높이, 열 너비, 빈 셀 서식 100% 보존
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
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
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF' }}>
                pandas 기반 4대 정밀 무결성 검증 엔진
              </h4>
              <div style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <p style={{ margin: '0 0 2px 0' }}>
                  1) <b>규격 일치 (Shape):</b> 원본과 변환 파일 간 행/열 크기 100% 일치
                </p>
                <p style={{ margin: '0 0 2px 0' }}>
                  2) <b>데이터 불변성 (Invariance):</b> 업무일 및 지정된 용차 치환(이름/ID) 외 모든 셀 100% 원본 불변
                </p>
                <p style={{ margin: '0 0 2px 0' }}>
                  3) <b>날짜 적합성 (Date Validity):</b> 대상 주차 유효 범위 및 동일 요일 배치 검증
                </p>
                <p style={{ margin: 0 }}>
                  4) <b>용차 치환 적합성 (Substitution Validity):</b> 지정 행의 기사명 및 ID 마스터 일치 검증
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
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
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF' }}>
                주차별 엑셀 파일 및 일괄 ZIP 배포
              </h4>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <code>{'{월}'}월_{'{짝수/홀수}'}_{'{연간주차}'}주차.xlsx</code> 형식으로 개별 다운로드 및 무결성 검증 리포트 텍스트가 포함된 일괄 ZIP 압축 다운로드를 제공합니다.
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

