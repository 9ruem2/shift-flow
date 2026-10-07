import React, { useState, useEffect } from "react";
import { UserCheck, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import CustomDatePicker from "./CustomDatePicker";

const FALLBACK_DRIVERS = [
  { name: "이미복", id: "wlfjddp1" },
  { name: "윤주영", id: "rose2411" },
  { name: "지요셉", id: "j001919" },
  { name: "최수빈", id: "tomorrow1004" },
  { name: "배정한", id: "bjh7823" },
  { name: "오지훈", id: "daegook" },
  { name: "강민규", id: "mindalgod" },
  { name: "권광훈", id: "wlfjddp" },
];

export default function DriverSubstitutionPanel({
  calendarWeeks,
  substitutions,
  setSubstitutions,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [drivers, setDrivers] = useState(FALLBACK_DRIVERS);

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const res = await fetch("/api/v1/schedule/drivers");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDrivers(data);
          }
        }
      } catch (err) {
        console.warn("Using fallback contract drivers list");
      }
    }
    fetchDrivers();
  }, []);

  // 현재 선택된 월에 포함된 모든 날짜 목록 (YYYY-MM-DD) 추출
  const availableDates = React.useMemo(() => {
    const dateSet = new Set();
    calendarWeeks.forEach((w) => {
      if (w.days && Array.isArray(w.days)) {
        w.days.forEach((d) => dateSet.add(d));
      }
    });
    return Array.from(dateSet).sort();
  }, [calendarWeeks]);

  const handleAddRow = () => {
    const defaultDate = availableDates.length > 0 ? availableDates[0] : "";

    setSubstitutions((prev) => [
      ...prev,
      {
        key: Date.now() + Math.random(),
        targetDate: defaultDate,
        originalDriverName: "",
        newDriverName: "", // '기사 선택' 기본값
        newDriverId: "",
      },
    ]);
    if (!isOpen) setIsOpen(true);
  };

  const handleRemoveRow = (key) => {
    setSubstitutions((prev) => prev.filter((item) => item.key !== key));
  };

  const handleUpdateRow = (key, field, value) => {
    setSubstitutions((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        if (field === "newDriverName") {
          const matched = drivers.find((d) => d.name === value);
          return {
            ...item,
            newDriverName: value,
            newDriverId: matched ? matched.id : "",
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  };

  const activeCount = substitutions.filter(
    (s) => s.targetDate && s.originalDriverName.trim() && s.newDriverName,
  ).length;

  return (
    <div
      className="glass-panel"
      style={{
        marginBottom: "20px",
        overflow: "visible", // 달력 팝오버를 위해 visible 처리
        border:
          activeCount > 0
            ? "1px solid rgba(168, 85, 247, 0.4)"
            : "1px solid var(--border-subtle)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          background: isOpen ? "rgba(255, 255, 255, 0.02)" : "transparent",
          borderBottom: isOpen ? "1px solid var(--border-subtle)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UserCheck size={17} color="var(--odd-color)" />
          <span
            style={{ fontSize: "0.92rem", fontWeight: 700, color: "#FFFFFF" }}
          >
            용차 기사 변경 (선택)
          </span>

          {activeCount > 0 ? (
            <span
              className="badge badge-odd"
              style={{ fontSize: "0.68rem", padding: "1px 6px" }}
            >
              {activeCount}건 설정
            </span>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              - 필요 시 특정 날짜의 기사 교체
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-secondary)",
          }}
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div
          style={{
            padding: "16px 18px",
            background: "rgba(15, 23, 42, 0.4)",
            overflow: "visible",
          }}
        >
          {substitutions.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px dashed var(--border-subtle)",
              }}
            >
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                설정된 용차 변경 항목이 없습니다.
              </span>
              <button
                type="button"
                onClick={handleAddRow}
                className="btn-secondary"
                style={{
                  padding: "5px 10px",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  borderColor: "var(--odd-color)",
                  color: "#E9D5FF",
                }}
              >
                <Plus size={13} />
                <span>항목 추가</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                overflow: "visible",
              }}
            >
              {/* Table Column Labels */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(150px, 1.3fr) minmax(110px, 1fr) minmax(160px, 1.3fr) 36px",
                  gap: "8px",
                  padding: "0 4px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                }}
              >
                <div>업무일 (달력 선택)</div>
                <div>기존 기사명</div>
                <div>변경할 용차 기사</div>
                <div style={{ textAlign: "center" }}>삭제</div>
              </div>

              {substitutions.map((sub) => (
                <div
                  key={sub.key}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(150px, 1.3fr) minmax(110px, 1fr) minmax(160px, 1.3fr) 36px",
                    gap: "8px",
                    alignItems: "center",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 10px",
                    overflow: "visible",
                    position: "relative",
                  }}
                >
                  {/* 업무일 (커스텀 숫자월 달력 피커) */}
                  <div>
                    <CustomDatePicker
                      value={sub.targetDate}
                      onChange={(dateStr) =>
                        handleUpdateRow(sub.key, "targetDate", dateStr)
                      }
                      placeholder="날짜 선택"
                    />
                  </div>

                  {/* 기존 기사명 */}
                  <div>
                    <input
                      type="text"
                      placeholder="기존 기사명"
                      value={sub.originalDriverName}
                      onChange={(e) =>
                        handleUpdateRow(
                          sub.key,
                          "originalDriverName",
                          e.target.value,
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        background: "rgba(30, 41, 59, 0.8)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "4px",
                        color: "#FFFFFF",
                        fontSize: "0.8rem",
                      }}
                    />
                  </div>

                  {/* 용차 기사 선택 (초기: '기사 선택') */}
                  <div>
                    <select
                      value={sub.newDriverName}
                      onChange={(e) =>
                        handleUpdateRow(
                          sub.key,
                          "newDriverName",
                          e.target.value,
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        background: "rgba(30, 41, 59, 0.8)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "4px",
                        color: sub.newDriverName
                          ? "#FFFFFF"
                          : "var(--text-muted)",
                        fontSize: "0.8rem",
                        fontWeight: sub.newDriverName ? 600 : 400,
                      }}
                    >
                      <option
                        value=""
                        style={{
                          background: "#0F172A",
                          color: "var(--text-muted)",
                        }}
                      >
                        기사 선택
                      </option>
                      {drivers.map((d) => (
                        <option
                          key={d.name}
                          value={d.name}
                          style={{ background: "#0F172A", color: "#FFF" }}
                        >
                          {d.name} ({d.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 삭제 버튼 */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(sub.key)}
                      title="삭제"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#FB7185",
                        borderRadius: "4px",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Row Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginTop: "4px",
                }}
              >
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="btn-secondary"
                  style={{
                    padding: "5px 12px",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <Plus size={13} />
                  <span>항목 추가</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
