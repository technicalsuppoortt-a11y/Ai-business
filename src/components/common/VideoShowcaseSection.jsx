import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Sparkles, ShieldCheck, CheckCircle2, Maximize2 } from 'lucide-react';
import localVideoMp4 from '../../assets/video.mp4';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

export default function VideoShowcaseSection({ isArabic = true }) {
  const [videoUrl, setVideoUrl] = useState('');
  const videoRef = useRef(null);

  const firebaseStoragePath = 'landing_videos/platform_demo.mp4';
  const fallbackFirebaseUrl = 'https://firebasestorage.googleapis.com/v0/b/event-upklick.firebasestorage.app/o/landing_videos%2Fplatform_demo.mp4?alt=media';

  useEffect(() => {
    try {
      const storageRef = ref(storage, firebaseStoragePath);
      getDownloadURL(storageRef)
        .then((url) => {
          setVideoUrl(url);
        })
        .catch(() => {
          setVideoUrl(fallbackFirebaseUrl);
        });
    } catch (e) {
      setVideoUrl(fallbackFirebaseUrl);
    }
  }, []);

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  return (
    <section
      id="video-demo"
      style={{
        position: 'relative',
        padding: '90px 20px',
        background: 'linear-gradient(180deg, #07070F 0%, #0D111D 50%, #07070F 100%)',
        overflow: 'hidden',
        borderTop: '1px solid rgba(99, 102, 241, 0.15)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
      }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Ambient Radial Lighting */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '750px',
          height: '750px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(124, 58, 237, 0.06) 50%, transparent 80%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '99px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#818CF8',
              fontSize: '13px',
              fontWeight: '800',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={16} />
            <span>{isArabic ? '🎬 الفيديو التوضيحي المباشر للمنصة' : '🎬 Live Platform Video Demo'}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              color: '#FFFFFF',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: '900',
              margin: '0 0 16px 0',
              lineHeight: 1.3,
            }}
          >
            {isArabic ? 'شاهد شرح المنصة بالكامل من السيرفر السحابي مباشرة' : 'Watch Full Video Demo Streamed from Cloud Server'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              color: '#94A3B8',
              fontSize: '16px',
              maxWidth: '720px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            {isArabic
              ? 'مقطع فيديو توضيحي عالي الجودة مشغل من سيرفرات Firebase Storage يوضح كافة المميزات والوظائف التفاعلية.'
              : 'High-definition video streamed directly from Firebase Storage displaying all intelligent platform tools.'}
          </motion.p>
        </div>

        {/* FULL HTML5 VIDEO PLAYER FRAME */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            position: 'relative',
            borderRadius: '24px',
            background: '#0B0F17',
            border: '1px solid rgba(99, 102, 241, 0.45)',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.85), 0 0 60px rgba(99, 102, 241, 0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Window Chrome Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 24px',
              background: 'rgba(15, 23, 42, 0.98)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E2E8F0', fontSize: '13px', fontWeight: '800' }}>
              <Film size={16} color="#818CF8" />
              <span>{isArabic ? 'مشغل الفيديو المباشر (Firebase Storage)' : 'Live Video Stream (Firebase Storage)'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleFullscreen}
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  color: '#FFF',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Maximize2 size={12} />
                <span>{isArabic ? 'ملء الشاشة' : 'Fullscreen'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '11px', fontWeight: '800' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981' }} />
                <span>ONLINE</span>
              </div>
            </div>
          </div>

          {/* HTML5 Video Element */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              minHeight: '460px',
              maxHeight: '680px',
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              ref={videoRef}
              controls
              playsInline
              preload="auto"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#000000',
              }}
            >
              {videoUrl && <source src={videoUrl} type="video/mp4" />}
              <source src={localVideoMp4} type="video/mp4" />
              Your browser does not support HTML5 video streaming.
            </video>
          </div>

          {/* Bottom Bar Features */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '16px 24px',
              background: 'rgba(15, 23, 42, 0.95)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94A3B8',
              fontSize: '12px',
              fontWeight: '700',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>{isArabic ? 'مشغل من Firebase Storage' : 'Firebase Storage Stream'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#818CF8" />
              <span>{isArabic ? 'جودة عالية HD بدقة 1080p' : '1080p Full HD Quality'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#F59E0B" />
              <span>{isArabic ? 'تشغيل آمن ومباشر بالسيرفر' : 'Fast CDN Playback'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
