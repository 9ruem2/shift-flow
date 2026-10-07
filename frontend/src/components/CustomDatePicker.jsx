import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CustomDatePicker({ value, onChange, placeholder = '날짜 선택' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // 초기 연/월 파싱
  const initialDate = React.useMemo(() => {
    if (value && value.includes('-')) {
      const [y, m, d] = value.split('-').map(Number);
      if (y && m && d) return { year: y, month: m, day: d };
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
  }, [value]);

  const [viewYear, setViewYear] = useState(initialDate.year);
  const [viewMonth, setViewMonth] = useState(initialDate.month);

  // value가 변경될 때 view 동기화
  useEffect(() => {
    if (value && value.includes('-')) {
      const [y, m] = value.split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m);
      }
    }
  }, [value]);

  // 외부 클릭 시 달력 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewYear(prev => prev - 1);
      setViewMonth(12);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewYear(prev => prev + 1);
      setViewMonth(1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // 해당 월의 날짜 그리드 계산
  const calendarDays = React.useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0(일) ~ 6(토)
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate();

    const days = [];

    // 이전 달 날짜들
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        dateStr: ''
      });
    }

    // 이번 달 날짜들
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(viewMonth).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      days.push({
        day: d,
        isCurrentMonth: true,
        dateStr: `${viewYear}-${monthStr}-${dayStr}`
      });
    }

    // 다음 달 날짜들 (총 35 or 42칸 맞추기)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        dateStr: ''
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handleSelectDay = (dateStr) => {
    if (!dateStr) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  // 표시 라벨 (예: 2026.10.14 (수))
  const displayLabel = React.useMemo(() => {
    if (!value || !value.includes('-')) return '';
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return value;
    const dateObj = new Date(y, m - 1, d);
    const dayName = WEEKDAYS[dateObj.getDay()];
    return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')} (${dayName})`;
  }, [value]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 1000 : 'auto' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '6px 10px',
          background: 'rgba(30, 41, 59, 0.8)',
          border: isOpen ? '1px solid var(--accent-primary-light)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          color: value ? '#FFFFFF' : 'var(--text-muted)',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.15s ease'
        }}
      >
        <span>{displayLabel || placeholder}</span>
        <CalendarIcon size={14} color="var(--accent-primary-light)" />
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          zIndex: 99999,
          width: '260px',
          background: '#0F172A',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(99, 102, 241, 0.3)',
          padding: '12px',
          userSelect: 'none'
        }}>
          {/* Header: 연도 & 숫자 월 이동 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '3px 6px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronLeft size={14} />
            </button>

            <span style={{
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)'
            }}>
              {viewYear}년 {viewMonth}월
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '3px 6px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Weekday Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px',
            marginBottom: '4px',
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: 700
          }}>
            {WEEKDAYS.map((wd, i) => (
              <div
                key={wd}
                style={{
                  color: i === 0 ? '#F87171' : i === 6 ? '#60A5FA' : 'var(--text-muted)',
                  padding: '2px 0'
                }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px'
          }}>
            {calendarDays.map((dObj, idx) => {
              const isSelected = dObj.dateStr && dObj.dateStr === value;
              const isSun = idx % 7 === 0;
              const isSat = idx % 7 === 6;

              if (!dObj.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    style={{
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      color: 'rgba(255, 255, 255, 0.15)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {dObj.day}
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(dObj.dateStr)}
                  style={{
                    height: '28px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: isSelected ? 800 : 500,
                    background: isSelected
                      ? 'var(--accent-primary)'
                      : 'transparent',
                    color: isSelected
                      ? '#FFFFFF'
                      : isSun
                      ? '#FCA5A5'
                      : isSat
                      ? '#93C5FD'
                      : '#E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {dObj.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
