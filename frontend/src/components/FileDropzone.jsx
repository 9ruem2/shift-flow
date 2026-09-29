import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, Trash2 } from 'lucide-react';

export default function FileDropzone({
  evenFile,
  setEvenFile,
  oddFile,
  setOddFile
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFiles = (files) => {
    Array.from(files).forEach(file => {
      const name = (file.name || '').normalize('NFC').replace(/\s+/g, '');
      if (name.includes('짝수') || name.toLowerCase().includes('even')) {
        setEvenFile(file);
      } else if (name.includes('홀수') || name.toLowerCase().includes('odd')) {
        setOddFile(file);
      } else {
        if (!evenFile) {
          setEvenFile(file);
        } else if (!oddFile) {
          setOddFile(file);
        }
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const bothFilesUploaded = !!evenFile && !!oddFile;
  const hasAnyFile = !!evenFile || !!oddFile;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UploadCloud size={18} color="var(--accent-primary-light)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            원본 엑셀 파일 업로드
          </h2>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          '짝수' / '홀수' 자동 분류
        </span>
      </div>

      {/* Unified Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        style={{
          border: `2px dashed ${
            isDragOver
              ? 'var(--accent-primary-light)'
              : bothFilesUploaded
              ? 'rgba(16, 185, 129, 0.4)'
              : 'var(--border-subtle)'
          }`,
          background: isDragOver
            ? 'rgba(99, 102, 241, 0.1)'
            : bothFilesUploaded
            ? 'rgba(16, 185, 129, 0.03)'
            : 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: hasAnyFile ? '18px' : '30px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isDragOver ? 'var(--shadow-glow)' : 'none',
          marginBottom: '12px'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx, .xls"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: bothFilesUploaded
            ? 'rgba(16, 185, 129, 0.15)'
            : 'rgba(99, 102, 241, 0.15)',
          margin: '0 auto 8px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: bothFilesUploaded ? '#34D399' : 'var(--accent-primary-light)'
        }}>
          {bothFilesUploaded ? <CheckCircle2 size={22} /> : <UploadCloud size={22} />}
        </div>

        <p style={{
          fontSize: '0.92rem',
          fontWeight: 600,
          color: '#FFFFFF',
          margin: 0
        }}>
          {bothFilesUploaded
            ? '파일 2종 등록 완료 (클릭/드롭 시 교체)'
            : '엑셀 파일 2개(짝수/홀수)를 한 번에 드래그하거나 클릭하여 선택'}
        </p>
      </div>

      {/* Uploaded Files Cards */}
      {hasAnyFile && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '10px'
        }}>
          {/* Even Slot Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: `1px solid ${evenFile ? 'var(--even-border)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileSpreadsheet size={20} color={evenFile ? 'var(--even-color)' : 'var(--text-muted)'} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-even" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                    짝수 원본
                  </span>
                  {evenFile && (
                    <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 600 }}>✓</span>
                  )}
                </div>
                {evenFile ? (
                  <p style={{
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    color: '#FFFFFF',
                    margin: '2px 0 0 0',
                    maxWidth: '180px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {evenFile.name} ({formatFileSize(evenFile.size)})
                  </p>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>미등록</span>
                )}
              </div>
            </div>

            {evenFile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEvenFile(null);
                }}
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: 'none',
                  color: '#FB7185',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  fontSize: '0.72rem'
                }}
              >
                삭제
              </button>
            )}
          </div>

          {/* Odd Slot Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: `1px solid ${oddFile ? 'var(--odd-border)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileSpreadsheet size={20} color={oddFile ? 'var(--odd-color)' : 'var(--text-muted)'} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-odd" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                    홀수 원본
                  </span>
                  {oddFile && (
                    <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 600 }}>✓</span>
                  )}
                </div>
                {oddFile ? (
                  <p style={{
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    color: '#FFFFFF',
                    margin: '2px 0 0 0',
                    maxWidth: '180px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {oddFile.name} ({formatFileSize(oddFile.size)})
                  </p>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>미등록</span>
                )}
              </div>
            </div>

            {oddFile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOddFile(null);
                }}
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: 'none',
                  color: '#FB7185',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  fontSize: '0.72rem'
                }}
              >
                삭제
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
