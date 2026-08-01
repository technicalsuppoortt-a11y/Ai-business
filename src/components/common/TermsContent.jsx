import React from 'react';

export default function TermsContent({ isRtl = true }) {
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ textAlign: isRtl ? 'right' : 'left' }}>
      {isRtl ? (
        <>
          <p style={{ marginBottom: '16px', lineHeight: '1.8' }}>
            مرحباً بك في منصتنا. تنظم هذه الشروط والأحكام استخدامك لخدماتنا. باستخدامك للمنصة، فإنك توافق على الالتزام التام بهذه الشروط.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text, #fff)', marginBottom: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent, #3B82F6)' }} />
              1. سياسة الاسترجاع (Refund Policy)
            </h4>
            <p style={{ color: 'var(--text2, #94A3B8)', fontSize: '14px', lineHeight: '1.8' }}>
              تخضع المبالغ المدفوعة لسياسة الاسترجاع خلال 14 يوماً من تاريخ الاشتراك بشرط عدم استهلاك أكثر من 10% من رصيد/توكنز الحساب الممنوحة لك. في حال تجاوز هذه النسبة، لا يحق للمستخدم المطالبة باسترداد المبلغ.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text, #fff)', marginBottom: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green, #10B981)' }} />
              2. استخدام الخدمات والمسؤولية
            </h4>
            <p style={{ color: 'var(--text2, #94A3B8)', fontSize: '14px', lineHeight: '1.8', marginBottom: '8px' }}>
              أنت مسؤول بشكل كامل عن أي محتوى تقوم بتوليده أو مشاركته باستخدام أدواتنا. يمنع منعاً باتاً:
            </p>
            <ul style={{ color: 'var(--text2, #94A3B8)', fontSize: '14px', lineHeight: '1.8', listStyleType: 'disc', paddingRight: '20px' }}>
              <li>توليد محتوى ينتهك حقوق الملكية الفكرية لطرف ثالث.</li>
              <li>استخدام المنصة لأي أغراض غير قانونية أو احتيالية.</li>
              <li>القيام بأي أنشطة قد تضر بأمان المنصة أو بنيتها التحتية.</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text, #fff)', marginBottom: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
              3. التعديلات على الشروط
            </h4>
            <p style={{ color: 'var(--text2, #94A3B8)', fontSize: '14px', lineHeight: '1.8' }}>
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إعلامك بأي تغييرات جوهرية، ويعتبر استمرارك في استخدام المنصة بعد هذه التعديلات موافقة صريحة عليها.
            </p>
          </div>
        </>
      ) : (
        <>
          <p style={{ marginBottom: '16px', lineHeight: '1.8' }}>
            Welcome to our platform. These Terms & Conditions govern your use of our services. By using the platform, you agree to be bound by these terms.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text, #fff)', marginBottom: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent, #3B82F6)' }} />
              1. Refund Policy
            </h4>
            <p style={{ color: 'var(--text2, #94A3B8)', fontSize: '14px', lineHeight: '1.8' }}>
              Paid amounts are subject to a refund policy within 14 days from the date of subscription, provided that no more than 10% of the account's credit/tokens have been consumed. If this threshold is exceeded, the user is not entitled to a refund.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text, #fff)', marginBottom: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green, #10B981)' }} />
              2. Use of Services and Liability
            </h4>
            <p style={{ color: 'var(--text2, #94A3B8)', fontSize: '14px', lineHeight: '1.8', marginBottom: '8px' }}>
              You are entirely responsible for any content you generate or share using our tools. It is strictly prohibited to:
            </p>
            <ul style={{ color: 'var(--text2, #94A3B8)', fontSize: '14px', lineHeight: '1.8', listStyleType: 'disc', paddingLeft: '20px' }}>
              <li>Generate content that infringes on third-party intellectual property rights.</li>
              <li>Use the platform for any illegal or fraudulent purposes.</li>
              <li>Engage in any activities that may harm the security or infrastructure of the platform.</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text, #fff)', marginBottom: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
              3. Modifications to Terms
            </h4>
            <p style={{ color: 'var(--text2, #94A3B8)', fontSize: '14px', lineHeight: '1.8' }}>
              We reserve the right to modify these terms at any time. You will be notified of any material changes, and your continued use of the platform after such modifications constitutes your explicit consent to them.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
