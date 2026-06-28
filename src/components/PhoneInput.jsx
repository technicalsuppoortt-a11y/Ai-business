import React from 'react';

export default function PhoneInput({ phoneKey, setPhoneKey, phoneNumber, setPhoneNumber, disabled, placeholder = '01xxxxxxxxx' }) {
  return (
    <div style={{ display: 'flex', gap: 6, width: '100%' }}>
      <input 
        list="phone-keys"
        className="field-input" 
        style={{ width: 90, padding: '0 8px', textAlign: 'center' }} 
        value={phoneKey} 
        onChange={e => setPhoneKey(e.target.value)}
        disabled={disabled}
        dir="ltr"
        placeholder="+20"
      />
      <datalist id="phone-keys">
        <option value="+20">🇪🇬 +20</option>
        <option value="+966">🇸🇦 +966</option>
        <option value="+971">🇦🇪 +971</option>
        <option value="+965">🇰🇼 +965</option>
        <option value="+974">🇶🇦 +974</option>
        <option value="+968">🇴🇲 +968</option>
        <option value="+212">🇲🇦 +212</option>
      </datalist>
      <input 
        className="field-input" 
        value={phoneNumber} 
        onChange={e => setPhoneNumber(e.target.value)} 
        disabled={disabled} 
        placeholder={placeholder} 
        dir="ltr" 
        style={{ flex: 1 }}
        type="tel"
      />
    </div>
  );
}
