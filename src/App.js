import React, { useState } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAction = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // จำลองการเชื่อมต่อ API ไปยัง Backend (เช่น บน Render)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMessage('บันทึกข้อมูลสำเร็จเรียบร้อยครับ!');
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">BORNDEE Application</h1>
        <p className="text-gray-600 mb-6">ระบบพร้อมสำหรับการนำเสนอและใช้งานจริง</p>

        {/* แสดงข้อความแจ้งเตือนเมื่อทำรายการเสร็จ */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* ปุ่มกดพร้อมสถานะกำลังโหลด */}
        <button
          onClick={handleAction}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังประมวลผล...
            </span>
          ) : (
            'ทดสอบระบบ / บันทึกข้อมูล'
          )}
        </button>
      </div>
    </div>
  );
}

export default App;