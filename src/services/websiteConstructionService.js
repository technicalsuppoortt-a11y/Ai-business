/**
 * websiteConstructionService.js
 * ====================================
 * Pure Firebase Firestore Reader & Writer Service
 * Path in Firestore: /website-construction/step2
 * ZERO Hardcoded Payload / Local Static Data
 * ====================================
 */

import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const STEP2_DOC_REF = doc(db, 'website-construction', 'step2');

/**
 * Pure Firestore Reader: Reads /website-construction/step2 directly from Firestore.
 * Returns null if the document does not exist in the database.
 */
export const getStep2Data = async () => {
  try {
    const snap = await getDoc(STEP2_DOC_REF);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error('Error reading Step 2 document from Firestore:', error);
    throw error;
  }
};

/**
 * Pure Firestore Real-time Subscriber: Listens to /website-construction/step2 via onSnapshot.
 * Emits raw snapshot.data() or null if document is not present in Firestore.
 */
export const subscribeStep2Data = (onDataCallback, onErrorCallback) => {
  const unsubscribe = onSnapshot(
    STEP2_DOC_REF,
    (snapshot) => {
      if (snapshot.exists()) {
        onDataCallback(snapshot.data());
      } else {
        onDataCallback(null);
      }
    },
    (error) => {
      console.error('Firestore subscription error for /website-construction/step2:', error);
      if (onErrorCallback) onErrorCallback(error);
    }
  );

  return unsubscribe;
};

/**
 * Pure Firestore Gateway Status Mutator: Updates payment gateway state using updateDoc.
 */
export const updateGatewayStatus = async (gatewayId, isEnabled) => {
  try {
    const currentData = await getStep2Data();
    if (!currentData || !currentData.paymentGateways) return false;

    const updatedGateways = (currentData.paymentGateways.gateways || []).map((g) => {
      if (g.id === gatewayId) return { ...g, enabled: isEnabled };
      return g;
    });

    await updateDoc(STEP2_DOC_REF, {
      'paymentGateways.gateways': updatedGateways,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error(`Error updating gateway status for ${gatewayId} in Firestore:`, error);
    throw error;
  }
};

/**
 * Pure Firestore VAT Status Mutator: Updates VAT tax configuration using updateDoc.
 */
export const updateVatStatus = async (isEnabled) => {
  try {
    await updateDoc(STEP2_DOC_REF, {
      'currencyAndTaxes.vatItem.enabled': isEnabled,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error updating VAT status in Firestore:', error);
    throw error;
  }
};

// Aliases for backwards compatibility
export const seedAndSubscribeStep2Data = subscribeStep2Data;
export const updateStep2Firestore = async (updatedData) => {
  try {
    await setDoc(STEP2_DOC_REF, updatedData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating Step 2 Firestore:', error);
    throw error;
  }
};
