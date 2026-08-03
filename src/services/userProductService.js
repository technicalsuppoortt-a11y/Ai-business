import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const USER_PRODUCTS_COL = 'user_products';

export const getUserProducts = async (userId) => {
  if (!userId) return [];
  try {
    const colRef = collection(db, USER_PRODUCTS_COL);
    const q = query(colRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    return results.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error fetching user products:', error);
    return [];
  }
};

export const addUserProduct = async (userId, product) => {
  if (!userId || !product.id) return;
  try {
    const docRef = doc(db, USER_PRODUCTS_COL, product.id);
    await setDoc(docRef, {
      ...product,
      userId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding user product:', error);
  }
};

export const updateUserProduct = async (userId, productId, updates) => {
  if (!userId || !productId) return;
  try {
    const docRef = doc(db, USER_PRODUCTS_COL, productId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user product:', error);
  }
};

export const deleteUserProduct = async (userId, productId) => {
  if (!userId || !productId) return;
  try {
    const docRef = doc(db, USER_PRODUCTS_COL, productId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting user product:', error);
  }
};
