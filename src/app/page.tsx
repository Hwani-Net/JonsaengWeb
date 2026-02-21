'use client';

import { useState, useEffect } from 'react';
import PaymentModal from '@/components/PaymentModal';
import AdSlot from '@/components/AdSlot';
import { getTranslations, detectLocale } from '@/i18n';

type ResultData = {
  identity: string;
  era: string;
  characteristics: string;
  story: string;
};

export default function Home() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [usageCount, setUsageCount] = useState<number>(0);
  const MAX_FREE_TRIES = 1;

  const t = getTranslations(typeof window !== 'undefined' ? detectLocale() : 'ko');

  useEffect(() => {
    const saved = localStorage.getItem('jonsaeng_usage_count');
    if (saved) {
      setUsageCount(parseInt(saved, 10));
    }
  }, []);

  const handleReset = () => {
    setName('');
    setBirthDate('');
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!name || !birthDate) {
      setError('이름과 생년월일을 모두 입력해주세요.');
      return;
    }

    if (usageCount >= MAX_FREE_TRIES) {
      setShowPayment(true);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, birthDate }),
      });
      if (!res.ok) throw new Error('운명의 서를 읽어오지 못했습니다.');
      const data = await res.json();
      setResult(data);
      
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('jonsaeng_usage_count', newCount.toString());
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const message = `${name ? `${name}의 ` : ''}전생 분석 결과를 확인해 보세요.\n전생 신분: ${result?.identity}\n성향: ${result?.characteristics}`;
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: '전생왕AI', text: message, url: window.location.href });
        return;
      } catch {
        // ignore share cancellation
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${message}\n${window.location.href}`);
      alert('공유 링크와 결과가 클립보드에 복사되었습니다.');
    }
  };

  const handleUpgrade = () => {
    alert('모의 결제: 개발 버전에서는 결제가 진행되지 않습니다.');
    setShowPayment(false);
    // 개발 모드에서는 무제한 스킵을 위해 로컬스토리지 초기화
    setUsageCount(0);
    localStorage.setItem('jonsaeng_usage_count', '0');
  };

  return (
    <div className="mystic-bg">
      <header className="main-header pt-10">
        <div className="text-gold mb-1">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <h1 className="text-slate-100">전생왕<span className="text-primary">AI</span></h1>
        <p className="text-slate-400">당신의 전생을 분석해 드립니다</p>
        <p className="text-gold" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
          무료 이용 횟수: {Math.max(0, MAX_FREE_TRIES - usageCount)} / {MAX_FREE_TRIES}
        </p>
      </header>

      <main className="px-6 pb-24" style={{ flex: 1 }}>
        <div className="hero-visual">
          <div className="hero-visual-gradient"></div>
          <div className="hero-visual-bg"></div>
          <div className="hero-icon-wrap animate-pulse">
            <span className="material-symbols-outlined text-5xl text-gold">psychology</span>
          </div>
        </div>

        {!result ? (
          <section className="input-section">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <span className="material-symbols-outlined text-6xl text-gold">history_edu</span>
            </div>
            <h2 className="input-header">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              정보 입력
            </h2>
            
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <label className="input-label">성함</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="이름을 입력하세요" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <label className="input-label">생년월일</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              {error && <p className="text-center mt-4" style={{ color: '#ff6b6b', fontSize: '0.875rem' }}>{error}</p>}
              
              <button 
                type="button" 
                className="btn-submit" 
                onClick={handleAnalyze}
                disabled={loading}
              >
                <span>{loading ? '운명의 빛이 닿는 중...' : '전생 분석하기'}</span>
                {!loading && <span className="material-symbols-outlined text-gold">flare</span>}
              </button>
            </form>
          </section>
        ) : (
          <section className="result-section">
            <h3 className="result-header">
              <div className="result-line"></div>
              분석 결과 예시
              <div className="result-line"></div>
            </h3>
            
            <div className="tarot-card">
              <div className="tarot-corner top">
                <span className="material-symbols-outlined text-xs">grade</span>
                <span className="material-symbols-outlined text-xs">grade</span>
              </div>
              
              <div className="portrait-ring">
                <div className="portrait-inner">
                  <img 
                    className="portrait-img" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvWhkOQP0av-mdAbTcL0qE8A_yJywF-baFxsZpHG_ZYtjs18XNyvOdBbW1OWPy4bB6YZiimqyCcfcG1az5k-42e_WOSrCn4uFv_YABNWctUnuwTyHrCFvUF4-d9cZuXqz-M0VM8xemhY4ip9aIWpL3tIwHR9JtCrkGJNVX4dWwroVbvuIciCyCNTDIuQ1vf0rBvS3fwU6vs8Siggt2DCJ05eInK0u1hBUYsOIQR7prwaWgwi_Ey7RzFr4k6pUNh5-v09x7eH9Y_pk" 
                    alt="Past life portrait" 
                  />
                </div>
              </div>
              
              <h4 className="tarot-title">{result.identity}</h4>
              <p className="tarot-era">{result.era}</p>
              
              <div className="tarot-divider"></div>
              
              <p className="tarot-story">"{result.story}"</p>
              
              <div className="tarot-tags">
                <span className="tarot-tag">#{result.characteristics.split(',')[0]}</span>
                {result.characteristics.split(',').length > 1 && (
                  <span className="tarot-tag">#{result.characteristics.split(',')[1].trim()}</span>
                )}
              </div>
              
              <div className="tarot-corner bottom">
                <span className="material-symbols-outlined text-xs">ink_pen</span>
                <span className="material-symbols-outlined text-xs">ink_pen</span>
              </div>
            </div>
            
            <div className="card-actions">
              <button className="btn-ghost text-sm font-medium" onClick={handleShare}>공유하기</button>
              <button className="btn-ghost text-sm font-medium" onClick={handleReset}>다시 하기</button>
            </div>
          </section>
        )}
        
        <AdSlot className="mt-8" />
      </main>

      {/* Navigation Bar (iOS style) */}
      <nav className="bottom-nav">
        <div className="nav-inner">
          <button className="nav-item active" onClick={handleReset}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>temple_buddhist</span>
            <span className="nav-text">분석</span>
          </button>
          <button className="nav-item">
            <span className="material-symbols-outlined">history</span>
            <span className="nav-text">기록</span>
          </button>
          <button className="nav-item" onClick={() => setShowPayment(true)}>
            <span className="material-symbols-outlined">stars</span>
            <span className="nav-text">프리미엄</span>
          </button>
          <button className="nav-item">
            <span className="material-symbols-outlined">person</span>
            <span className="nav-text">정보</span>
          </button>
        </div>
      </nav>

      <div className="sparkles-overlay">
        <div className="sparkle sparkle-1 animate-pulse"><span className="material-symbols-outlined text-[10px]">spark</span></div>
        <div className="sparkle sparkle-2 animate-pulse"><span className="material-symbols-outlined text-[8px]">spark</span></div>
        <div className="sparkle sparkle-3 animate-pulse"><span className="material-symbols-outlined text-[12px]">flare</span></div>
        <div className="sparkle sparkle-4 animate-pulse"><span className="material-symbols-outlined text-[6px]">spark</span></div>
      </div>

      {showPayment && (
        <PaymentModal 
          onUpgrade={handleUpgrade} 
          onClose={() => setShowPayment(false)} 
          t={{
            premiumTitle: "운명의 흐름이 끊겼습니다",
            premiumDesc: "전생의 서를 계속 읽으시려면 프리미엄 동전($0.99)을 지불해주세요.",
            upgrade: "프리미엄 동전 지불하기",
            cancel: "나중에 돌아오기"
          }}
        />
      )}
    </div>
  );
}


