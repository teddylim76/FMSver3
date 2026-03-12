
// =============================================================================
// 장애관리시스템 (FaultManagementSystem) ver3
// ITS 현장장비 장애관리 웹앱
// Firebase Firestore + Storage 기반
// =============================================================================

import { useState, useEffect, useCallback, useRef } from "react";

// ── Firebase SDK (CDN via importmap 대신 시뮬레이션 레이어) ──────────────────
// 실제 배포 시에는 아래 firebaseConfig 값을 그대로 사용하면 됩니다.
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAC_Hbm4sRQ6t3E5XoOgYSkrShxKW6uPrM",
  authDomain: "fmsver3.firebaseapp.com",
  databaseURL: "https://fmsver3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fmsver3",
  storageBucket: "fmsver3.firebasestorage.app",
  messagingSenderId: "57213170355",
  appId: "1:57213170355:web:47f279a4c635f63d25f6c6",
  measurementId: "G-7T522BJQN2",
};

// ── 초기 더미 데이터 (Firestore 연동 전 미리보기용) ──────────────────────────
const INIT_USERS = [
  { id: "u1", name: "관리자", email: "admin@its.go.kr", role: "admin", dept: "ITS관리센터", phone: "02-1234-5678" },
  { id: "u2", name: "홍길동", email: "hong@its.go.kr", role: "user", dept: "현장운영팀", phone: "010-1111-2222" },
  { id: "u3", name: "김현장", email: "kim@its.go.kr", role: "user", dept: "도로유지팀", phone: "010-3333-4444" },
];
const INIT_FACILITIES = [
  { id: "f1", equipId: "ITS-VDS-001", projectName: "국도77호선ITS구축", equipName: "차량검지기(VDS)", address: "경기 화성시 향남읍 발안로 123", mileage: "32.5km", ip: "192.168.1.101", gateway: "192.168.1.1", subnet: "255.255.255.0", note: "상행선 1차로", photos: [] },
  { id: "f2", equipId: "ITS-CCTV-002", projectName: "국도77호선ITS구축", equipName: "CCTV", address: "경기 화성시 비봉면 삼화로 456", mileage: "38.2km", ip: "192.168.1.102", gateway: "192.168.1.1", subnet: "255.255.255.0", note: "교차로 감시용", photos: [] },
  { id: "f3", equipId: "ITS-VMS-003", projectName: "수도권순환고속ITS", equipName: "가변전광표지(VMS)", address: "서울 강동구 천호대로 789", mileage: "5.1km", ip: "10.10.1.50", gateway: "10.10.1.1", subnet: "255.255.255.0", note: "진입부 안내", photos: [] },
];
const INIT_FAULTS = [
  { id: "fa1", date: "2025-03-10", dept: "현장운영팀", applicant: "홍길동", phone: "010-1111-2222", address: "경기 화성시 향남읍 발안로 123", symptom: "차량검지 오류 - 검지율 급격 저하 (정상 98%→현재 42%)", status: "완료", asName: "이AS담당", processNote: "루프검지기 단선 확인 후 케이블 교체 완료", processDate: "2025-03-12", equipId: "ITS-VDS-001", photos: [] },
  { id: "fa2", date: "2025-03-11", dept: "도로유지팀", applicant: "김현장", phone: "010-3333-4444", address: "경기 화성시 비봉면 삼화로 456", symptom: "CCTV 화면 미수신 - 네트워크 장애 의심", status: "처리중", asName: "박네트워크", processNote: "현장 출동 후 스위치 장비 점검 중", processDate: "2025-03-12", equipId: "ITS-CCTV-002", photos: [] },
  { id: "fa3", date: "2025-03-12", dept: "ITS관리센터", applicant: "관리자", phone: "02-1234-5678", address: "서울 강동구 천호대로 789", symptom: "VMS 전광판 일부 LED 소등", status: "접수", asName: "", processNote: "", processDate: "", equipId: "", photos: [] },
];

// ── 색상 팔레트 & 디자인 토큰 ────────────────────────────────────────────────
const STATUS_META = {
  "접수":   { color: "#F59E0B", bg: "#FEF3C7", label: "접수대기", icon: "⏳" },
  "처리중": { color: "#3B82F6", bg: "#DBEAFE", label: "처리중",   icon: "🔧" },
  "완료":   { color: "#10B981", bg: "#D1FAE5", label: "처리완료", icon: "✅" },
};

// ── 유틸 함수 ────────────────────────────────────────────────────────────────
const genId = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? d.replace(/-/g, ".") : "-";

// ── CSS-in-JS 스타일 주입 ────────────────────────────────────────────────────
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:    #0B1D3A;
    --navy2:   #122448;
    --accent:  #00C6FF;
    --accent2: #0072FF;
    --surface: #F0F4FA;
    --card:    #FFFFFF;
    --text:    #1A2B4A;
    --text2:   #5A6E8C;
    --border:  #D6E0F0;
    --danger:  #EF4444;
    --success: #10B981;
    --warn:    #F59E0B;
    --info:    #3B82F6;
    --radius:  10px;
    --shadow:  0 2px 16px rgba(11,29,58,0.10);
    --shadow2: 0 4px 32px rgba(11,29,58,0.18);
    --font:    'Noto Sans KR', sans-serif;
    --mono:    'JetBrains Mono', monospace;
  }

  body { font-family: var(--font); background: var(--surface); color: var(--text); min-height: 100vh; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #e8eef8; }
  ::-webkit-scrollbar-thumb { background: #b0c0d8; border-radius: 3px; }

  /* Layout */
  .app-shell { display: flex; height: 100vh; overflow: hidden; }
  .sidebar {
    width: 240px; min-width: 240px; background: var(--navy);
    display: flex; flex-direction: column; overflow-y: auto;
    box-shadow: 2px 0 16px rgba(0,0,0,0.18);
    z-index: 10;
  }
  .sidebar-logo {
    padding: 22px 20px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .sidebar-logo h1 {
    color: var(--accent); font-size: 14px; font-weight: 700; letter-spacing: 0.04em;
    line-height: 1.4;
  }
  .sidebar-logo p { color: rgba(255,255,255,0.45); font-size: 11px; margin-top:3px; }
  .sidebar-section { padding: 10px 0; }
  .sidebar-label {
    color: rgba(255,255,255,0.3); font-size: 10px; font-weight: 600;
    letter-spacing: 0.1em; padding: 6px 20px 4px; text-transform: uppercase;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 20px; color: rgba(255,255,255,0.7);
    cursor: pointer; font-size: 13.5px; font-weight: 500;
    transition: all 0.18s; border-left: 3px solid transparent;
    user-select: none;
  }
  .nav-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .nav-item.active {
    background: rgba(0,198,255,0.12); color: var(--accent);
    border-left-color: var(--accent);
  }
  .nav-item .icon { font-size: 16px; width: 20px; text-align: center; }

  .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar {
    height: 56px; background: var(--card); border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); flex-shrink: 0;
  }
  .topbar-title { font-size: 15px; font-weight: 700; color: var(--text); }
  .topbar-user {
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: var(--text2);
  }
  .avatar {
    width: 32px; height: 32px; border-radius: 50%; background: var(--navy);
    color: var(--accent); font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  .page-content { flex: 1; overflow-y: auto; padding: 28px; }

  /* Cards */
  .card {
    background: var(--card); border-radius: var(--radius);
    border: 1px solid var(--border); box-shadow: var(--shadow);
  }
  .card-header {
    padding: 18px 22px 14px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-title { font-size: 14px; font-weight: 700; color: var(--text); }
  .card-body { padding: 20px 22px; }

  /* Dashboard Stat Cards */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card {
    background: var(--card); border-radius: var(--radius);
    border: 1px solid var(--border); box-shadow: var(--shadow);
    padding: 20px 22px; cursor: pointer;
    transition: all 0.2s; position: relative; overflow: hidden;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow2); }
  .stat-card.active-filter { border-color: var(--accent2); box-shadow: 0 0 0 2px rgba(0,114,255,0.2); }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  }
  .stat-card.all::before { background: linear-gradient(90deg, var(--accent), var(--accent2)); }
  .stat-card.pending::before { background: var(--warn); }
  .stat-card.processing::before { background: var(--info); }
  .stat-card.done::before { background: var(--success); }
  .stat-label { font-size: 11px; font-weight: 600; color: var(--text2); letter-spacing: 0.05em; text-transform: uppercase; }
  .stat-value { font-size: 32px; font-weight: 700; color: var(--text); font-family: var(--mono); margin-top: 6px; }
  .stat-icon { position: absolute; right: 16px; top: 16px; font-size: 28px; opacity: 0.15; }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { background: #F7F9FD; }
  th {
    padding: 10px 14px; text-align: left; font-weight: 600; color: var(--text2);
    font-size: 11.5px; letter-spacing: 0.04em; text-transform: uppercase;
    border-bottom: 2px solid var(--border); white-space: nowrap;
  }
  td { padding: 11px 14px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
  tbody tr { cursor: pointer; transition: background 0.15s; }
  tbody tr:hover { background: #F0F7FF; }
  tbody tr:last-child td { border-bottom: none; }

  /* Status Badge */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600;
  }

  /* Forms */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1/-1; }
  label { font-size: 12px; font-weight: 600; color: var(--text2); }
  input[type=text], input[type=email], input[type=password], input[type=date],
  input[type=tel], select, textarea {
    border: 1.5px solid var(--border); border-radius: 7px;
    padding: 9px 12px; font-size: 13.5px; font-family: var(--font);
    color: var(--text); background: #fff; width: 100%;
    transition: border-color 0.18s, box-shadow 0.18s;
    outline: none;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--accent2); box-shadow: 0 0 0 3px rgba(0,114,255,0.12);
  }
  textarea { resize: vertical; min-height: 80px; }
  select { cursor: pointer; }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: 7px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.18s; font-family: var(--font);
    white-space: nowrap;
  }
  .btn-primary { background: linear-gradient(135deg, var(--accent2), #0095DD); color: #fff; }
  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn-secondary { background: #EEF3FA; color: var(--text); border: 1.5px solid var(--border); }
  .btn-secondary:hover { background: #E4ECF7; }
  .btn-danger { background: #FEE2E2; color: var(--danger); border: 1.5px solid #FECACA; }
  .btn-danger:hover { background: #FCA5A5; color: #fff; }
  .btn-success { background: #D1FAE5; color: #065F46; border: 1.5px solid #A7F3D0; }
  .btn-success:hover { background: var(--success); color: #fff; }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-excel { background: #166534; color: #fff; }
  .btn-excel:hover { background: #14532D; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(11,29,58,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; backdrop-filter: blur(3px);
  }
  .modal {
    background: var(--card); border-radius: 14px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.25);
    width: 90%; max-width: 720px; max-height: 90vh;
    display: flex; flex-direction: column; overflow: hidden;
  }
  .modal-sm { max-width: 460px; }
  .modal-lg { max-width: 900px; }
  .modal-header {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .modal-header h3 { font-size: 15px; font-weight: 700; }
  .modal-body { padding: 22px 24px; overflow-y: auto; flex: 1; }
  .modal-footer {
    padding: 14px 24px; border-top: 1px solid var(--border);
    display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;
  }
  .btn-close {
    background: none; border: none; cursor: pointer; font-size: 20px;
    color: var(--text2); padding: 2px; line-height: 1;
  }

  /* Photo Upload */
  .photo-upload-area {
    border: 2px dashed var(--border); border-radius: 10px;
    padding: 20px; text-align: center; cursor: pointer;
    transition: border-color 0.18s, background 0.18s;
  }
  .photo-upload-area:hover { border-color: var(--accent2); background: #F0F7FF; }
  .photo-grid { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
  .photo-thumb {
    width: 80px; height: 80px; border-radius: 8px; object-fit: cover;
    border: 2px solid var(--border); position: relative;
  }
  .photo-thumb-wrap { position: relative; display: inline-block; }
  .photo-delete {
    position: absolute; top: -6px; right: -6px; width: 20px; height: 20px;
    background: var(--danger); color: #fff; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; cursor: pointer; border: 2px solid #fff;
  }

  /* Search bar */
  .search-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .search-input-wrap { position: relative; flex: 1; min-width: 200px; }
  .search-input-wrap input { padding-left: 36px; }
  .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text2); font-size: 14px; }

  /* Info row */
  .info-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .info-chip {
    background: #F0F4FA; border-radius: 6px; padding: 3px 10px;
    font-size: 12px; color: var(--text2); font-family: var(--mono;)
  }

  /* Toasts */
  .toast-area { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
  .toast {
    background: var(--navy); color: #fff; border-radius: 10px;
    padding: 12px 20px; font-size: 13px; box-shadow: var(--shadow2);
    display: flex; align-items: center; gap: 10px;
    animation: slideIn 0.25s ease;
  }
  .toast.success { border-left: 4px solid var(--success); }
  .toast.error   { border-left: 4px solid var(--danger); }
  .toast.info    { border-left: 4px solid var(--info); }
  @keyframes slideIn { from { transform: translateX(60px); opacity:0; } to { transform: none; opacity:1; } }

  /* Login */
  .login-page {
    min-height: 100vh; background: var(--navy);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .login-box {
    background: var(--card); border-radius: 18px;
    padding: 44px 44px; width: 420px; box-shadow: var(--shadow2);
  }
  .login-logo { text-align: center; margin-bottom: 30px; }
  .login-logo .badge-logo {
    display: inline-block; background: linear-gradient(135deg, var(--accent2), var(--accent));
    color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;
  }
  .login-logo h2 { font-size: 20px; font-weight: 800; color: var(--text); line-height: 1.3; }
  .login-logo p { color: var(--text2); font-size: 12.5px; margin-top: 4px; }
  .login-tabs { display: flex; border: 1.5px solid var(--border); border-radius: 8px; margin-bottom: 22px; overflow: hidden; }
  .login-tab { flex: 1; padding: 9px; text-align: center; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text2); transition: all 0.18s; }
  .login-tab.active { background: var(--navy); color: #fff; }

  /* Section divider */
  .section-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
  .section-divider span { font-size: 11px; font-weight: 600; color: var(--text2); white-space: nowrap; }
  .divider-line { flex: 1; height: 1px; background: var(--border); }

  /* Empty state */
  .empty-state { text-align: center; padding: 56px 20px; color: var(--text2); }
  .empty-state .icon { font-size: 48px; margin-bottom: 12px; }
  .empty-state p { font-size: 14px; }

  /* Responsive tweaks */
  @media (max-width: 900px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .form-grid { grid-template-columns: 1fr; }
    .form-grid-3 { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .sidebar { width: 200px; min-width: 200px; }
    .page-content { padding: 16px; }
  }
`;

// ── Global Toast Manager ─────────────────────────────────────────────────────
let _toastSetter = null;
const toast = (msg, type = "info") => _toastSetter?.((t) => [...t, { id: genId(), msg, type }]);

function ToastArea() {
  const [toasts, setToasts] = useState([]);
  _toastSetter = setToasts;
  useEffect(() => {
    if (!toasts.length) return;
    const timer = setTimeout(() => setToasts((t) => t.slice(1)), 3000);
    return () => clearTimeout(timer);
  }, [toasts]);
  return (
    <div className="toast-area">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"} {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status] || {};
  return (
    <span className="badge" style={{ background: m.bg, color: m.color }}>
      {m.icon} {status}
    </span>
  );
}

// ── Photo Upload Component ───────────────────────────────────────────────────
function PhotoUpload({ photos, setPhotos, label = "사진 업로드" }) {
  const inputRef = useRef();
  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPhotos((prev) => [...prev, { id: genId(), url: ev.target.result, name: f.name }]);
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  };
  return (
    <div>
      <div className="photo-upload-area" onClick={() => inputRef.current.click()}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>{label} (클릭하여 파일 선택)</div>
        <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 4 }}>JPG, PNG, GIF 지원</div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFile} style={{ display: "none" }} />
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((p) => (
            <div key={p.id} className="photo-thumb-wrap">
              <img src={p.url} alt={p.name} className="photo-thumb" />
              <div className="photo-delete" onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}>✕</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Calendar Date Picker ─────────────────────────────────────────────────────
function DatePicker({ value, onChange, label }) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// ── Address Search Popup ─────────────────────────────────────────────────────
function AddressPopup({ facilities, onSelect, onClose }) {
  const [q, setQ] = useState("");
  const filtered = facilities.filter(
    (f) => f.address?.includes(q) || f.equipId?.includes(q) || f.equipName?.includes(q)
  );
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📍 주소 / 장비 검색</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="search-input-wrap" style={{ marginBottom: 14 }}>
            <span className="search-icon">🔍</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="주소, 장비ID, 장비명 검색..." />
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {filtered.length === 0 && <div className="empty-state"><p>검색 결과 없음</p></div>}
            {filtered.map((f) => (
              <div
                key={f.id}
                style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8, cursor: "pointer" }}
                onClick={() => { onSelect(f); onClose(); }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{f.equipId} - {f.equipName}</div>
                <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>📍 {f.address}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

// ── Equipment Search Popup (for Fault Form) ──────────────────────────────────
function EquipSearchPopup({ facilities, onSelect, onClose }) {
  const [q, setQ] = useState("");
  const filtered = facilities.filter(
    (f) => f.equipId?.includes(q) || f.address?.includes(q) || f.ip?.includes(q)
  );
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔎 장비 ID 검색</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="search-input-wrap" style={{ marginBottom: 14 }}>
            <span className="search-icon">🔍</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="장비ID, 주소, IP 검색..." />
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {filtered.map((f) => (
              <div
                key={f.id}
                style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8, cursor: "pointer" }}
                onClick={() => { onSelect(f); onClose(); }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{f.equipId}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>{f.equipName} | {f.address}</div>
                <div style={{ fontSize: 11, color: "var(--text2)", fontFamily: "var(--mono)" }}>IP: {f.ip}</div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state"><p>검색 결과 없음</p></div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: 로그인 / 회원가입
// ════════════════════════════════════════════════════════════════════════════
function LoginPage({ users, setUsers, onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", dept: "", phone: "", role: "user" });
  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const doLogin = () => {
    const u = users.find((u) => u.email === form.email && u.password === form.password);
    if (!u) { toast("이메일 또는 비밀번호가 올바르지 않습니다.", "error"); return; }
    toast(`${u.name}님 로그인 되었습니다.`, "success");
    onLogin(u);
  };

  const doRegister = () => {
    if (!form.name || !form.email || !form.password || !form.dept) {
      toast("필수 항목을 모두 입력하세요.", "error"); return;
    }
    if (users.find((u) => u.email === form.email)) {
      toast("이미 사용 중인 이메일입니다.", "error"); return;
    }
    const newUser = { id: genId(), ...form };
    setUsers((prev) => [...prev, newUser]);
    toast("회원가입 완료! 로그인해주세요.", "success");
    setTab("login");
    setForm({ name: "", email: form.email, password: "", dept: "", phone: "", role: "user" });
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <div className="badge-logo">ITS FIELD MGMT</div>
          <h2>장애관리시스템</h2>
          <p>FaultManagementSystem ver3</p>
        </div>
        <div className="login-tabs">
          <div className={`login-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>로그인</div>
          <div className={`login-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>회원가입</div>
        </div>

        {tab === "login" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-group">
              <label>이메일</label>
              <input type="email" value={form.email} onChange={(e) => up("email", e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>비밀번호</label>
              <input type="password" value={form.password} onChange={(e) => up("password", e.target.value)} placeholder="비밀번호 입력" onKeyDown={(e) => e.key === "Enter" && doLogin()} />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={doLogin}>로그인</button>
            <div style={{ fontSize: 11.5, color: "var(--text2)", textAlign: "center" }}>
              테스트: admin@its.go.kr / admin123 (관리자)
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-grid">
              <div className="form-group">
                <label>이름 *</label>
                <input type="text" value={form.name} onChange={(e) => up("name", e.target.value)} placeholder="홍길동" />
              </div>
              <div className="form-group">
                <label>소속 *</label>
                <input type="text" value={form.dept} onChange={(e) => up("dept", e.target.value)} placeholder="ITS관리센터" />
              </div>
              <div className="form-group">
                <label>이메일 *</label>
                <input type="email" value={form.email} onChange={(e) => up("email", e.target.value)} placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label>연락처</label>
                <input type="tel" value={form.phone} onChange={(e) => up("phone", e.target.value)} placeholder="010-0000-0000" />
              </div>
            </div>
            <div className="form-group">
              <label>비밀번호 *</label>
              <input type="password" value={form.password} onChange={(e) => up("password", e.target.value)} />
            </div>
            <div className="form-group">
              <label>계정 유형</label>
              <select value={form.role} onChange={(e) => up("role", e.target.value)}>
                <option value="user">사용자</option>
                <option value="admin">관리자</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={doRegister}>회원가입</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: 대시보드
// ════════════════════════════════════════════════════════════════════════════
function Dashboard({ faults, setPage, setFaultFilter }) {
  const counts = {
    all: faults.length,
    "접수": faults.filter((f) => f.status === "접수").length,
    "처리중": faults.filter((f) => f.status === "처리중").length,
    "완료": faults.filter((f) => f.status === "완료").length,
  };

  const goFilter = (filter) => {
    setFaultFilter(filter);
    setPage("fault-list");
  };

  const recent = [...faults].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div>
      <div className="stat-grid">
        {[
          { key: "all", label: "전체", cls: "all", icon: "📋", color: "#0072FF" },
          { key: "접수", label: "접수 대기", cls: "pending", icon: "⏳", color: "#F59E0B" },
          { key: "처리중", label: "처리 중", cls: "processing", icon: "🔧", color: "#3B82F6" },
          { key: "완료", label: "처리 완료", cls: "done", icon: "✅", color: "#10B981" },
        ].map((s) => (
          <div key={s.key} className={`stat-card ${s.cls}`} onClick={() => goFilter(s.key === "all" ? "" : s.key)}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{counts[s.key] ?? counts.all}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">최근 장애 이력</span>
          <button className="btn btn-secondary btn-sm" onClick={() => goFilter("")}>전체 보기</button>
        </div>
        <div className="table-wrap">
          {recent.length === 0 ? (
            <div className="empty-state"><div className="icon">📭</div><p>등록된 장애 이력이 없습니다.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>날짜</th><th>소속</th><th>신청인</th><th>주소</th><th>고장증상</th><th>처리상태</th><th>AS담당자</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((f) => (
                  <tr key={f.id} onClick={() => { setFaultFilter(""); setPage("fault-list"); }}>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{fmtDate(f.date)}</td>
                    <td>{f.dept}</td>
                    <td style={{ fontWeight: 600 }}>{f.applicant}</td>
                    <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.address}</td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.symptom}</td>
                    <td><StatusBadge status={f.status} /></td>
                    <td>{f.asName || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: 장애신청 (등록 / 수정)
// ════════════════════════════════════════════════════════════════════════════
function FaultForm({ faults, setFaults, facilities, editFault, setEditFault, setPage, currentUser }) {
  const isEdit = !!editFault;
  const blank = { date: today(), dept: currentUser?.dept || "", applicant: currentUser?.name || "", phone: currentUser?.phone || "", address: "", symptom: "", status: "접수", asName: "", processNote: "", processDate: "", equipId: "", photos: [] };
  const [form, setForm] = useState(isEdit ? { ...editFault } : blank);
  const [showAddrPopup, setShowAddrPopup] = useState(false);
  const [showEquipPopup, setShowEquipPopup] = useState(false);
  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const needsAS = form.status === "처리중" || form.status === "완료";
  const needsPhoto = form.status === "접수" || form.status === "완료";

  const save = () => {
    if (!form.date || !form.dept || !form.applicant || !form.address || !form.symptom) {
      toast("필수 항목을 모두 입력하세요.", "error"); return;
    }
    if (isEdit) {
      setFaults((prev) => prev.map((f) => (f.id === editFault.id ? { ...form, id: editFault.id } : f)));
      toast("장애 내역이 수정되었습니다.", "success");
      setEditFault(null);
    } else {
      setFaults((prev) => [...prev, { ...form, id: genId() }]);
      toast("장애 신청이 등록되었습니다.", "success");
    }
    setPage("fault-list");
  };

  const cancel = () => { setEditFault(null); setPage("fault-list"); };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{isEdit ? "✏️ 장애 내역 수정" : "📝 장애 신청 등록"}</span>
        {isEdit && <button className="btn btn-secondary btn-sm" onClick={cancel}>취소</button>}
      </div>
      <div className="card-body">
        <div className="form-grid">
          <DatePicker label="신청일 *" value={form.date} onChange={(v) => up("date", v)} />
          <div className="form-group">
            <label>소속 *</label>
            <input type="text" value={form.dept} onChange={(e) => up("dept", e.target.value)} placeholder="소속 부서/기관명" />
          </div>
          <div className="form-group">
            <label>신청인 *</label>
            <input type="text" value={form.applicant} onChange={(e) => up("applicant", e.target.value)} />
          </div>
          <div className="form-group">
            <label>연락처</label>
            <input type="tel" value={form.phone} onChange={(e) => up("phone", e.target.value)} placeholder="010-0000-0000" />
          </div>
        </div>

        <div className="section-divider"><div className="divider-line" /><span>장비 / 주소</span><div className="divider-line" /></div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>주소 *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" value={form.address} onChange={(e) => up("address", e.target.value)} placeholder="시설 주소 입력" style={{ flex: 1 }} />
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddrPopup(true)}>📍 주소검색</button>
          </div>
        </div>

        {needsAS && (
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>장비 ID</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" value={form.equipId} onChange={(e) => up("equipId", e.target.value)} placeholder="장비 ID" style={{ flex: 1 }} />
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEquipPopup(true)}>🔎 장비ID검색</button>
            </div>
          </div>
        )}

        <div className="section-divider"><div className="divider-line" /><span>고장 정보</span><div className="divider-line" /></div>

        <div className="form-grid">
          <div className="form-group">
            <label>처리상태</label>
            <select value={form.status} onChange={(e) => up("status", e.target.value)}>
              <option>접수</option>
              <option>처리중</option>
              <option>완료</option>
            </select>
          </div>
          <div className="form-group" />
          <div className="form-group full">
            <label>고장증상 *</label>
            <textarea value={form.symptom} onChange={(e) => up("symptom", e.target.value)} placeholder="현장 장비의 고장 상태를 상세히 기입하세요. (예: CCTV 영상 미수신, 검지 오류, LED 소등 등)" rows={3} />
          </div>
        </div>

        {needsAS && (
          <>
            <div className="section-divider"><div className="divider-line" /><span>AS 처리 정보</span><div className="divider-line" /></div>
            <div className="form-grid">
              <div className="form-group">
                <label>AS 담당자 이름</label>
                <input type="text" value={form.asName} onChange={(e) => up("asName", e.target.value)} placeholder="담당자 이름" />
              </div>
              <DatePicker label="처리일" value={form.processDate} onChange={(v) => up("processDate", v)} />
              <div className="form-group full">
                <label>처리 내용</label>
                <textarea value={form.processNote} onChange={(e) => up("processNote", e.target.value)} placeholder="처리 내용 상세 입력" rows={3} />
              </div>
            </div>
          </>
        )}

        {needsPhoto && (
          <>
            <div className="section-divider"><div className="divider-line" /><span>사진 첨부</span><div className="divider-line" /></div>
            <PhotoUpload photos={form.photos} setPhotos={(v) => up("photos", typeof v === "function" ? v(form.photos) : v)} label="현장 사진 업로드 (접수 / 완료 사진)" />
          </>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={cancel}>취소</button>
          <button className="btn btn-primary" onClick={save}>💾 {isEdit ? "수정하기" : "등록하기"}</button>
        </div>
      </div>

      {showAddrPopup && (
        <AddressPopup
          facilities={facilities}
          onSelect={(f) => { up("address", f.address); }}
          onClose={() => setShowAddrPopup(false)}
        />
      )}
      {showEquipPopup && (
        <EquipSearchPopup
          facilities={facilities}
          onSelect={(f) => { up("equipId", f.equipId); up("address", f.address); }}
          onClose={() => setShowEquipPopup(false)}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: 장애이력목록
// ════════════════════════════════════════════════════════════════════════════
function FaultList({ faults, setFaults, faultFilter, setFaultFilter, setEditFault, setPage, currentUser }) {
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);

  const filtered = faults.filter((f) => {
    const matchStatus = !faultFilter || f.status === faultFilter;
    const matchQ = !q || [f.applicant, f.dept, f.address, f.symptom, f.asName, f.equipId].some((v) => v?.includes(q));
    return matchStatus && matchQ;
  });

  const del = (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    setFaults((prev) => prev.filter((f) => f.id !== id));
    setDetail(null);
    toast("삭제되었습니다.", "success");
  };

  const edit = (f) => {
    setEditFault(f);
    setPage("fault-form");
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <div className="search-row">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="신청인, 소속, 주소, 증상 검색..." />
            </div>
            <select value={faultFilter} onChange={(e) => setFaultFilter(e.target.value)} style={{ width: 130 }}>
              <option value="">전체 상태</option>
              <option>접수</option>
              <option>처리중</option>
              <option>완료</option>
            </select>
            <button className="btn btn-primary" onClick={() => { setEditFault(null); setPage("fault-form"); }}>+ 장애신청</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">장애 이력 목록 ({filtered.length}건)</span>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="icon">📭</div><p>조건에 맞는 이력이 없습니다.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>날짜</th><th>소속</th><th>신청인</th><th>주소</th><th>고장증상</th><th>처리상태</th><th>AS담당자</th><th>처리일</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} onClick={() => setDetail(f)}>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{fmtDate(f.date)}</td>
                    <td>{f.dept}</td>
                    <td style={{ fontWeight: 600 }}>{f.applicant}</td>
                    <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.address}</td>
                    <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.symptom}</td>
                    <td><StatusBadge status={f.status} /></td>
                    <td>{f.asName || "-"}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{f.processDate ? fmtDate(f.processDate) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 장애 상세 내역</h3>
              <button className="btn-close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[["날짜", fmtDate(detail.date)], ["소속", detail.dept], ["신청인", detail.applicant], ["연락처", detail.phone],
                  ["처리상태", null], ["AS담당자", detail.asName || "-"], ["처리일", detail.processDate ? fmtDate(detail.processDate) : "-"], ["장비ID", detail.equipId || "-"]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 3 }}>{k}</div>
                    {k === "처리상태" ? <StatusBadge status={detail.status} /> : <div style={{ fontSize: 14 }}>{v}</div>}
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>주소</div>
                <div style={{ fontSize: 14 }}>📍 {detail.address}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>고장증상</div>
                <div style={{ fontSize: 14, background: "#F7F9FD", borderRadius: 8, padding: "10px 14px" }}>{detail.symptom}</div>
              </div>
              {detail.processNote && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>처리내용</div>
                  <div style={{ fontSize: 14, background: "#F0FFF4", borderRadius: 8, padding: "10px 14px" }}>{detail.processNote}</div>
                </div>
              )}
              {detail.photos?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 8 }}>첨부 사진 ({detail.photos.length}장)</div>
                  <div className="photo-grid">
                    {detail.photos.map((p) => <img key={p.id} src={p.url} alt={p.name} className="photo-thumb" style={{ width: 100, height: 100 }} />)}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger btn-sm" onClick={() => del(detail.id)}>🗑 삭제</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { edit(detail); setDetail(null); }}>✏️ 수정</button>
              <button className="btn btn-secondary" onClick={() => setDetail(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: 시설정보 등록
// ════════════════════════════════════════════════════════════════════════════
function FacilityForm({ facilities, setFacilities, editFacility, setEditFacility, setPage }) {
  const isEdit = !!editFacility;
  const blank = { projectName: "", equipName: "", address: "", mileage: "", equipId: "", ip: "", gateway: "", subnet: "", note: "", photos: [] };
  const [form, setForm] = useState(isEdit ? { ...editFacility } : blank);
  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.projectName || !form.equipName || !form.address || !form.equipId) {
      toast("필수 항목(사업명, 장비명, 주소, 장비ID)을 입력하세요.", "error"); return;
    }
    if (isEdit) {
      setFacilities((prev) => prev.map((f) => (f.id === editFacility.id ? { ...form, id: editFacility.id } : f)));
      toast("시설 정보가 수정되었습니다.", "success");
      setEditFacility(null);
    } else {
      setFacilities((prev) => [...prev, { ...form, id: genId() }]);
      toast("시설 정보가 등록되었습니다.", "success");
    }
    setPage("facility-list");
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{isEdit ? "✏️ 시설 정보 수정" : "🏗 시설 정보 등록"}</span>
      </div>
      <div className="card-body">
        <div className="section-divider"><div className="divider-line" /><span>기본 정보</span><div className="divider-line" /></div>
        <div className="form-grid" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>사업명 *</label>
            <input type="text" value={form.projectName} onChange={(e) => up("projectName", e.target.value)} placeholder="국도OO호선 ITS 구축 사업" />
          </div>
          <div className="form-group">
            <label>장비명 *</label>
            <input type="text" value={form.equipName} onChange={(e) => up("equipName", e.target.value)} placeholder="VDS, CCTV, VMS, RSE 등" />
          </div>
          <div className="form-group full">
            <label>주소 *</label>
            <input type="text" value={form.address} onChange={(e) => up("address", e.target.value)} placeholder="설치 주소" />
          </div>
          <div className="form-group">
            <label>이정(km)</label>
            <input type="text" value={form.mileage} onChange={(e) => up("mileage", e.target.value)} placeholder="32.5" />
          </div>
          <div className="form-group">
            <label>비고</label>
            <input type="text" value={form.note} onChange={(e) => up("note", e.target.value)} placeholder="설치 위치 특이사항" />
          </div>
        </div>

        <div className="section-divider"><div className="divider-line" /><span>장비 수용 정보</span><div className="divider-line" /></div>
        <div className="form-grid-3" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>장비 ID *</label>
            <input type="text" value={form.equipId} onChange={(e) => up("equipId", e.target.value)} placeholder="ITS-VDS-001" />
          </div>
          <div className="form-group">
            <label>IP 주소</label>
            <input type="text" value={form.ip} onChange={(e) => up("ip", e.target.value)} placeholder="192.168.1.101" />
          </div>
          <div className="form-group">
            <label>게이트웨이</label>
            <input type="text" value={form.gateway} onChange={(e) => up("gateway", e.target.value)} placeholder="192.168.1.1" />
          </div>
          <div className="form-group">
            <label>서브넷 마스크</label>
            <input type="text" value={form.subnet} onChange={(e) => up("subnet", e.target.value)} placeholder="255.255.255.0" />
          </div>
        </div>

        <div className="section-divider"><div className="divider-line" /><span>전경 사진</span><div className="divider-line" /></div>
        <PhotoUpload photos={form.photos} setPhotos={(v) => up("photos", typeof v === "function" ? v(form.photos) : v)} label="전경 사진 업로드" />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={() => { setEditFacility(null); setPage("facility-list"); }}>취소</button>
          <button className="btn btn-primary" onClick={save}>💾 {isEdit ? "수정하기" : "등록하기"}</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: 시설관리현황
// ════════════════════════════════════════════════════════════════════════════
function FacilityList({ facilities, setFacilities, faults, setEditFacility, setPage }) {
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);
  const [faultPopup, setFaultPopup] = useState(null);
  const [faultQ, setFaultQ] = useState("");
  const [faultDateFrom, setFaultDateFrom] = useState("");
  const [faultDateTo, setFaultDateTo] = useState("");

  const filtered = facilities.filter(
    (f) => !q || [f.equipId, f.equipName, f.projectName, f.address, f.ip].some((v) => v?.includes(q))
  );

  const del = (id) => {
    if (!window.confirm("시설 정보를 삭제하시겠습니까?")) return;
    setFacilities((prev) => prev.filter((f) => f.id !== id));
    setDetail(null);
    toast("삭제되었습니다.", "success");
  };

  // Excel export (CSV fallback)
  const exportExcel = () => {
    const headers = ["장비ID", "사업명", "장비명", "주소", "이정", "IP", "게이트웨이", "서브넷마스크", "비고"];
    const rows = filtered.map((f) => [f.equipId, f.projectName, f.equipName, f.address, f.mileage, f.ip, f.gateway, f.subnet, f.note]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `시설관리현황_${today()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast("엑셀 파일이 저장되었습니다.", "success");
  };

  const openFaultPopup = (facility) => {
    setFaultPopup(facility);
    setFaultQ(""); setFaultDateFrom(""); setFaultDateTo("");
  };

  const faultFiltered = faultPopup
    ? faults.filter((f) => {
        const matchEquip = f.equipId === faultPopup.equipId || f.address === faultPopup.address;
        const matchQ = !faultQ || [f.applicant, f.symptom, f.asName, f.equipId].some((v) => v?.includes(faultQ));
        const matchFrom = !faultDateFrom || f.date >= faultDateFrom;
        const matchTo = !faultDateTo || f.date <= faultDateTo;
        return matchEquip && matchQ && matchFrom && matchTo;
      })
    : [];

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <div className="search-row">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="장비ID, 장비명, 주소, IP 검색..." />
            </div>
            <button className="btn btn-excel btn-sm" onClick={exportExcel}>📊 엑셀 출력</button>
            <button className="btn btn-primary" onClick={() => { setEditFacility(null); setPage("facility-form"); }}>+ 시설 등록</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">시설 관리 현황 ({filtered.length}건)</span>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="icon">🏗</div><p>등록된 시설이 없습니다.</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>장비ID</th><th>사업명</th><th>장비명</th><th>주소</th><th>이정</th><th>IP</th><th>장애이력</th></tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const faultCount = faults.filter((fa) => fa.equipId === f.equipId || fa.address === f.address).length;
                  return (
                    <tr key={f.id} onClick={() => setDetail(f)}>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600 }}>{f.equipId}</td>
                      <td>{f.projectName}</td>
                      <td>{f.equipName}</td>
                      <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.address}</td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{f.mileage}</td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{f.ip}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); openFaultPopup(f); }}>
                          📋 {faultCount}건
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏗 시설 정보 상세</h3>
              <button className="btn-close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                {[["장비ID", detail.equipId], ["장비명", detail.equipName], ["사업명", detail.projectName], ["이정", detail.mileage],
                  ["IP", detail.ip], ["게이트웨이", detail.gateway], ["서브넷마스크", detail.subnet], ["비고", detail.note]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13, fontFamily: ["IP", "게이트웨이", "서브넷마스크", "장비ID"].includes(k) ? "var(--mono)" : "inherit" }}>{v || "-"}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>주소</div>
                <div>📍 {detail.address}</div>
              </div>
              {detail.photos?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 8 }}>전경 사진</div>
                  <div className="photo-grid">
                    {detail.photos.map((p) => <img key={p.id} src={p.url} alt="" className="photo-thumb" style={{ width: 110, height: 90 }} />)}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger btn-sm" onClick={() => del(detail.id)}>🗑 삭제</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setEditFacility(detail); setDetail(null); setPage("facility-form"); }}>✏️ 수정</button>
              <button className="btn btn-secondary" onClick={() => setDetail(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* Fault History Popup */}
      {faultPopup && (
        <div className="modal-overlay" onClick={() => setFaultPopup(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 장애 처리 이력 — {faultPopup.equipId}</h3>
              <button className="btn-close" onClick={() => setFaultPopup(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <div className="search-input-wrap" style={{ flex: 1 }}>
                  <span className="search-icon">🔍</span>
                  <input value={faultQ} onChange={(e) => setFaultQ(e.target.value)} placeholder="신청인, 증상, AS담당자 검색..." />
                </div>
                <input type="date" value={faultDateFrom} onChange={(e) => setFaultDateFrom(e.target.value)} style={{ width: 140 }} />
                <span style={{ alignSelf: "center", color: "var(--text2)" }}>~</span>
                <input type="date" value={faultDateTo} onChange={(e) => setFaultDateTo(e.target.value)} style={{ width: 140 }} />
              </div>
              <div className="table-wrap">
                {faultFiltered.length === 0 ? (
                  <div className="empty-state"><p>장애 이력이 없습니다.</p></div>
                ) : (
                  <table>
                    <thead><tr><th>날짜</th><th>신청인</th><th>고장증상</th><th>상태</th><th>AS담당자</th><th>처리일</th></tr></thead>
                    <tbody>
                      {faultFiltered.map((f) => (
                        <tr key={f.id}>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{fmtDate(f.date)}</td>
                          <td>{f.applicant}</td>
                          <td style={{ maxWidth: 200 }}>{f.symptom}</td>
                          <td><StatusBadge status={f.status} /></td>
                          <td>{f.asName || "-"}</td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{f.processDate ? fmtDate(f.processDate) : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setFaultPopup(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: 계정관리
// ════════════════════════════════════════════════════════════════════════════
function AccountManagement({ users, setUsers, currentUser }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", dept: "", phone: "", role: "user" });
  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const add = () => {
    if (!form.name || !form.email || !form.password) { toast("이름, 이메일, 비밀번호는 필수입니다.", "error"); return; }
    if (users.find((u) => u.email === form.email)) { toast("이미 사용 중인 이메일입니다.", "error"); return; }
    setUsers((prev) => [...prev, { id: genId(), ...form }]);
    toast("계정이 등록되었습니다.", "success");
    setShowAdd(false);
    setForm({ name: "", email: "", password: "", dept: "", phone: "", role: "user" });
  };

  const del = (id) => {
    if (id === currentUser.id) { toast("본인 계정은 삭제할 수 없습니다.", "error"); return; }
    if (!window.confirm("계정을 삭제하시겠습니까?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast("계정이 삭제되었습니다.", "success");
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">👥 계정 관리</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ 계정 등록</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>이름</th><th>이메일</th><th>소속</th><th>연락처</th><th>권한</th>{currentUser?.role === "admin" && <th>관리</th>}</tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.dept}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span className="badge" style={{ background: u.role === "admin" ? "#FEE2E2" : "#EEF3FA", color: u.role === "admin" ? "#991B1B" : "var(--text2)" }}>
                      {u.role === "admin" ? "👑 관리자" : "👤 사용자"}
                    </span>
                  </td>
                  {currentUser?.role === "admin" && (
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => del(u.id)} disabled={u.id === currentUser.id}>삭제</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>계정 등록</h3>
              <button className="btn-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="form-grid">
                  <div className="form-group"><label>이름 *</label><input type="text" value={form.name} onChange={(e) => up("name", e.target.value)} /></div>
                  <div className="form-group"><label>소속</label><input type="text" value={form.dept} onChange={(e) => up("dept", e.target.value)} /></div>
                  <div className="form-group"><label>이메일 *</label><input type="email" value={form.email} onChange={(e) => up("email", e.target.value)} /></div>
                  <div className="form-group"><label>연락처</label><input type="tel" value={form.phone} onChange={(e) => up("phone", e.target.value)} /></div>
                </div>
                <div className="form-group"><label>비밀번호 *</label><input type="password" value={form.password} onChange={(e) => up("password", e.target.value)} /></div>
                <div className="form-group"><label>권한</label>
                  <select value={form.role} onChange={(e) => up("role", e.target.value)}>
                    <option value="user">사용자</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>취소</button>
              <button className="btn btn-primary" onClick={add}>등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
const NAV = [
  { id: "dashboard",      label: "대시보드",       icon: "📊", section: "main" },
  { id: "fault-form",     label: "장애 신청",       icon: "📝", section: "main" },
  { id: "fault-list",     label: "장애이력목록",     icon: "📋", section: "main" },
  { id: "facility-form",  label: "시설정보 등록",    icon: "🏗",  section: "facility" },
  { id: "facility-list",  label: "시설관리현황",     icon: "🗺",  section: "facility" },
  { id: "account",        label: "계정 관리",        icon: "👥", section: "settings" },
];

export default function App() {
  // Inject styles
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_STYLE;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [faultFilter, setFaultFilter] = useState("");
  const [editFault, setEditFault] = useState(null);
  const [editFacility, setEditFacility] = useState(null);

  // Data stores (in real deployment: sync with Firestore)
  const [users, setUsers] = useState([
    ...INIT_USERS,
    { id: "u1", name: "관리자", email: "admin@its.go.kr", password: "admin123", role: "admin", dept: "ITS관리센터", phone: "02-1234-5678" },
    { id: "u2", name: "홍길동", email: "hong@its.go.kr", password: "user123", role: "user", dept: "현장운영팀", phone: "010-1111-2222" },
  ]);
  const [faults, setFaults] = useState(INIT_FAULTS);
  const [facilities, setFacilities] = useState(INIT_FACILITIES);

  const pageTitles = {
    dashboard:      "📊 대시보드",
    "fault-form":   editFault ? "✏️ 장애 내역 수정" : "📝 장애 신청",
    "fault-list":   "📋 장애이력목록",
    "facility-form": editFacility ? "✏️ 시설정보 수정" : "🏗 시설정보 등록",
    "facility-list": "🗺 시설관리현황",
    account:        "👥 계정 관리",
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage users={users} setUsers={setUsers} onLogin={setCurrentUser} />
        <ToastArea />
      </>
    );
  }

  const sections = { main: "메인 메뉴", facility: "시설 관리", settings: "설정" };

  return (
    <>
      <div className="app-shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>장애관리시스템</h1>
            <p>FaultManagementSystem v3</p>
          </div>

          {Object.entries(sections).map(([sec, secLabel]) => (
            <div key={sec} className="sidebar-section">
              <div className="sidebar-label">{secLabel}</div>
              {NAV.filter((n) => n.section === sec).map((n) => (
                <div
                  key={n.id}
                  className={`nav-item ${page === n.id ? "active" : ""}`}
                  onClick={() => { setPage(n.id); if (n.id !== "fault-form") setEditFault(null); if (n.id !== "facility-form") setEditFacility(null); }}
                >
                  <span className="icon">{n.icon}</span>
                  {n.label}
                </div>
              ))}
            </div>
          ))}

          <div style={{ flex: 1 }} />
          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
              {currentUser.role === "admin" ? "👑 관리자" : "👤 사용자"}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{currentUser.dept}</div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 10, width: "100%", justifyContent: "center" }}
              onClick={() => setCurrentUser(null)}
            >🚪 로그아웃</button>
          </div>
        </aside>

        {/* Main */}
        <div className="main-area">
          <div className="topbar">
            <div className="topbar-title">{pageTitles[page]}</div>
            <div className="topbar-user">
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{currentUser.name}</div>
                <div style={{ fontSize: 11, color: "var(--text2)" }}>{currentUser.email}</div>
              </div>
              <div className="avatar">{currentUser.name[0]}</div>
            </div>
          </div>

          <div className="page-content">
            {/* Firebase 연동 안내 배너 */}
            <div style={{ background: "linear-gradient(135deg, #0B1D3A, #122448)", borderRadius: 10, padding: "10px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <div style={{ flex: 1 }}>
                <span style={{ color: "#00C6FF", fontWeight: 700, fontSize: 12 }}>Firebase 연동 준비 완료</span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginLeft: 10 }}>
                  Project: fmsver3 | Region: asia-southeast1 | Firestore + Storage 연동 시 실시간 동기화
                </span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "var(--mono)" }}>{FIREBASE_CONFIG.projectId}</span>
            </div>

            {page === "dashboard" && <Dashboard faults={faults} setPage={setPage} setFaultFilter={setFaultFilter} />}
            {page === "fault-form" && (
              <FaultForm faults={faults} setFaults={setFaults} facilities={facilities} editFault={editFault} setEditFault={setEditFault} setPage={setPage} currentUser={currentUser} />
            )}
            {page === "fault-list" && (
              <FaultList faults={faults} setFaults={setFaults} faultFilter={faultFilter} setFaultFilter={setFaultFilter} setEditFault={setEditFault} setPage={setPage} currentUser={currentUser} />
            )}
            {page === "facility-form" && (
              <FacilityForm facilities={facilities} setFacilities={setFacilities} editFacility={editFacility} setEditFacility={setEditFacility} setPage={setPage} />
            )}
            {page === "facility-list" && (
              <FacilityList facilities={facilities} setFacilities={setFacilities} faults={faults} setEditFacility={setEditFacility} setPage={setPage} />
            )}
            {page === "account" && (
              <AccountManagement users={users} setUsers={setUsers} currentUser={currentUser} />
            )}
          </div>
        </div>
      </div>
      <ToastArea />
    </>
  );
}
