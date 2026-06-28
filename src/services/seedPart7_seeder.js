import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TEMPLATES_DATA_PART_1, WEBSITE_TEMPLATES_COLLECTION } from './seedPart7_templates';
import { TEMPLATES_DATA_PART_2 } from './seedPart7b_templates';

export const seedGalleryTemplates = async () => {
  console.log("Seeding Website Templates Gallery...");
  
  const allTemplates = [...TEMPLATES_DATA_PART_1, ...TEMPLATES_DATA_PART_2];

  for (const template of allTemplates) {
    await setDoc(doc(db, WEBSITE_TEMPLATES_COLLECTION, template.id), template);
  }

  console.log("Website Templates Gallery seeded successfully!");
};
