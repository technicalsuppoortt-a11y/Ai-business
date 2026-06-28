import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../../firebase';
import { libraryStorage } from '../../../firebaseLibrary';

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  paymentMethods,
  plans,
  userData, 
  adminUid, 
  adminBrandName, 
  lang 
}) {
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [phoneInput, setPhoneInput] = useState(userData?.phoneNumber || '');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [checkingPending, setCheckingPending] = useState(false);
  
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  // Check for existing pending payment whenever modal opens
  useEffect(() => {
    if (!isOpen || !userData?.uid) return;

    const checkPending = async () => {
      setCheckingPending(true);
      try {
        const q = query(
          collection(db, 'payments'),
          where('userId', '==', userData.uid),
          where('status', '==', 'pending')
        );
        const snap = await getDocs(q);
        setHasPendingRequest(!snap.empty);
      } catch (err) {
        console.error('Error checking pending payment:', err);
      } finally {
        setCheckingPending(false);
      }
    };

    // Reset states on open
    setSuccess(false);
    setError('');
    setScreenshot(null);
    checkPending();
  }, [isOpen, userData?.uid]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!screenshot) {
      setError(lang === 'ar' ? 'يرجى إرفاق صورة التحويل' : 'Please upload transfer screenshot');
      return;
    }
    if (!phoneInput) {
      setError(lang === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload image
      const imgRef = ref(libraryStorage, `payments/${Date.now()}_${userData.uid}_${screenshot.name}`);
      await uploadBytes(imgRef, screenshot);
      const screenshotUrl = await getDownloadURL(imgRef);

      // Save to Firestore
      await addDoc(collection(db, 'payments'), {
        userId: userData.uid,
        userName: userData.ownerName || 'User',
        userEmail: userData.email,
        userPhone: phoneInput,
        adminUid: adminUid,
        brandName: adminBrandName,
        screenshotUrl: screenshotUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setHasPendingRequest(true);
    } catch (err) {
      console.error('Error submitting payment:', err);
      setError(lang === 'ar' ? 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى' : 'An error occurred while submitting, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlanId) {
      setError(lang === 'ar' ? 'يرجى اختيار الباقة أولاً' : 'Please select a plan first');
      return;
    }

    const selectedPlan = plans?.find(p => p.id === Number(selectedPlanId) || p.name === selectedPlanId);
    
    setIsStripeLoading(true);
    setError('');
    try {
      // Use deployed backend URL in production, localhost for dev
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.uid,
          adminUid: adminUid,
          planId: selectedPlan?.id || selectedPlanId,
          planName: selectedPlan?.name_ar || selectedPlan?.name || 'Subscription',
          planPrice: selectedPlan?.price || 0,
          planCurrency: 'EGP', // or fetch from plan if available
          durationDays: selectedPlan?.durationDays || selectedPlan?.duration || 30,
          successUrl: window.location.origin + '/dashboard?payment=success',
          cancelUrl: window.location.origin + '/dashboard?payment=cancel'
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Stripe error:', err);
      setError(lang === 'ar' ? 'فشل الاتصال بـ Stripe' : 'Failed to connect to Stripe');
    } finally {
      setIsStripeLoading(false);
    }
  };

  return (
    <div className="payment-modal-overlay" style={overlayStyle}>
      <div className="payment-modal-card" style={cardStyle} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <button onClick={onClose} style={closeBtnStyle}>✕</button>
        
        {checkingPending ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '3px solid var(--line)', borderTopColor: 'var(--accent)',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
              {lang === 'ar' ? 'جاري التحقق...' : 'Checking...'}
            </p>
          </div>
        ) : hasPendingRequest && !success ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{ color: '#F59E0B', marginBottom: '12px', fontSize: '18px' }}>
              {lang === 'ar' ? 'طلبك قيد المراجعة حالياً' : 'Your Request is Under Review'}
            </h3>
            <p style={{ color: 'var(--text2)', fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>
              {lang === 'ar'
                ? 'لقد قمت بإرسال طلب اشتراك مسبقاً وهو الآن قيد المراجعة من قِبَل الفريق. سيتم تفعيل اشتراكك فور التحقق من التحويل.'
                : 'You have already submitted a subscription request and it is currently under review by our team. Your subscription will be activated once the transfer is verified.'}
            </p>
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#F59E0B'
            }}>
              {lang === 'ar'
                ? '✅ تم استلام طلبك. يُرجى الانتظار حتى يتم مراجعته والرد عليك.'
                : '✅ Your request has been received. Please wait while it is reviewed.'}
            </div>
            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              {lang === 'ar' ? 'حسناً، سأنتظر' : 'OK, I will wait'}
            </button>
          </div>
        ) : success ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
            <h3 style={{ color: 'var(--green)', marginBottom: '10px' }}>
              {lang === 'ar' ? 'تم إرسال طلبك بنجاح' : 'Request Submitted Successfully'}
            </h3>
            <p style={{ color: 'var(--text2)' }}>
              {lang === 'ar' 
                ? 'الطلب الآن قيد المراجعة، سيتم تفعيل اشتراكك بمجرد التأكد من التحويل.' 
                : 'Your request is under review. Your subscription will be activated once the transfer is verified.'}
            </p>
            <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
              {lang === 'ar' ? 'حسناً' : 'OK'}
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '16px', color: '#fff' }}>
              {lang === 'ar' ? 'الدفع والاشتراك' : 'Pay and Subscribe'}
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px' }}>
              {lang === 'ar' 
                ? 'يرجى اختيار الباقة المناسبة، ثم الدفع عبر البطاقة البنكية أو التحويل لإحدى المحافظ.' 
                : 'Please select a plan, then pay via Credit Card or transfer to one of the wallets.'}
            </p>

            {plans && plans.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text2)', fontSize: '14px' }}>
                  {lang === 'ar' ? 'اختر الباقة:' : 'Select Plan:'}
                </label>
                <select 
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  style={inputStyle}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                >
                  <option value="">{lang === 'ar' ? '-- اختر الباقة --' : '-- Select a Plan --'}</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name_ar || p.name} - {p.price} {p.currency || 'EGP'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ background: 'var(--bg2)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px', color: '#fff' }}>
                {lang === 'ar' ? 'المحافظ المتاحة:' : 'Available Wallets:'}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text)' }}>
                {paymentMethods?.vodafone && (
                  <li style={walletItemStyle}>
                    <span style={{color: '#E60000', fontWeight: 'bold'}}>Vodafone Cash:</span> 
                    <span dir="ltr">{paymentMethods.vodafone}</span>
                  </li>
                )}
                {paymentMethods?.etisalat && (
                  <li style={walletItemStyle}>
                    <span style={{color: '#006B33', fontWeight: 'bold'}}>Etisalat Cash:</span> 
                    <span dir="ltr">{paymentMethods.etisalat}</span>
                  </li>
                )}
                {paymentMethods?.orange && (
                  <li style={walletItemStyle}>
                    <span style={{color: '#FF6600', fontWeight: 'bold'}}>Orange Cash:</span> 
                    <span dir="ltr">{paymentMethods.orange}</span>
                  </li>
                )}
                {paymentMethods?.instapay && (
                  <li style={walletItemStyle}>
                    <span style={{color: '#8A2BE2', fontWeight: 'bold'}}>InstaPay:</span> 
                    <span dir="ltr">{paymentMethods.instapay}</span>
                  </li>
                )}
                {!paymentMethods?.vodafone && !paymentMethods?.etisalat && !paymentMethods?.orange && !paymentMethods?.instapay && (
                  <li style={{ color: 'var(--text3)' }}>
                    {lang === 'ar' ? 'لا توجد محافظ متاحة حالياً' : 'No wallets available currently'}
                  </li>
                )}
              </ul>
            </div>

            {paymentMethods?.stripeKeys?.publishableKey && (
              <div style={{ background: 'var(--bg2)', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
                <h4 style={{ marginBottom: '12px', color: '#fff' }}>
                  {lang === 'ar' ? 'أو الدفع عبر البطاقة البنكية:' : 'Or Pay via Credit Card:'}
                </h4>
                <button 
                  onClick={handleStripeCheckout}
                  disabled={isStripeLoading}
                  style={{
                    display: 'inline-block',
                    background: '#6772E5',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: '0 4px 10px rgba(103, 114, 229, 0.3)',
                    cursor: isStripeLoading ? 'not-allowed' : 'pointer',
                    opacity: isStripeLoading ? 0.7 : 1
                  }}
                >
                  {isStripeLoading ? '⏳ ...' : '💳 ' + (lang === 'ar' ? 'الدفع الآمن عبر Stripe' : 'Secure Payment via Stripe')}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text2)', fontSize: '14px' }}>
                  {lang === 'ar' ? 'رقم الهاتف (الذي تم التحويل منه):' : 'Phone Number (transferred from):'}
                </label>
                <input 
                  type="text" 
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  style={inputStyle}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text2)', fontSize: '14px' }}>
                  {lang === 'ar' ? 'إرفاق صورة التحويل:' : 'Attach Transfer Screenshot:'}
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={fileInputStyle}
                />
              </div>

              {error && <div style={{ color: 'var(--red)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : (lang === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Inline Styles for isolation
const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100000,
  backdropFilter: 'blur(4px)',
};

const cardStyle = {
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--line)',
  borderRadius: '24px',
  padding: '32px',
  width: '90%',
  maxWidth: '500px',
  position: 'relative',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
};

const closeBtnStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'transparent',
  border: 'none',
  color: 'var(--text3)',
  fontSize: '20px',
  cursor: 'pointer',
};

const walletItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid var(--line)',
  fontSize: '15px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: 'var(--bg2)',
  border: '1px solid var(--line)',
  borderRadius: '8px',
  color: 'var(--text)',
  outline: 'none',
  fontSize: '14px',
};

const fileInputStyle = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: 'var(--bg2)',
  border: '1px solid var(--line)',
  borderRadius: '8px',
  color: 'var(--text)',
  outline: 'none',
  fontSize: '14px',
};
