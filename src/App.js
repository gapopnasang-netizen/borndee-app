import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  // Auth States
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [loading, setLoading] = useState(false);

  // Login Form
  const [loginForm, setLoginForm] = useState({ username: 'agent01', password: '123456' });

  // Member States
  const [selectedCategory, setSelectedCategory] = useState('หวยลาว');
  const [summary, setSummary] = useState(null);
  const [inputNumber, setInputNumber] = useState('');
  const [topAmount, setTopAmount] = useState('');
  const [todAmount, setTodAmount] = useState('');
  const [keyMode, setKeyMode] = useState('normal'); 
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [slipFile, setSlipFile] = useState(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ show: false, items: [], total: 0 });

  // Agent States
  const [agentOverview, setAgentOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('finance');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Agent Create Member Form (ฟอร์มสมัครสมาชิกโดย Agent)
  const [agentRegForm, setAgentRegForm] = useState({ username: '', password: '', fullName: '', bankName: 'กสิกรไทย', bankAccount: '', initialCredit: 0 });

  // Agent Sub-forms
  const [blockCategory, setBlockCategory] = useState('หวยลาว');
  const [blockNum, setBlockNum] = useState('');
  const [blockType, setBlockType] = useState('ALL');
  const [payoutRate, setPayoutRate] = useState('');
  const [payoutType, setPayoutType] = useState('3ตัวบน');
  
  // Draw Result Form
  const [resultCategory, setResultCategory] = useState('หวยลาว');
  const [resultTop3, setResultTop3] = useState('');
  const [resultBottom2, setResultBottom2] = useState('');

  // Credit Edit Form
  const [targetUsername, setTargetUsername] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditAction, setCreditAction] = useState('ADD');

  useEffect(() => {
    if (token) {
      const timer = setInterval(() => {
        if (user?.role === 'member') fetchMemberData();
        if (user?.role === 'agent') fetchAgentOverview();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      if (user?.role === 'member') fetchMemberData();
      if (user?.role === 'agent') fetchAgentOverview();
    }
  }, [token]);

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token); setUser(data.user);
      } else alert(data.message);
    } catch (err) { alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); setToken(''); setUser(null); };

  // Agent Creates Member Account
  const handleAgentRegisterMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/agent/create-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(agentRegForm)
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) {
        setAgentRegForm({ username: '', password: '', fullName: '', bankName: 'กสิกรไทย', bankAccount: '', initialCredit: 0 });
        fetchAgentOverview();
      }
    } catch (err) { alert('เกิดข้อผิดพลาดในการสร้างบัญชี'); }
    finally { setLoading(false); }
  };

  // Fetching Data
  const fetchMemberData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/member/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSummary(data);
    } catch (err) { console.error(err); }
  };

  const fetchAgentOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/agent/overview`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAgentOverview(data);
    } catch (err) { console.error(err); }
  };

  // Helper Functions
  const getPermutations = (str) => {
    if (str.length <= 1) return [str];
    let permutations = [];
    for (let i = 0; i < str.length; i++) {
      let char = str[i];
      let remainingChars = str.slice(0, i) + str.slice(i + 1);
      for (let subPerm of getPermutations(remainingChars)) {
        permutations.push(char + subPerm);
      }
    }
    return Array.from(new Set(permutations));
  };

  // Pre-Submit Ticket Check
  const handlePrepareTicket = (e) => {
    e.preventDefault();
    if (!inputNumber) return alert('กรุณากรอกตัวเลข');
    if (!topAmount && !todAmount) return alert('กรุณากรอกจำนวนเงิน');

    let items = [];
    if (keyMode === 'door19' && inputNumber.length === 1) {
      let nums = [];
      for (let i = 0; i <= 9; i++) {
        nums.push(`${inputNumber}${i}`);
        if (i.toString() !== inputNumber) nums.push(`${i}${inputNumber}`);
      }
      Array.from(new Set(nums)).forEach(n => {
        if (topAmount) items.push({ type: '2ตัวบน', number: n, amount: parseInt(topAmount) });
        if (todAmount) items.push({ type: '2ตัวล่าง', number: n, amount: parseInt(todAmount) });
      });
    } else if (keyMode === 'reverse6' && inputNumber.length === 3) {
      const perms = getPermutations(inputNumber);
      perms.forEach(n => {
        if (topAmount) items.push({ type: '3ตัวบน', number: n, amount: parseInt(topAmount) });
      });
    } else if (keyMode === 'runner' && inputNumber.length === 1) {
      if (topAmount) items.push({ type: 'วิ่งบน', number: inputNumber, amount: parseInt(topAmount) });
      if (todAmount) items.push({ type: 'วิ่งล่าง', number: inputNumber, amount: parseInt(todAmount) });
    } else {
      if (topAmount) items.push({ type: inputNumber.length === 3 ? '3ตัวบน' : '2ตัวบน', number: inputNumber, amount: parseInt(topAmount) });
      if (todAmount) items.push({ type: inputNumber.length === 3 ? '3ตัวโต๊ด' : '2ตัวล่าง', number: inputNumber, amount: parseInt(todAmount) });
    }

    if (items.length === 0) return alert('รูปแบบตัวเลขหรือยอดเงินไม่ถูกต้อง');

    const totalCost = items.reduce((sum, item) => sum + item.amount, 0);
    if ((summary?.user?.credit || 0) < totalCost) {
      return alert(`เครดิตไม่พอ! ยอดรวม ${totalCost} ฿ (เครดิตคงเหลือ ${summary?.user?.credit || 0} ฿)`);
    }

    setConfirmModal({ show: true, items, total: totalCost });
  };

  const handleConfirmBuyTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tickets/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category: selectedCategory, items: confirmModal.items })
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) {
        setInputNumber(''); setTopAmount(''); setTodAmount('');
        setConfirmModal({ show: false, items: [], total: 0 });
        fetchMemberData();
      }
    } catch (err) { alert('เกิดข้อผิดพลาดในการทำรายการ'); }
    finally { setLoading(false); }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', depositAmount);
      if (slipFile) formData.append('slip', slipFile);

      const res = await fetch(`${API_BASE}/api/deposit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) { setDepositAmount(''); setSlipFile(null); fetchMemberData(); }
    } catch (err) { alert('เกิดข้อผิดพลาดในการฝากเงิน'); }
    finally { setLoading(false); }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (parseFloat(withdrawAmount) > (summary?.user?.credit || 0)) {
      return alert('ยอดเงินคงเหลือไม่พอสำหรับการถอน');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount) })
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) { setWithdrawAmount(''); fetchMemberData(); }
    } catch (err) { alert('เกิดข้อผิดพลาดในการถอนเงิน'); }
    finally { setLoading(false); }
  };

  const handleProcessDrawResult = async (e) => {
    e.preventDefault();
    if (!window.confirm(`ยืนยันการออกรางวัล ${resultCategory} [บน: ${resultTop3} | ล่าง: ${resultBottom2}] และคำนวณเงินออโต้หรือไม่?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category: resultCategory, top3: resultTop3, bottom2: resultBottom2 })
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) { setResultTop3(''); setResultBottom2(''); fetchAgentOverview(); }
    } catch (err) { alert('เกิดข้อผิดพลาดในการออกรางวัล'); }
    finally { setLoading(false); }
  };

  const handleAdjustCredit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/agent/adjust-credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: targetUsername, amount: parseFloat(creditAmount), action: creditAction })
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) { setTargetUsername(''); setCreditAmount(''); fetchAgentOverview(); }
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const handleBlockNumber = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/agent/closed-numbers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category: blockCategory, number: blockNum, type: blockType })
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) { setBlockNum(''); fetchAgentOverview(); }
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const handleDeleteClosedNumber = async (id) => {
    if (!window.confirm('ต้องการปลดบล็อกเลขอั้นนี้หรือไม่?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/agent/closed-numbers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) fetchAgentOverview();
    } catch (err) { alert('เกิดข้อผิดพลาด'); }
  };

  // UI Styles
  const darkCard = { background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '20px', color: '#e0e0e0', marginBottom: '20px' };
  const goldHeader = { color: '#fadb14', textShadow: '0 0 8px rgba(250,219,20,0.3)', margin: '0 0 15px 0' };
  const goldBtn = { background: 'linear-gradient(180deg, #ffd666 0%, #d4b106 100%)', color: '#000', fontWeight: 'bold', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' };
  const inputStyle = { padding: '12px', background: '#262626', border: '1px solid #434343', color: '#fff', borderRadius: '6px', width: '100%', boxSizing: 'border-box' };
  const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };

  // LOGIN SCREEN ONLY (ไม่มีปุ่ม/หน้าสมัครสมาชิก)
  if (!token) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ ...darkCard, width: '380px', borderColor: '#d4b106', boxShadow: '0 0 20px rgba(212,177,6,0.2)' }}>
          <h2 style={{ ...goldHeader, textAlign: 'center', letterSpacing: '1px' }}>👑 BORNDEE (เกิดดี)</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Username" value={loginForm.username} onChange={e=>setLoginForm({...loginForm, username: e.target.value})} style={inputStyle} required />
            <input type="password" placeholder="Password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} required />
            <button type="submit" style={{ ...goldBtn, marginTop: '10px' }} disabled={loading}>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ BORNDEE'}</button>
          </form>
          <p style={{ color: '#666', textAlign: 'center', fontSize: '12px', marginTop: '15px' }}>* หากยังไม่มีบัญชี กรุณาติดต่อ Agent เพื่อสมัครสมาชิก</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100vh', color: '#e0e0e0', fontFamily: 'sans-serif', padding: '20px 10px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* TOP BAR */}
        <div style={{ ...darkCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: '#d4b106' }}>
          <div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fadb14' }}>👑 BORNDEE (เกิดดี)</span>
            <span style={{ marginLeft: '15px', color: '#8c8c8c' }}>ผู้ใช้งาน: {user?.username} ({user?.role?.toUpperCase()})</span>
          </div>
          <button onClick={handleLogout} style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>ออกจากระบบ</button>
        </div>

        {/* MEMBER INTERFACE */}
        {user?.role === 'member' && summary && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {['หวยลาว', 'หวยรัฐบาล', 'หวยฮานอย'].map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                  flex: 1, padding: '14px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: selectedCategory === cat ? 'linear-gradient(180deg, #ffd666 0%, #d4b106 100%)' : '#262626',
                  color: selectedCategory === cat ? '#000' : '#8c8c8c'
                }}>
                  🇹🇭 {cat} <small style={{ display: 'block', fontSize: '11px', fontWeight: 'normal' }}>ปิดรับ {summary?.cutoffTimes?.[cat] || '-'}</small>
                </button>
              ))}
            </div>

            <div style={{ ...darkCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <small style={{ color: '#8c8c8c' }}>ยอดเครดิตคงเหลือ</small>
                <h1 style={{ margin: 0, color: '#52c41a' }}>{(summary?.user?.credit || 0).toLocaleString()} ฿</h1>
              </div>
              <small style={{ color: '#8c8c8c' }}>ผูกบัญชี: {summary?.user?.bankName} ({summary?.user?.bankAccount})</small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={darkCard}>
                <h3 style={goldHeader}>💳 ฝากเงิน (ออโต้สแกนสลิป)</h3>
                <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="number" placeholder="จำนวนเงิน" value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} style={inputStyle} required />
                  <input type="file" accept="image/*" onChange={e=>setSlipFile(e.target.files[0])} style={{ color: '#fff' }} />
                  <button type="submit" style={goldBtn} disabled={loading}>{loading ? 'กำลังส่งข้อมูล...' : 'แจ้งฝากเงิน'}</button>
                </form>
              </div>

              <div style={darkCard}>
                <h3 style={goldHeader}>💸 แจ้งถอนเงิน</h3>
                <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="number" placeholder="จำนวนเงินถอน" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} style={inputStyle} required />
                  <button type="submit" style={{ ...goldBtn, background: '#ff4d4f', color: '#fff' }} disabled={loading}>{loading ? 'กำลังถอน...' : 'ถอนเงินเข้าบัญชี'}</button>
                </form>
              </div>
            </div>

            <div style={darkCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ ...goldHeader, margin: 0 }}>🎯 แทงหวย: {selectedCategory}</h3>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[{ id: 'normal', name: 'ปกติ' }, { id: 'door19', name: '19 ประตู' }, { id: 'reverse6', name: '6 กลับ' }, { id: 'runner', name: 'วิ่ง' }].map(m => (
                    <button key={m.id} type="button" onClick={()=>setKeyMode(m.id)} style={{ padding: '6px 10px', background: keyMode===m.id?'#d4b106':'#262626', color: keyMode===m.id?'#000':'#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{m.name}</button>
                  ))}
                </div>
              </div>

              <form onSubmit={handlePrepareTicket} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px' }}>
                <input type="text" placeholder={keyMode==='reverse6'?'เลข 3 ตัว':(keyMode==='door19'||keyMode==='runner'?'เลข 1 ตัว':'ตัวเลข')} value={inputNumber} onChange={e=>setInputNumber(e.target.value)} style={inputStyle} required />
                <input type="number" placeholder="ยอดบน" value={topAmount} onChange={e=>setTopAmount(e.target.value)} style={inputStyle} />
                <input type="number" placeholder="ยอดโต๊ด/ล่าง" value={todAmount} onChange={e=>setTodAmount(e.target.value)} style={inputStyle} disabled={keyMode==='reverse6'} />
                <button type="submit" style={goldBtn}>ตรวจสอบโพย</button>
              </form>
            </div>

            <div style={darkCard}>
              <h3 style={goldHeader}>📋 ประวัติโพยล่าสุด</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333', color: '#8c8c8c' }}>
                    <th style={{ padding: '10px' }}>หวย</th>
                    <th style={{ padding: '10px' }}>ประเภท</th>
                    <th style={{ padding: '10px' }}>เลข</th>
                    <th style={{ padding: '10px' }}>ยอดแทง</th>
                    <th style={{ padding: '10px' }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.tickets || []).map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #262626' }}>
                      <td style={{ padding: '10px' }}>{t.category}</td>
                      <td style={{ padding: '10px' }}>{t.type}</td>
                      <td style={{ padding: '10px', color: '#fadb14', fontWeight: 'bold' }}>{t.number}</td>
                      <td style={{ padding: '10px' }}>{t.netAmount} ฿</td>
                      <td style={{ padding: '10px', color: t.status?.includes('ถูกรางวัล') ? '#52c41a' : '#8c8c8c' }}>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AGENT FULL INTERFACE */}
        {user?.role === 'agent' && (
          <div>
            {/* SUMMARY OVERVIEW DASHBOARD */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ ...darkCard, marginBottom: 0, textAlign: 'center' }}>
                <small style={{ color: '#8c8c8c' }}>ยอดขายรวม BORNDEE</small>
                <h2 style={{ margin: '5px 0 0 0', color: '#1890ff' }}>{(agentOverview?.summary?.totalSales || 0).toLocaleString()} ฿</h2>
              </div>
              <div style={{ ...darkCard, marginBottom: 0, textAlign: 'center' }}>
                <small style={{ color: '#8c8c8c' }}>ยอดถูกรางวัลรวม</small>
                <h2 style={{ margin: '5px 0 0 0', color: '#ff4d4f' }}>{(agentOverview?.summary?.totalPayout || 0).toLocaleString()} ฿</h2>
              </div>
              <div style={{ ...darkCard, marginBottom: 0, textAlign: 'center' }}>
                <small style={{ color: '#8c8c8c' }}>กำไรสุทธิ</small>
                <h2 style={{ margin: '5px 0 0 0', color: (agentOverview?.summary?.netProfit || 0) >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  {(agentOverview?.summary?.netProfit || 0).toLocaleString()} ฿
                </h2>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {[
                { id: 'finance', name: '💰 ฝาก-ถอนเงิน' },
                { id: 'result', name: '🏆 ออกรางวัล & คำนวณเงิน' },
                { id: 'block', name: '🚫 อายัดเลข & อัตราจ่าย' },
                { id: 'member', name: '👥 สมัครสมาชิก & เครดิต' }
              ].map(tab => (
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                  flex: 1, padding: '12px', fontSize: '15px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer',
                  background: activeTab === tab.id ? 'linear-gradient(180deg, #ffd666 0%, #d4b106 100%)' : '#1a1a1a',
                  color: activeTab === tab.id ? '#000' : '#8c8c8c',
                  border: activeTab === tab.id ? 'none' : '1px solid #333'
                }}>
                  {tab.name}
                </button>
              ))}
            </div>

            {/* TAB 1: FINANCE */}
            {activeTab === 'finance' && (
              <div>
                <div style={darkCard}>
                  <h3 style={goldHeader}>📥 รายการฝากเงิน (รอตรวจสลิป)</h3>
                  {(agentOverview?.deposits || []).length === 0 ? <p style={{ color: '#8c8c8c' }}>ไม่มีรายการฝากเงินรออนุมัติ</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #333', color: '#8c8c8c' }}>
                          <th style={{ padding: '10px' }}>สมาชิก</th>
                          <th style={{ padding: '10px' }}>จำนวนเงิน</th>
                          <th style={{ padding: '10px' }}>สลิป</th>
                          <th style={{ padding: '10px' }}>จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(agentOverview?.deposits || []).map(d => (
                          <tr key={d.id} style={{ borderBottom: '1px solid #262626' }}>
                            <td style={{ padding: '10px' }}>{d.username}</td>
                            <td style={{ padding: '10px', color: '#52c41a', fontWeight: 'bold' }}>{d.amount} ฿</td>
                            <td style={{ padding: '10px' }}>
                              {d.slipUrl ? <a href={`${API_BASE}${d.slipUrl}`} target="_blank" rel="noreferrer" style={{ color: '#1890ff' }}>ดูสลิป</a> : 'ไม่มีสลิป'}
                            </td>
                            <td style={{ padding: '10px' }}>
                              <button onClick={async () => {
                                const res = await fetch(`${API_BASE}/api/agent/approve-deposit`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ depositId: d.id, userId: d.userId, amount: d.amount })
                                });
                                const data = await res.json();
                                alert(data.message);
                                fetchAgentOverview();
                              }} style={{ background: '#52c41a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>อนุมัติเติมเงิน</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={darkCard}>
                  <h3 style={goldHeader}>📤 รายการถอนเงิน (รออนุมัติโอน)</h3>
                  {(agentOverview?.withdrawals || []).length === 0 ? <p style={{ color: '#8c8c8c' }}>ไม่มีรายการถอนเงินรออนุมัติ</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #333', color: '#8c8c8c' }}>
                          <th style={{ padding: '10px' }}>สมาชิก</th>
                          <th style={{ padding: '10px' }}>จำนวนเงิน</th>
                          <th style={{ padding: '10px' }}>บัญชีรับเงิน</th>
                          <th style={{ padding: '10px' }}>จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(agentOverview?.withdrawals || []).map(w => (
                          <tr key={w.id} style={{ borderBottom: '1px solid #262626' }}>
                            <td style={{ padding: '10px' }}>{w.username} ({w.fullName})</td>
                            <td style={{ padding: '10px', color: '#ff4d4f', fontWeight: 'bold' }}>{w.amount} ฿</td>
                            <td style={{ padding: '10px' }}>{w.bankName} {w.bankAccount}</td>
                            <td style={{ padding: '10px' }}>
                              <button onClick={async () => {
                                const res = await fetch(`${API_BASE}/api/agent/approve-withdraw`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ withdrawId: w.id })
                                });
                                const data = await res.json();
                                alert(data.message);
                                fetchAgentOverview();
                              }} style={{ background: '#52c41a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>อนุมัติโอนแล้ว</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: DRAW RESULT */}
            {activeTab === 'result' && (
              <div style={darkCard}>
                <h3 style={goldHeader}>🏆 ตรวจรางวัล & คำนวณยอดออโต้</h3>
                <p style={{ color: '#8c8c8c', fontSize: '13px' }}>* เมื่อกรอกผลรางวัลและกดบันทึก ระบบจะเช็กโพยสมาชิกทั้งหมดในงวดนั้น และคำนวณโอนเงินรางวัลเข้ากระเป๋าให้อัตโนมัติทันที</p>
                <form onSubmit={handleProcessDrawResult} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>เลือกหวย</label>
                    <select value={resultCategory} onChange={e=>setResultCategory(e.target.value)} style={inputStyle}>
                      <option value="หวยลาว">หวยลาว</option>
                      <option value="หวยรัฐบาล">หวยรัฐบาล</option>
                      <option value="หวยฮานอย">หวยฮานอย</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px' }}>เลข 3 ตัวบน (เช่น 893)</label>
                      <input type="text" maxLength={3} value={resultTop3} onChange={e=>setResultTop3(e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px' }}>เลข 2 ตัวล่าง (เช่น 45)</label>
                      <input type="text" maxLength={2} value={resultBottom2} onChange={e=>setResultBottom2(e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                  <button type="submit" style={{ ...goldBtn, background: '#52c41a', color: '#fff', fontSize: '16px', padding: '14px' }} disabled={loading}>
                    {loading ? 'กำลังคำนวณเงินรางวัล...' : 'คำนวณเงินและออกรางวัลทันที 🚀'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: BLOCK & PAYOUT */}
            {activeTab === 'block' && (
              <div>
                <div style={darkCard}>
                  <h3 style={goldHeader}>🚫 สั่งอายัดเลข / เลขอั้น</h3>
                  <form onSubmit={handleBlockNumber} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '15px' }}>
                    <select value={blockCategory} onChange={e=>setBlockCategory(e.target.value)} style={inputStyle}>
                      <option value="หวยลาว">หวยลาว</option>
                      <option value="หวยรัฐบาล">หวยรัฐบาล</option>
                      <option value="หวยฮานอย">หวยฮานอย</option>
                    </select>
                    <input type="text" placeholder="ตัวเลขที่ต้องการอั้น" value={blockNum} onChange={e=>setBlockNum(e.target.value)} style={inputStyle} required />
                    <select value={blockType} onChange={e=>setBlockType(e.target.value)} style={inputStyle}>
                      <option value="ALL">ทุกประเภท</option>
                      <option value="3ตัวบน">3ตัวบน</option>
                      <option value="2ตัวบน">2ตัวบน</option>
                      <option value="2ตัวล่าง">2ตัวล่าง</option>
                    </select>
                    <button type="submit" style={{ ...goldBtn, background: '#ff4d4f', color: '#fff' }} disabled={loading}>บล็อกเลข</button>
                  </form>

                  <h4 style={{ color: '#8c8c8c', margin: '15px 0 10px 0' }}>รายการเลขอั้นปัจจุบัน</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #333', color: '#8c8c8c' }}>
                        <th style={{ padding: '8px' }}>หวย</th>
                        <th style={{ padding: '8px' }}>เลข</th>
                        <th style={{ padding: '8px' }}>ประเภท</th>
                        <th style={{ padding: '8px' }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(agentOverview?.closedNums || []).length === 0 ? (
                        <tr><td colSpan="4" style={{ padding: '10px', color: '#666', textAlign: 'center' }}>ไม่มีเลขอั้นในระบบ</td></tr>
                      ) : (
                        agentOverview?.closedNums.map(item => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #262626' }}>
                            <td style={{ padding: '8px' }}>{item.category}</td>
                            <td style={{ padding: '8px', color: '#fadb14', fontWeight: 'bold' }}>{item.number}</td>
                            <td style={{ padding: '8px' }}>{item.type}</td>
                            <td style={{ padding: '8px' }}>
                              <button onClick={() => handleDeleteClosedNumber(item.id)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>ปลดบล็อก</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={darkCard}>
                  <h3 style={goldHeader}>⚙️ ปรับอัตราจ่ายเงิน (บาทละ)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px' }}>
                    <select value={blockCategory} onChange={e=>setBlockCategory(e.target.value)} style={inputStyle}>
                      <option value="หวยลาว">หวยลาว</option>
                      <option value="หวยรัฐบาล">หวยรัฐบาล</option>
                      <option value="หวยฮานอย">หวยฮานอย</option>
                    </select>
                    <select value={payoutType} onChange={e=>setPayoutType(e.target.value)} style={inputStyle}>
                      <option value="3ตัวบน">3ตัวบน</option>
                      <option value="2ตัวบน">2ตัวบน</option>
                      <option value="2ตัวล่าง">2ตัวล่าง</option>
                      <option value="วิ่งบน">วิ่งบน</option>
                      <option value="วิ่งล่าง">วิ่งล่าง</option>
                    </select>
                    <input type="number" placeholder="อัตราจ่ายใหม่" value={payoutRate} onChange={e=>setPayoutRate(e.target.value)} style={inputStyle} required />
                    <button onClick={async () => {
                      if (!payoutRate) return alert('กรุณากรอกอัตราจ่าย');
                      const res = await fetch(`${API_BASE}/api/agent/payouts`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ category: blockCategory, type: payoutType, rate: parseFloat(payoutRate) })
                      });
                      const data = await res.json();
                      alert(data.message); setPayoutRate(''); fetchAgentOverview();
                    }} style={goldBtn}>บันทึก</button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AGENT CREATE MEMBER & MANAGEMENT */}
            {activeTab === 'member' && (
              <div>
                {/* 📌 ฟอร์มสมัครบัญชีสมาชิกใหม่โดย Agent */}
                <div style={darkCard}>
                  <h3 style={goldHeader}>➕ เปิดบัญชีสมาชิกใหม่ (โดย Agent)</h3>
                  <form onSubmit={handleAgentRegisterMember} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input type="text" placeholder="Username" value={agentRegForm.username} onChange={e=>setAgentRegForm({...agentRegForm, username: e.target.value})} style={inputStyle} required />
                    <input type="password" placeholder="Password" value={agentRegForm.password} onChange={e=>setAgentRegForm({...agentRegForm, password: e.target.value})} style={inputStyle} required />
                    <input type="text" placeholder="ชื่อ-นามสกุลจริง" value={agentRegForm.fullName} onChange={e=>setAgentRegForm({...agentRegForm, fullName: e.target.value})} style={inputStyle} required />
                    <select value={agentRegForm.bankName} onChange={e=>setAgentRegForm({...agentRegForm, bankName: e.target.value})} style={inputStyle}>
                      <option value="กสิกรไทย">ธนาคารกสิกรไทย</option>
                      <option value="ไทยพาณิชย์">ธนาคารไทยพาณิชย์</option>
                      <option value="กรุงเทพ">ธนาคารกรุงเทพ</option>
                      <option value="กรุงไทย">ธนาคารกรุงไทย</option>
                    </select>
                    <input type="text" placeholder="เลขที่บัญชี" value={agentRegForm.bankAccount} onChange={e=>setAgentRegForm({...agentRegForm, bankAccount: e.target.value})} style={inputStyle} required />
                    <input type="number" placeholder="เครดิตเริ่มต้น (ถ้ามี)" value={agentRegForm.initialCredit} onChange={e=>setAgentRegForm({...agentRegForm, initialCredit: parseFloat(e.target.value) || 0})} style={inputStyle} />
                    <div style={{ gridColumn: 'span 2' }}>
                      <button type="submit" style={{ ...goldBtn, width: '100%', padding: '12px' }} disabled={loading}>
                        {loading ? 'กำลังเปิดบัญชี...' : 'ยืนยันสร้างบัญชีสมาชิก'}
                      </button>
                    </div>
                  </form>
                </div>

                <div style={darkCard}>
                  <h3 style={goldHeader}>🛠️ ปรับแก้เครดิตสมาชิก</h3>
                  <form onSubmit={handleAdjustCredit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px' }}>
                    <input type="text" placeholder="Username สมาชิก" value={targetUsername} onChange={e=>setTargetUsername(e.target.value)} style={inputStyle} required />
                    <input type="number" placeholder="จำนวนเงิน" value={creditAmount} onChange={e=>setCreditAmount(e.target.value)} style={inputStyle} required />
                    <select value={creditAction} onChange={e=>setCreditAction(e.target.value)} style={inputStyle}>
                      <option value="ADD">➕ เพิ่มเครดิต</option>
                      <option value="SUB">➖ ดึงเครดิตคืน</option>
                    </select>
                    <button type="submit" style={goldBtn} disabled={loading}>{loading ? 'กำลังปรับ...' : 'ปรับเครดิต'}</button>
                  </form>
                </div>

                <div style={darkCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ ...goldHeader, margin: 0 }}>👥 รายชื่อสมาชิกทั้งหมด</h3>
                    <input 
                      type="text" 
                      placeholder="🔍 ค้นหาตาม Username..." 
                      value={searchTerm} 
                      onChange={e=>setSearchTerm(e.target.value)} 
                      style={{ ...inputStyle, width: '250px', padding: '8px 12px' }} 
                    />
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #333', color: '#8c8c8c' }}>
                        <th style={{ padding: '10px' }}>Username</th>
                        <th style={{ padding: '10px' }}>ชื่อ-นามสกุล</th>
                        <th style={{ padding: '10px' }}>บัญชีธนาคาร</th>
                        <th style={{ padding: '10px' }}>เครดิตคงเหลือ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(agentOverview?.members || [])
                        .filter(m => m.username.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid #262626' }}>
                            <td style={{ padding: '10px', color: '#fadb14', fontWeight: 'bold' }}>{m.username}</td>
                            <td style={{ padding: '10px' }}>{m.fullName || '-'}</td>
                            <td style={{ padding: '10px' }}>{m.bankName} {m.bankAccount}</td>
                            <td style={{ padding: '10px', color: '#52c41a', fontWeight: 'bold' }}>{(m.credit || 0).toLocaleString()} ฿</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ORDER CONFIRMATION MODAL */}
        {confirmModal.show && (
          <div style={modalOverlay}>
            <div style={{ ...darkCard, width: '400px', borderColor: '#d4b106', boxShadow: '0 0 20px rgba(212,177,6,0.4)' }}>
              <h3 style={{ ...goldHeader, textAlign: 'center' }}>🧾 ยืนยันการส่งโพย ({selectedCategory})</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px', border: '1px solid #333', borderRadius: '6px', padding: '10px' }}>
                {confirmModal.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #262626' }}>
                    <span>{item.type} [{item.number}]</span>
                    <span style={{ color: '#fadb14' }}>{item.amount} ฿</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', marginBottom: '20px' }}>
                <span>ยอดรวมทั้งหมด:</span>
                <span style={{ color: '#52c41a' }}>{confirmModal.total.toLocaleString()} ฿</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={()=>setConfirmModal({ show: false, items: [], total: 0 })} style={{ flex: 1, padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>ยกเลิก</button>
                <button onClick={handleConfirmBuyTicket} style={{ ...goldBtn, flex: 1 }} disabled={loading}>
                  {loading ? 'กำลังส่งโพย...' : 'ยืนยันสั่งซื้อ'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;