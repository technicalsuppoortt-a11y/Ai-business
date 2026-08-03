import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Email CRM & Marketing Firestore Service
 * Connects directly to Firebase Firestore for zero-hardcoded static data.
 * Mapped to Resend API for real-world email dispatches.
 */

// ── 1. User Email & SMTP Settings ──────────────────────────────
export async function getEmailSettings(userId = 'default_user') {
  try {
    const docRef = doc(db, 'user_email_settings', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('Error fetching email settings from Firestore:', err);
    throw err;
  }
}

export async function saveEmailSettings(userId = 'default_user', settingsData) {
  try {
    const docRef = doc(db, 'user_email_settings', userId);
    const dataToSave = {
      ...settingsData,
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, dataToSave, { merge: true });
    return dataToSave;
  } catch (err) {
    console.error('Error saving email settings to Firestore:', err);
    throw err;
  }
}

// ── 2. Contacts Management ─────────────────────────────────────
export async function getContacts(userId) {
  try {
    if (!userId) return [];
    const colRef = collection(db, 'contacts');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const results = snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    return results.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('Error fetching contacts from Firestore:', err);
    throw err;
  }
}

export async function addContact(userId, contactData) {
  try {
    if (!userId) throw new Error("userId is required");
    const colRef = collection(db, 'contacts');
    const defaultExpiry = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const docRef = await addDoc(colRef, {
      userId,
      name: contactData.name || 'Subscriber',
      email: contactData.email,
      phone: contactData.phone || '',
      status: contactData.status || 'Active',
      subscription_end_date: contactData.subscription_end_date || contactData.subscriptionEndDate || defaultExpiry,
      createdAt: serverTimestamp(),
      tags: contactData.tags || ['manual']
    });
    return { id: docRef.id, ...contactData };
  } catch (err) {
    console.error('Error adding contact to Firestore:', err);
    throw err;
  }
}

export async function importContactsBatch(userId, contactsArray) {
  try {
    if (!userId) throw new Error("userId is required");
    const colRef = collection(db, 'contacts');
    const defaultExpiry = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const promises = contactsArray.map(contact =>
      addDoc(colRef, {
        userId,
        name: contact.name || 'Subscriber',
        email: contact.email,
        phone: contact.phone || '',
        status: contact.status || 'Active',
        subscription_end_date: contact.subscription_end_date || contact.subscriptionEndDate || defaultExpiry,
        createdAt: serverTimestamp(),
        tags: contact.tags || ['csv_import']
      })
    );
    await Promise.all(promises);
  } catch (err) {
    console.error('Error batch importing contacts to Firestore:', err);
    throw err;
  }
}

export async function updateContact(id, contactData) {
  try {
    const docRef = doc(db, 'contacts', id);
    await updateDoc(docRef, {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || '',
      status: contactData.status || 'Active',
      subscription_end_date: contactData.subscription_end_date || contactData.subscriptionEndDate || '',
      updatedAt: serverTimestamp()
    });
    return { id, ...contactData };
  } catch (err) {
    console.error('Error updating contact in Firestore:', err);
    throw err;
  }
}

export async function deleteContact(id) {
  try {
    const docRef = doc(db, 'contacts', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting contact from Firestore:', err);
    throw err;
  }
}

// ── 3. Campaigns Management ───────────────────────────────────
export async function getCampaigns(userId) {
  try {
    if (!userId) return [];
    const colRef = collection(db, 'campaigns');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const results = snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    return results.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('Error fetching campaigns from Firestore:', err);
    throw err;
  }
}

export async function createCampaign(userId, campaignData) {
  try {
    if (!userId) throw new Error("userId is required");
    const colRef = collection(db, 'campaigns');
    const dataToSave = {
      userId,
      title: campaignData.title || 'Untitled Campaign',
      subject: campaignData.subject || '',
      templateHtml: campaignData.templateHtml || '',
      recipientsCount: Number(campaignData.recipientsCount) || 0,
      audienceFilter: campaignData.audienceFilter || 'all',
      status: campaignData.status || 'Sent',
      resendBatchId: campaignData.resendBatchId || `batch_${Date.now()}`,
      createdAt: serverTimestamp(),
      sentAt: serverTimestamp(),
      stats: campaignData.stats || { opens: 0, clicks: 0, delivered: 0 }
    };
    const docRef = await addDoc(colRef, dataToSave);
    return { id: docRef.id, ...dataToSave };
  } catch (err) {
    console.error('Error creating campaign in Firestore:', err);
    throw err;
  }
}

export async function deleteCampaign(id) {
  try {
    const docRef = doc(db, 'campaigns', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting campaign from Firestore:', err);
    throw err;
  }
}

// ── 4. Automations Management ──────────────────────────────────
export async function getAutomations(userId) {
  try {
    if (!userId) return [];
    const colRef = collection(db, 'automations');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const results = snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    return results.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('Error fetching automations from Firestore:', err);
    throw err;
  }
}

export async function createAutomation(userId, automationData) {
  try {
    if (!userId) throw new Error("userId is required");
    const colRef = collection(db, 'automations');
    const dataToSave = {
      userId,
      title: automationData.title || 'Subscription Renewal Flow',
      triggerType: automationData.triggerType || 'renewal', // 'renewal' | 'recurring'
      intervalDays: Number(automationData.intervalDays) || 3,
      templateHtml: automationData.templateHtml || '',
      active: true,
      createdAt: serverTimestamp(),
      logs: [
        {
          timestamp: new Date().toISOString(),
          message: 'Automation pipeline active and listening to customer subscription expiration events.'
        }
      ]
    };
    const docRef = await addDoc(colRef, dataToSave);
    return { id: docRef.id, ...dataToSave };
  } catch (err) {
    console.error('Error creating automation in Firestore:', err);
    throw err;
  }
}

export async function toggleAutomationStatus(id, currentActive) {
  try {
    const docRef = doc(db, 'automations', id);
    await updateDoc(docRef, { active: !currentActive });
  } catch (err) {
    console.error('Error toggling automation status in Firestore:', err);
    throw err;
  }
}

export async function updateAutomation(id, automationData) {
  try {
    const docRef = doc(db, 'automations', id);
    await updateDoc(docRef, {
      title: automationData.title,
      triggerType: automationData.triggerType,
      intervalDays: Number(automationData.intervalDays),
      active: automationData.active !== undefined ? automationData.active : true,
      updatedAt: serverTimestamp()
    });
    return { id, ...automationData };
  } catch (err) {
    console.error('Error updating automation in Firestore:', err);
    throw err;
  }
}

export async function deleteAutomation(id) {
  try {
    const docRef = doc(db, 'automations', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting automation from Firestore:', err);
    throw err;
  }
}

// ── 5. Real Resend API Engine ─────────────────────────────────────

/**
 * Sends a single real email via Resend HTTP REST API
 */
export async function sendEmailViaResend({ to, subject, html, from, apiKey }) {
  const resendKey = apiKey || import.meta.env.VITE_RESEND_API_KEY || '';
  const sender = from || 'Creatify Store <onboarding@resend.dev>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error?.message || `Resend Error (${response.status})`);
    }
    return { success: true, id: data.id, data };
  } catch (err) {
    console.error('Resend API Dispatch Error:', err);
    throw err;
  }
}

/**
 * Sends campaign emails to multiple recipients with dynamic merge tag interpolation
 */
export async function sendCampaignViaResend({ recipients, subject, htmlContent, from, apiKey, onProgress }) {
  const results = [];
  let successCount = 0;
  let failCount = 0;
  const total = recipients.length;

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const nameVal = recipient.name || 'Subscriber';
    const firstNameVal = nameVal.split(' ')[0] || 'Subscriber';
    const subEndDate = recipient.subscription_end_date || recipient.subscriptionEndDate || '2026-12-31';

    // Dynamic merge tag substitution
    const personalizedSubject = subject
      .replace(/{{name}}/g, nameVal)
      .replace(/{{first_name}}/g, firstNameVal);

    const personalizedHtml = htmlContent
      .replace(/{{name}}/g, nameVal)
      .replace(/{{first_name}}/g, firstNameVal)
      .replace(/{{email}}/g, recipient.email)
      .replace(/{{subscription_end_date}}/g, subEndDate)
      .replace(/{{discount_code}}/g, 'VIP-2026');

    try {
      const dispatchRes = await sendEmailViaResend({
        to: recipient.email,
        subject: personalizedSubject,
        html: personalizedHtml,
        from,
        apiKey
      });

      results.push({ email: recipient.email, status: 'sent', id: dispatchRes.id });
      successCount++;
    } catch (err) {
      results.push({ email: recipient.email, status: 'failed', error: err.message });
      failCount++;
    }

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100)
      });
    }
  }

  const resendBatchId = results.find(r => r.id)?.id || `batch_${Date.now()}`;

  return {
    success: successCount > 0,
    total,
    successCount,
    failCount,
    results,
    resendBatchId
  };
}
