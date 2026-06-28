import React from 'react';
import PlatformExplanation from '../../components/common/PlatformExplanation';
import { useApp } from '../../context/AppContext';

export default function TutorialPage() {
  const { state } = useApp();
  const lang = state.language || 'ar';
  
  return (
    <div className="animate-in" style={{ padding: '0', maxWidth: '100%', overflowX: 'hidden' }}>
      <PlatformExplanation
        title={lang === 'ar' ? "شرح منصة الأدوات" : "Platform Tutorial"}
        videoUrl="https://firebasestorage.googleapis.com/v0/b/aibrand-vision.firebasestorage.app/o/Videos%2F%D8%B4%D8%B1%D8%AD%20%D9%85%D9%88%D9%82%D8%B9%20%D8%A7%D9%84%D8%A3%D8%AF%D9%88%D8%A7%D8%AA.webm?alt=media&token=7ae6e2bd-ad81-4483-a78b-4ac1d058e670"
        lang={lang}
      />
    </div>
  );
}
