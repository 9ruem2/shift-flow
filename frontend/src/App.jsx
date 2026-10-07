import React, { useState } from 'react';
import Header from './components/Header';
import TargetMonthSelector from './components/TargetMonthSelector';
import FileDropzone from './components/FileDropzone';
import DriverSubstitutionPanel from './components/DriverSubstitutionPanel';
import ValidationReport from './components/ValidationReport';
import ArchitectureModal from './components/ArchitectureModal';
import { Play, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [targetYear, setTargetYear] = useState(2026);
  const [targetMonth, setTargetMonth] = useState(10);
  const [calendarWeeks, setCalendarWeeks] = useState([]);
  
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  
  const [evenFile, setEvenFile] = useState(null);
  const [oddFile, setOddFile] = useState(null);

  // 옵셔널 용차 기사 교체 목록: [{ key, targetDate, originalDriverName, newDriverName, newDriverId }]
  const [substitutions, setSubstitutions] = useState([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  const handleTransform = async () => {
    if (!evenFile && !oddFile) {
      setErrorMsg('최소 1개 이상의 원본 파일(짝수 또는 홀수)을 업로드해주세요.');
      return;
    }
    if (selectedWeeks.length === 0) {
      setErrorMsg('생성할 주차를 최소 1개 이상 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setReportData(null);
    setCurrentStep(1);

    try {
      const formData = new FormData();
      if (evenFile) {
        formData.append('files', evenFile);
        formData.append('file_types', 'EVEN');
      }
      if (oddFile) {
        formData.append('files', oddFile);
        formData.append('file_types', 'ODD');
      }
      formData.append('target_year', targetYear);
      formData.append('target_month', targetMonth);
      
      selectedWeeks.forEach(w => {
        formData.append('selected_weeks', w);
      });

      // 유효한 용차 기사 교체 규칙만 필터링하여 전송
      const validSubstitutions = substitutions
        .filter(s => s.targetDate && s.originalDriverName.trim() && s.newDriverName)
        .map(s => ({
          target_date: s.targetDate.trim(),
          original_driver_name: s.originalDriverName.trim(),
          new_driver_name: s.newDriverName.trim(),
          new_driver_id: s.newDriverId ? s.newDriverId.trim() : null
        }));

      if (validSubstitutions.length > 0) {
        formData.append('substitutions', JSON.stringify(validSubstitutions));
      }

      setTimeout(() => setCurrentStep(2), 300);
      setTimeout(() => setCurrentStep(3), 600);

      const res = await fetch('/api/v1/schedule/transform', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || '변환 작업 중 오류가 발생했습니다.');
      }

      setCurrentStep(4);
      setReportData(data);
    } catch (err) {
      setErrorMsg(err.message);
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setEvenFile(null);
    setOddFile(null);
    setSubstitutions([]);
    setReportData(null);
    setErrorMsg(null);
    setCurrentStep(0);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onOpenArchitecture={() => setIsArchModalOpen(true)} />

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 20px 60px 20px',
        width: '100%'
      }}>
        {/* 1. File Upload Dropzone */}
        <FileDropzone
          evenFile={evenFile}
          setEvenFile={setEvenFile}
          oddFile={oddFile}
          setOddFile={setOddFile}
        />

        {/* 2. Target Month Selector */}
        <TargetMonthSelector
          targetYear={targetYear}
          setTargetYear={setTargetYear}
          targetMonth={targetMonth}
          setTargetMonth={setTargetMonth}
          calendarWeeks={calendarWeeks}
          setCalendarWeeks={setCalendarWeeks}
          selectedWeeks={selectedWeeks}
          setSelectedWeeks={setSelectedWeeks}
        />

        {/* 3. [옵셔널] 용차 기사 교체 설정 패널 (접었다 폈다 가능) */}
        <DriverSubstitutionPanel
          calendarWeeks={calendarWeeks}
          substitutions={substitutions}
          setSubstitutions={setSubstitutions}
        />

        {/* Error Alert */}
        {errorMsg && (
          <div className="glass-panel animate-slide-down" style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} color="#FB7185" />
            <span style={{ fontSize: '0.85rem', color: '#FECDD3' }}>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          margin: '8px 0 20px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleTransform}
              disabled={isProcessing || (!evenFile && !oddFile)}
              className="btn-primary"
              style={{
                padding: '13px 32px',
                fontSize: '1rem'
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin-slow" />
                  <span>변환 및 검증 중...</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="#FFFFFF" />
                  <span>{targetYear}년 {targetMonth}월 일정 변환 및 검증 실행</span>
                </>
              )}
            </button>

            {(evenFile || oddFile || reportData || substitutions.length > 0) && (
              <button
                onClick={handleReset}
                className="btn-secondary"
                style={{ padding: '13px 18px' }}
                title="초기화"
              >
                <RefreshCw size={15} />
                <span>초기화</span>
              </button>
            )}
          </div>

          {/* Step visualizer */}
          {isProcessing && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-glow)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ color: currentStep >= 1 ? '#34D399' : 'inherit', fontWeight: 600 }}>
                ① 파일 파싱
              </span>
              <span>→</span>
              <span style={{ color: currentStep >= 2 ? '#34D399' : 'inherit', fontWeight: 600 }}>
                ② 주차 계산
              </span>
              <span>→</span>
              <span style={{ color: currentStep >= 3 ? '#34D399' : 'inherit', fontWeight: 600 }}>
                ③ 날짜 &amp; 용차 치환
              </span>
              <span>→</span>
              <span style={{ color: currentStep >= 4 ? '#34D399' : 'inherit', fontWeight: 600 }}>
                ④ 3중 무결성 검증
              </span>
            </div>
          )}
        </div>

        {/* 4. Validation Report & Download Section */}
        {reportData && <ValidationReport reportData={reportData} />}
      </main>

      {/* Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}

