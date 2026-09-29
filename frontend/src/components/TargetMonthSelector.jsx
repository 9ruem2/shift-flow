import React, { useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';

export default function TargetMonthSelector({
  targetYear,
  setTargetYear,
  targetMonth,
  setTargetMonth,
  calendarWeeks,
  setCalendarWeeks,
  selectedWeeks,
  setSelectedWeeks
}) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    async function fetchWeeks() {
      try {
        const res = await fetch(`/api/v1/schedule/weeks?year=${targetYear}&month=${targetMonth}`);
        if (res.ok) {
          const data = await res.json();
          const weeks = data.weeks || [];
          setCalendarWeeks(weeks);
          // Default: select all weeks in this month using year-based week_number
          setSelectedWeeks(weeks.map(w => w.week_number));
        }
      } catch (err) {
        console.error('Failed to fetch weeks', err);
      }
    }
    fetchWeeks();
  }, [targetYear, targetMonth, setCalendarWeeks, setSelectedWeeks]);

  const handlePrevYear = () => setTargetYear(prev => prev - 1);
  const handleNextYear = () => setTargetYear(prev => prev + 1);

  const toggleWeek = (weekNo) => {
    setSelectedWeeks(prev => {
      if (prev.includes(weekNo)) {
        return prev.filter(w => w !== weekNo);
      } else {
        return [...prev, weekNo].sort((a, b) => a - b);
      }
    });
  };

  const selectAllWeeks = () => {
    if (selectedWeeks.length === calendarWeeks.length) {
      setSelectedWeeks([]);
    } else {
      setSelectedWeeks(calendarWeeks.map(w => w.week_number));
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '18px 20px', marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--accent-primary-light)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            대상 연월 &amp; 주차 다중 선택
          </h2>
        </div>

        {/* Year Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={handlePrevYear}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{
            fontSize: '1rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            padding: '0 6px',
            color: '#FFFFFF'
          }}>
            {targetYear}년
          </span>
          <button
            onClick={handleNextYear}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Month Selector Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '6px',
        marginBottom: '16px'
      }}>
        {months.map(m => {
          const isSelected = targetMonth === m;
          return (
            <button
              key={m}
              onClick={() => setTargetMonth(m)}
              style={{
                padding: '8px 2px',
                borderRadius: 'var(--radius-sm)',
                border: isSelected
                  ? '1px solid var(--accent-primary-light)'
                  : '1px solid var(--border-subtle)',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.35) 0%, rgba(124, 58, 237, 0.35) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {m}월
            </button>
          );
        })}
      </div>

      {/* Week Selection Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          생성할 주차 선택 (다중 선택 가능): {selectedWeeks.length}개 선택됨
        </span>
        <button
          onClick={selectAllWeeks}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-primary-light)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          {selectedWeeks.length === calendarWeeks.length ? '선택 해제' : '전체 주차 선택'}
        </button>
      </div>

      {/* Calculated Weeks for Selected Month */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '8px'
      }}>
        {calendarWeeks.map(w => {
          const isEven = w.week_type === 'EVEN';
          const isChecked = selectedWeeks.includes(w.week_number);

          return (
            <div
              key={w.week_number}
              onClick={() => toggleWeek(w.week_number)}
              style={{
                background: isChecked
                  ? isEven
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(168, 85, 247, 0.2)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${
                  isChecked
                    ? isEven
                      ? 'var(--even-color)'
                      : 'var(--odd-color)'
                    : 'var(--border-subtle)'
                }`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isChecked
                  ? isEven
                    ? '0 0 12px rgba(59, 130, 246, 0.25)'
                    : '0 0 12px rgba(168, 85, 247, 0.25)'
                  : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: isChecked ? '#FFFFFF' : 'var(--text-secondary)'
                  }}>
                    {w.week_number}주차
                  </span>
                  <span className={isEven ? 'badge badge-even' : 'badge badge-odd'} style={{ padding: '0 5px', fontSize: '0.65rem' }}>
                    {w.week_label}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.73rem',
                  color: isChecked ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '2px'
                }}>
                  {w.formatted_range}
                </div>
              </div>

              <div style={{
                color: isChecked
                  ? isEven
                    ? 'var(--even-color)'
                    : 'var(--odd-color)'
                  : 'var(--text-muted)'
              }}>
                {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
