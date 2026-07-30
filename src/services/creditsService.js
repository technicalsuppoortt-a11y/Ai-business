import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';

/**
 * Platform config document for storing Master OpenAI Key
 */
const PLATFORM_CONFIG_REF = doc(db, 'platform', 'config');

export async function saveAdminOpenAiKey(key) {
  try {
    await setDoc(PLATFORM_CONFIG_REF, { adminOpenAiKey: key }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving admin key:", error);
    return false;
  }
}

export async function getAdminOpenAiKey() {
  try {
    const snap = await getDoc(PLATFORM_CONFIG_REF);
    if (snap.exists()) {
      return snap.data().adminOpenAiKey || '';
    }
  } catch (error) {
    console.error("Error fetching admin key:", error);
  }
  return '';
}

/**
 * User-specific operations
 */

export async function getUserPersonalKey(uid) {
  if (!uid) return '';
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data().personalOpenAiKey || '';
    }
  } catch (error) {
    console.error("Error fetching personal key:", error);
  }
  return '';
}

export async function saveUserPersonalKey(uid, key) {
  if (!uid) return false;
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { personalOpenAiKey: key }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving personal key:", error);
    return false;
  }
}

export async function getUserCredits(uid) {
  if (!uid) return 0;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      // Ensure Free Plan defaults to 20 if undefined
      if (data.credits === undefined) {
        return 20; 
      }
      return data.credits;
    }
  } catch (error) {
    console.error("Error fetching credits:", error);
  }
  return 0; // Default if completely not found
}

export async function deductCredit(uid) {
  if (!uid) return false;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      credits: increment(-1)
    });
    return true;
  } catch (error) {
    console.error("Error deducting credit:", error);
    return false;
  }
}

export async function refundCredit(uid) {
  if (!uid) return false;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      credits: increment(1)
    });
    return true;
  } catch (error) {
    console.error("Error refunding credit:", error);
    return false;
  }
}

export async function resetMonthlyCredits(uid, newCreditsAmount) {
  if (!uid) return false;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      credits: newCreditsAmount
    });
    return true;
  } catch (error) {
    console.error("Error resetting credits:", error);
    return false;
  }
}

export async function assignPlanToUser(uid, selectedPlan) {
  if (!uid || !selectedPlan) return false;
  try {
    const monthlyCredits = selectedPlan.monthlyCredits !== undefined ? selectedPlan.monthlyCredits : 20;
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      planId: String(selectedPlan.id),
      planName: selectedPlan.name || 'Free',
      credits: monthlyCredits
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error assigning plan:", error);
    return false;
  }
}
