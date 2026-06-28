import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { HERO_SECTIONS } from './seedPart8_landingContent';
import { PROBLEM_SECTIONS, OFFER_SECTIONS } from './seedPart8b_landingContent';
import { PROOF_SECTIONS, CTA_SECTIONS } from './seedPart8c_landingContent';

const COL_LANDING_MATRIX = 'tc_landing_content_matrix';

export const seedLandingContentMatrix = async () => {
  console.log('Seeding Landing Content Matrix...');
  try {
    await setDoc(doc(db, COL_LANDING_MATRIX, 'hero_sections'), HERO_SECTIONS);
    await setDoc(doc(db, COL_LANDING_MATRIX, 'problem_sections'), PROBLEM_SECTIONS);
    await setDoc(doc(db, COL_LANDING_MATRIX, 'offer_sections'), OFFER_SECTIONS);
    await setDoc(doc(db, COL_LANDING_MATRIX, 'proof_sections'), PROOF_SECTIONS);
    await setDoc(doc(db, COL_LANDING_MATRIX, 'cta_sections'), CTA_SECTIONS);
    console.log('✅ Landing Content Matrix seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding Landing Content Matrix:', error);
  }
};
