import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

// Generic fetch all docs from a collection
async function fetchCollection(name) {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
}

// Fetch docs filtered by niche
async function fetchByNiche(colName, niche) {
  const all = await fetchCollection(colName);
  return all.filter(doc => {
    const niches = doc.niches || [];
    return niches.includes('all') || niches.includes(niche);
  });
}

// ===== PUBLIC API =====

export async function getCategories() {
  return fetchCollection('categories');
}

export async function getHooks(niche) {
  return niche ? fetchByNiche('hooks', niche) : fetchCollection('hooks');
}

export async function getOffers(niche) {
  const all = await fetchCollection('offers');
  if (!niche) return all;
  return all.filter(o => {
    const bf = o.bestFor || [];
    return bf.includes('all') || bf.includes(niche);
  });
}

export async function getBrandNames(niche) {
  const all = await fetchCollection('brand_names');
  if (!niche) return all;
  return all.filter(n => {
    const niches = n.niches || [];
    return niches.includes(niche);
  });
}

export async function getContentFrameworks(niche) {
  const all = await fetchCollection('content_frameworks');
  if (!niche) return all;
  return all.filter(c => {
    const niches = c.niches || [];
    return niches.includes('all') || niches.includes(niche);
  });
}

export async function getAdStrategies(niche) {
  const all = await fetchCollection('ad_strategies');
  if (!niche) return all;
  return all.filter(a => {
    const niches = a.niches || [];
    return niches.includes('all') || niches.includes(niche);
  });
}

export async function getGrowthStrategies(niche) {
  const all = await fetchCollection('growth_strategies');
  if (!niche) return all;
  return all.filter(g => {
    const bf = g.bestFor || [];
    return bf.includes('all') || bf.includes(niche);
  });
}

export async function getCaseStudies(niche) {
  const all = await fetchCollection('case_studies');
  if (!niche) return all;
  return all.filter(c => c.niche === niche);
}

export async function getPsychologyTriggers() {
  return fetchCollection('psychology_triggers');
}
