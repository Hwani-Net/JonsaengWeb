'use client';

import { useState, useEffect } from 'react';
import { detectLocale, getTranslations, type Locale } from '@/i18n';
import { useTheme } from '@/hooks/useTheme';
import PaymentModal from '@/components/PaymentModal';
import AdSlot from '@/components/AdSlot';
import ThemeToggle from '@/components/ThemeToggle';
import LocaleToggle from '@/components/LocaleToggle';
import { shareResult } from '@/utils/share';

const FREE_LIMIT = 3;

export default function Home() {
  const [locale, setLocale] = useState<Locale>('ko');
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = getTranslations(locale);

  useEffect(() => {
    setLocale(detectLocale());
    setUsageCount(parseInt(localStorage.getItem('app_usage') || '0', 10));
    setIsPremium(localStorage.getItem('app_premium') === 'true');
  }, []);

  const handleGenerate = async () => {
    // Both are optional, no strict validation needed, but we can prevent completely spam clicks if we want.
    // We'll proceed even if they are empty.
    if (!isPremium && usageCount >= FREE_LIMIT) { setShowPayment(true); return; }
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, gender }),
      });
      const data = await res.json();
      if (data.text) {
        setResult(data.text);
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('app_usage', newCount.toString());
      } else { alert(t.errorServer); }
    } catch { alert(t.errorServer); }
    finally { setLoading(false); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    localStorage.setItem('app_premium', 'true');
    setShowPayment(false);
  };

  return (
    <>
      {/* TODO: Agent will fill in the actual UI layout here */}
      {/* All building blocks are ready: ThemeToggle, LocaleToggle, AdSlot, PaymentModal */}
      <main style={{ flex: 1, padding: '40px', maxWidth: 800 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <ThemeToggle />
          <LocaleToggle locale={locale} onToggle={() => setLocale(l => l === 'ko' ? 'en' : 'ko')} />
          {!isPremium && (
            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t.freeLeft}: {Math.max(0, FREE_LIMIT - usageCount)}/{FREE_LIMIT}
            </span>
          )}
        </div>

        <section className="glass-panel" style={{ padding: 28, marginBottom: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.appTitle}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{t.appSubtitle}</p>
          
          <div style={{ textAlign: 'left' }}>
            <label className="field-label">{t.namePlaceholder}</label>
            <input
              type="text"
              className="text-input"
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginBottom: '16px' }}
            />
            
            <label className="field-label">{t.genderPlaceholder}</label>
            <select
              className="text-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">선택 안함 (Not Specified)</option>
              <option value="male">남성 (Male)</option>
              <option value="female">여성 (Female)</option>
            </select>
          </div>
          <button
            className="btn-primary"
            style={{ marginTop: 16, width: '100%' }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? t.generating : t.generate}
          </button>
        </section>

        <AdSlot />

        {result && (
          <section className="glass-panel" style={{ padding: 28, marginTop: 24, animation: 'fadeSlideIn 0.35s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="field-label">{t.result}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="action-btn" onClick={handleCopy}>{copied ? t.copied : t.copy}</button>
                <button className="action-btn" onClick={() => shareResult(t.appTitle, result)}>{t.share}</button>
              </div>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{result}</div>
          </section>
        )}
      </main>

      {showPayment && (
        <PaymentModal onUpgrade={handleUpgrade} onClose={() => setShowPayment(false)} t={t} />
      )}
    </>
  );
}
