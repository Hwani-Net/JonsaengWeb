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
    const message = `${name ? `${name}의 ` : ''}전생 분석 결과를 확인해 보세요.
전생 신분: ${result?.identity}
성향: ${result?.characteristics}`;
    
    // 카카오톡 공유 기능이 있다면 여기에 추가 (현재는 Web Share API)
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
    <main className="landing">
      <div className="aurora" aria-hidden="true" />
      <section className="hero glass-panel">
        <header className="hero-header">
          <p className="hero-eyebrow">전생왕AI</p>
          <h1 className="hero-title">푸른 심야의 문을 열고 전생을 깨우세요</h1>
          <p className="hero-sub">
            이름과 생년월일만으로 당신의 전생 서사를 해석하는 프리미엄 AI 타로.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>
            무료 이용 횟수: {Math.max(0, MAX_FREE_TRIES - usageCount)} / {MAX_FREE_TRIES}
          </p>
        </header>

        <form className="input-grid" onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span className="field-label">이름</span>
            <input
              className="text-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              disabled={loading}
            />
          </label>
          <label className="field">
            <span className="field-label">생년월일</span>
            <input
              className="text-input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={loading}
            />
          </label>
        </form>

        {error && <p style={{ color: '#ff6b6b', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

        <button 
          className="btn-analyze" 
          type="button" 
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? '운명의 빛이 닿는 중...' : '전생 분석하기'}
        </button>

        {result && (
          <div className="result-card">
            <div className="card-inner">
              <p className="card-eyebrow">당신의 전생</p>
              <h2 className="card-title">{result.identity}</h2>
              <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--gold)' }}>
                <span>{result.era}</span> | <span>{result.characteristics}</span>
              </div>
              <p className="card-body">
                {result.story}
              </p>
              <div className="card-actions">
                <button className="btn-ghost" type="button" onClick={handleShare}>
                  공유하기
                </button>
                <button className="btn-ghost" type="button" onClick={handleReset}>
                  다시 하기
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 광고 영역 */}
      <AdSlot className="mt-8" />

      {/* 결제 모달 */}
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
    </main>
  );
}

