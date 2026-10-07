import React, { useState, useEffect } from 'react';
import { UserCheck, ChevronDown, ChevronUp, Plus, Trash2, ShieldAlert, Sparkles, UserX, Calendar } from 'lucide-react';

const FALLBACK_DRIVERS = [
  { name: '이미복', id: 'wlfjddp1' },
  { name: '윤주영', id: 'rose2411' },
  { name: '지요셉', id: 'j001919' },
  { name: '최수빈', id: 'tomorrow1004' },
  { name: '배정한', id: 'bjh7823' },
  { name: '오지훈', id: 'daegook' },
  { name: '강민규', id: 'mindalgod' },
  { name: '권광훈', id: 'wlfjddp' }
];

export default function DriverSubstitutionPanel({
  calendarWeeks,
  substitutions,
  setSubstitutions
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [drivers, setDrivers] = useState(FALLBACK_DRIVERS);

  // 용차 기사 마스터 데이터 API 로드 (실패 시 FALLBACK_DRIVERS 사용)
  useEffect(() => {
    async function fetchDrivers() {
      try {
        const res = await fetch('/api/v1/schedule/drivers');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDrivers(data);
          }
        }
      } catch (err) {
        console.warn('Using fallback contract drivers list');
      }
    }
    fetchDrivers();
  }, []);

  // 현재 선택된 월에 포함된 모든 날짜 목록 (YYYY-MM-DD) 추출
  const availableDates = React.useMemo(() => {
    const dateSet = new Set();
    calendarWeeks.forEach(w => {
      if (w.days && Array.isArray(w.days)) {
        w.days.forEach(d => dateSet.add(d));
      }
    });
    return Array.from(dateSet).sort();
  }, [calendarWeeks]);

  const handleAddRow = () => {
    const defaultDate = availableDates.length > 0 ? availableDates[0] : '';
    const defaultDriver = drivers.length > 0 ? drivers[0] : { name: '', id: '' };
    
    setSubstitutions(prev => [
      ...prev,
      {
        key: Date.now() + Math.random(),
        targetDate: defaultDate,
        originalDriverName: '',
        newDriverName: defaultDriver.name,
        newDriverId: defaultDriver.id
      }
    ]);
    if (!isOpen) setIsOpen(true);
  };

  const handleRemoveRow = (key) => {
    setSubstitutions(prev => prev.filter(item => item.key !== key));
  };

  const handleUpdateRow = (key, field, value) => {
    setSubstitutions(prev => prev.map(item => {
      if (item.key !== key) return item;

      if (field === 'newDriverName') {
        const matched = drivers.find(d => d.name === value);
        return {
          ...item,
          newDriverName: value,
          newDriverId: matched ? matched.id : ''
        };
      }

      return {
        ...item,
        [field]: value
      };
    }));
  };

  const activeCount = substitutions.filter(s => s.targetDate && s.originalDriverName.trim() && s.newDriverName).length;

  return (
    <div className="glass-panel" style={{
      marginBottom: '20px',
      overflow: 'hidden',
      border: activeCount > 0 ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-subtle)',
      transition: 'all 0.2s ease'
    }}>
      {/* Header (Accordion Toggle Button) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          background: isOpen ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
          borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--odd-color)'
          }}>
            <UserCheck size={18} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                [옵션] 용차 기사 교체 설정
              </span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-muted)',
                fontWeight: 600
              }}>
                선택 사항
              </span>

              {activeCount > 0 && (
                <span className="badge badge-odd" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  {activeCount}건 설정됨
                </span>
              )}
            </div>
            <p style={{
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              margin: '2px 0 0 0'
            }}>
              업무일 변경 후 특정 날짜의 기사를 용차 기사(이름 및 사번 ID)로 자동 치환합니다.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
            {isOpen ? '접기' : '펼쳐서 설정하기'}
          </span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div style={{ padding: '18px 20px', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={14} color="#C084FC" />
              <span>
                업무일이 먼저 새 연월 일정으로 변경된 후, 아래 조건에 일치하는 행의 기사명과 ID가 치환됩니다.
              </span>
            </div>

            <button
              onClick={handleAddRow}
              type="button"
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                borderColor: 'var(--odd-color)',
                color: '#E9D5FF'
              }}
            >
              <Plus size={14} />
              <span>교체 항목 추가</span>
            </button>
          </div>

          {substitutions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.01)'
            }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                현재 설정된 용차 기사 교체 항목이 없습니다. (필요 시 상단의 <b>'+ 교체 항목 추가'</b> 버튼 클릭)
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {substitutions.map((sub, idx) => (
                <div
                  key={sub.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(140px, 1.2fr) minmax(130px, 1fr) minmax(180px, 1.3fr) 40px',
                    gap: '10px',
                    alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px'
                  }}
                >
                  {/* 1. 업무일 선택 */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                      fontWeight: 600
                    }}>
                      ① 대상 업무일 (치환 후 날짜)
                    </label>
                    <div style={{ position: 'relative' }}>
                      {availableDates.length > 0 ? (
                        <select
                          value={sub.targetDate}
                          onChange={(e) => handleUpdateRow(sub.key, 'targetDate', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            background: 'rgba(30, 41, 59, 0.8)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#FFFFFF',
                            fontSize: '0.82rem',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {availableDates.map(d => (
                            <option key={d} value={d} style={{ background: '#0F172A', color: '#FFF' }}>
                              {d}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="date"
                          value={sub.targetDate}
                          onChange={(e) => handleUpdateRow(sub.key, 'targetDate', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            background: 'rgba(30, 41, 59, 0.8)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#FFFFFF',
                            fontSize: '0.82rem'
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* 2. 기존 기사 이름 */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                      fontWeight: 600
                    }}>
                      ② 기존 기사 이름
                    </label>
                    <input
                      type="text"
                      placeholder="예: 홍길동"
                      value={sub.originalDriverName}
                      onChange={(e) => handleUpdateRow(sub.key, 'originalDriverName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: sub.originalDriverName.trim() ? '1px solid var(--border-subtle)' : '1px solid rgba(244, 63, 94, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#FFFFFF',
                        fontSize: '0.82rem'
                      }}
                    />
                  </div>

                  {/* 3. 바꿀 용차 기사 선택 (마스터 연동) */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                      fontWeight: 600
                    }}>
                      ③ 바꿀 용차 기사 (이름 &amp; ID 자동 매핑)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <select
                        value={sub.newDriverName}
                        onChange={(e) => handleUpdateRow(sub.key, 'newDriverName', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          background: 'rgba(30, 41, 59, 0.8)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#FFFFFF',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}
                      >
                        {drivers.map(d => (
                          <option key={d.name} value={d.name} style={{ background: '#0F172A', color: '#FFF' }}>
                            {d.name} (ID: {d.id})
                          </option>
                        ))}
                      </select>

                      <span style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '4px 6px',
                        background: 'rgba(168, 85, 247, 0.15)',
                        color: '#D8B4FE',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        {sub.newDriverId || 'ID 자동'}
                      </span>
                    </div>
                  </div>

                  {/* 4. 삭제 버튼 */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(sub.key)}
                      title="항목 삭제"
                      style={{
                        background: 'rgba(244, 63, 94, 0.12)',
                        border: 'none',
                        color: '#FB7185',
                        borderRadius: '6px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Master List Info Footer */}
          <div style={{
            marginTop: '14px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <b>등록된 용차 기사 마스터:</b> {drivers.map(d => `${d.name}(${d.id})`).join(', ')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 600 }}>
              ✓ 무결성 검증 시 업무일 및 해당 용차 기사(이름/ID) 외 모든 셀 100% 불변 검증
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
