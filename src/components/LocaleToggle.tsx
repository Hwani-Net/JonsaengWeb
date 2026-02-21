'use client';

interface LocaleToggleProps {
  locale: 'ko' | 'en';
  onToggle: () => void;
}

export default function LocaleToggle({ locale, onToggle }: LocaleToggleProps) {
  return (
    <button className="icon-btn lang-btn" onClick={onToggle}>
      {locale === 'ko' ? 'EN' : '한'}
    </button>
  );
}
