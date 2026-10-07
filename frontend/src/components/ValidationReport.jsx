import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Archive,
  Table,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  UserCheck
} from 'lucide-react';

export default function ValidationReport({ reportData }) {
  const [expandedFile, setExpandedFile] = useState(null);

  if (!reportData) return null;

  const {
    target_year,
    target_month,
    formatted_target,
    batch_id,
    files,
    all_integrity_passed,
    created_at
  } = reportData;

  const handleDownloadSingle = (downloadKey) => {
    window.open(`/api/v1/schedule/download/${downloadKey}`, '_blank');
  };

  const handleDownloadZip = () => {
    window.open(`/api/v1/schedule/download-zip/${batch_id}`, '_blank');
  };

  const toggleExpand = (fileType) => {
    setExpandedFile(prev => prev === fileType ? null : fileType);
  };

  // 전체 교체 건수 집계
  const totalSubstitutions = files.reduce((acc, f) => acc + (f.substitution_records ? f.substitution_records.length : 0), 0);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '22px', marginTop: '20px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: all_integrity_passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: all_integrity_passed ? '#34D399' : '#FBBF24'
          }}>
            {all_integrity_passed ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                {formatted_target} 변환 &amp; 무결성 검증 완료
              </h2>
              <span className={all_integrity_passed ? 'badge badge-success' : 'badge badge-warning'}>
                {all_integrity_passed ? '100% 무결성 통과' : '주의'}
              </span>
              {totalSubstitutions > 0 && (
                <span className="badge badge-odd" style={{ fontSize: '0.72rem' }}>
                  용차 교체 {totalSubstitutions}건 반영
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {created_at} 완료 · 배치 ID: {batch_id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* ZIP Download */}
        <button
          onClick={handleDownloadZip}
          className="btn-primary"
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
        >
          <Archive size={16} />
          <span>전체 ZIP 다운로드</span>
        </button>
      </div>

      {/* Core Verification Pillars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <CheckCircle size={14} color="#34D399" />
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#FFFFFF' }}>
              1. 규격 일치 (Shape)
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
            행/열 크기 100% 원본 일치
          </p>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <CheckCircle size={14} color="#34D399" />
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#FFFFFF' }}>
              2. 데이터 불변성 (Invariance)
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
            업무일 및 지정 용차 외 전 셀 100% 불변
          </p>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <CalendarCheck size={14} color="#34D399" />
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#FFFFFF' }}>
              3. 날짜/요일 적합성
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
            동일 요일 1:1 매핑 정상
          </p>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <UserCheck size={14} color="var(--odd-color)" />
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#FFFFFF' }}>
              4. 용차 기사 치환 검증
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
            이름 &amp; ID 마스터 매핑 일치
          </p>
        </div>
      </div>

      {/* Transformed Files Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {files.map((file) => {
          const isEven = file.file_type === 'EVEN';
          const isExpanded = expandedFile === file.download_key;
          const { integrity, week_info, substitution_records } = file;
          const subCount = substitution_records ? substitution_records.length : 0;

          return (
            <div
              key={file.download_key}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: `1px solid ${isEven ? 'var(--even-border)' : 'var(--odd-border)'}`,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}
            >
              {/* Card Header */}
              <div style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileSpreadsheet size={22} color={isEven ? 'var(--even-color)' : 'var(--odd-color)'} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF' }}>
                        {file.output_filename}
                      </span>
                      <span className={isEven ? 'badge badge-even' : 'badge badge-odd'} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {week_info ? `${week_info.week_number}주차 (${file.file_type_label})` : file.file_type_label}
                      </span>
                      {week_info && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          [{week_info.formatted_range}]
                        </span>
                      )}
                      {subCount > 0 && (
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(168, 85, 247, 0.2)',
                          color: '#E9D5FF',
                          fontWeight: 600
                        }}>
                          용차 {subCount}건 치환됨
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      원본: {file.original_filename} ({(file.file_size_bytes / 1024).toFixed(1)} KB) · 업무일 치환 {integrity.workday_count}건
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleDownloadSingle(file.download_key)}
                    className="btn-secondary"
                    style={{
                      borderColor: isEven ? 'var(--even-border)' : 'var(--odd-border)',
                      color: isEven ? '#93C5FD' : '#D8B4FE',
                      fontSize: '0.8rem',
                      padding: '7px 12px'
                    }}
                  >
                    <Download size={14} />
                    <span>다운로드 (.xlsx)</span>
                  </button>

                  <button
                    onClick={() => toggleExpand(file.download_key)}
                    className="btn-secondary"
                    style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                  >
                    <span>상세 내역</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Expandable Details Section */}
              {isExpanded && (
                <div style={{
                  padding: '14px 18px 16px 18px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'rgba(11, 15, 25, 0.6)'
                }}>
                  {/* 용차 기사 치환 내역 (존재 시) */}
                  {subCount > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--odd-color)'
                      }}>
                        <UserCheck size={15} />
                        <span>용차 기사 치환 완료 내역 ({subCount}건)</span>
                      </div>
                      <div style={{
                        background: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        {substitution_records.map((sub, sIdx) => (
                          <div key={sIdx} style={{ fontSize: '0.78rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              행 #{sub.row_index}
                            </span>
                            <span style={{ color: '#93C5FD', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                              [{sub.target_date}]
                            </span>
                            {sub.camp && (
                              <span style={{
                                fontSize: '0.7rem',
                                background: 'rgba(59, 130, 246, 0.18)',
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                color: '#93C5FD',
                                fontWeight: 600
                              }}>
                                {sub.camp}
                              </span>
                            )}
                            {sub.route && (
                              <span style={{
                                fontSize: '0.7rem',
                                fontFamily: 'var(--font-mono)',
                                background: 'rgba(168, 85, 247, 0.18)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                color: '#E9D5FF',
                                fontWeight: 600
                              }}>
                                {sub.route}
                              </span>
                            )}
                            {sub.original_driver_name && (
                              <span style={{ color: 'var(--text-secondary)' }}>({sub.original_driver_name})</span>
                            )}
                            <span style={{ color: 'var(--accent-primary-light)' }}>→</span>
                            <span style={{ color: '#F472B6', fontWeight: 700 }}>{sub.new_driver_name}</span>
                            <span style={{
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-mono)',
                              background: 'rgba(255, 255, 255, 0.1)',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              color: '#E2E8F0'
                            }}>
                              ID: {sub.new_driver_id}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 날짜 치환 샘플 테이블 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      날짜 치환 샘플 (상위 {file.sample_mappings.length}건)
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      크기: {integrity.dimension_transformed[0]}행 x {integrity.dimension_transformed[1]}열
                    </span>
                  </div>

                  <div style={{
                    overflowX: 'auto',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <table className="data-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>행</th>
                          <th>요일</th>
                          <th>원본 날짜</th>
                          <th style={{ textAlign: 'center' }}>→</th>
                          <th>치환 날짜</th>
                          <th>배치 주차</th>
                        </tr>
                      </thead>
                      <tbody>
                        {file.sample_mappings.map((m, idx) => (
                          <tr key={idx}>
                            <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              #{m.row_index}
                            </td>
                            <td>
                              <span style={{
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: m.day_name === '일' ? 'rgba(239, 68, 68, 0.15)' : m.day_name === '토' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: m.day_name === '일' ? '#F87171' : m.day_name === '토' ? '#60A5FA' : 'var(--text-secondary)',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}>
                                {m.day_name}
                              </span>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                              {m.original_date}
                            </td>
                            <td style={{ textAlign: 'center', color: 'var(--accent-primary-light)' }}>
                              →
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isEven ? '#93C5FD' : '#D8B4FE' }}>
                              {m.transformed_date}
                            </td>
                            <td style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                              {m.target_week}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

