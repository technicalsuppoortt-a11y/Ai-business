import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Notebook,
  ListTodo,
  Lightbulb,
  FileText,
  Star,
  Trash2,
  Edit3,
  Plus,
  Search,
  Grid,
  List as ListIcon,
  Pin,
  Lock,
  Unlock,
  Filter,
  CheckCircle2,
  Save,
  GripVertical,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikethroughIcon,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  List as ListUnordered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  CheckSquare,
  Code as CodeIcon,
  Quote as QuoteIcon,
  Sparkles,
  Maximize2,
  Minimize2,
  Clock,
  Calendar,
  Tag as TagIcon,
  Check,
  X,
  FileCode,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  FolderPlus,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import './SmartNotebook.css';

// Glassmorphic Professional Custom Dropdown Component
function PlannerCustomDropdown({ value, onChange, options, label, icon: Icon, placeholder, lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => String(o.value) === String(value)) || options[0];

  return (
    <div className="lpc-dropdown-container" ref={dropdownRef}>
      {label && (
        <label className="lpc-label">
          {Icon && <Icon size={13} color="#818CF8" strokeWidth={1.5} />}
          <span>{label}</span>
        </label>
      )}
      
      <div 
        className={`sn-custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} color="#94A3B8" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="sn-custom-select-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {options.map(opt => (
              <div
                key={String(opt.value)}
                className={`sn-custom-select-option ${String(opt.value) === String(value) ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && <Check size={13} color="#6366F1" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom Glassmorphic Topbar Filter Dropdown Component
function PlannerFilterCategoryDropdown({ value, onChange, options, lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => String(o.value) === String(value)) || options[0];

  return (
    <div className="lpc-dropdown-container" ref={dropdownRef} style={{ width: 'auto', minWidth: '150px' }}>
      <div 
        className={`sn-filter-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TagIcon size={13} color="#818CF8" />
          <span>{selectedOption?.label}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} color="#94A3B8" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="sn-filter-dropdown-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {options.map(opt => (
              <div
                key={String(opt.value)}
                className={`sn-filter-dropdown-option ${String(opt.value) === String(value) ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && <Check size={13} color="#6366F1" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import useToolCache from "../../../hooks/useToolCache";

export default function SmartNotebook() {
  const { cached, isCached, isLoadedFromCloud, saveResult } = useToolCache('smart-notebook');
  const toast = useToast();
  const { state } = useApp();
  const { userData } = useAuth();
  const lang = state.language || 'ar';
  const isRtl = lang?.startsWith('ar');
  
  // Data State
  const [items, setItems] = useState(cached?.items ?? []);
  const [activeNoteId, setActiveNoteId] = useState(null);
  
  // 4 Main Tab Architecture: 'tasks' | 'ideas' | 'notes' | 'favorites'
  const [activeTab, setActiveTab] = useState(cached?.activeTab ?? 'tasks');
  
  // Tasks Sub-Tab: 'active' | 'completed'
  const [taskSubTab, setTaskSubTab] = useState(cached?.taskSubTab ?? 'active');
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all'); // 'all' | category name
  
  // Drag and Drop States for 2D Grid / List Reordering
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Custom Dynamic Categories (Persisted with Firebase)
  const [customTaskCategories, setCustomTaskCategories] = useState(cached?.customTaskCategories ?? ['Work', 'Home', 'General']);
  const [customIdeaCategories, setCustomIdeaCategories] = useState(cached?.customIdeaCategories ?? ['Project', 'Travel', 'Content']);
  const [customNoteCategories, setCustomNoteCategories] = useState(cached?.customNoteCategories ?? ['Work', 'Personal', 'Study']);
  
  // New Category Modals State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryTarget, setCategoryTarget] = useState('notes'); // 'tasks' | 'ideas' | 'notes'
  const [newCategoryName, setNewCategoryName] = useState('');

  // Custom Main Tabs State
  const [customTabs, setCustomTabs] = useState(cached?.customTabs ?? []);
  const [isTabModalOpen, setIsTabModalOpen] = useState(false);
  const [editingTabId, setEditingTabId] = useState(null);
  const [newTabName, setNewTabName] = useState('');

  // Item Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState('task'); // 'task' | 'idea' | 'note'
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('General');
  const [newItemPriority, setNewItemPriority] = useState('medium'); // 'high' | 'medium' | 'low'
  const [newItemContent, setNewItemContent] = useState('');

  // UI & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Active Note Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [notePriority, setNotePriority] = useState('low');
  const [tags, setTags] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved'

  // Delete Modals
  const [toastMessage, setToastMessage] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const hydratedRef = useRef(false);

  // 1. Hydrate state asynchronously when cache loads
  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.activeTab !== undefined) setActiveTab(cached.activeTab);
        if (cached.taskSubTab !== undefined) setTaskSubTab(cached.taskSubTab);
        if (cached.items !== undefined) setItems(cached.items);
        if (cached.customTaskCategories !== undefined) setCustomTaskCategories(cached.customTaskCategories);
        if (cached.customIdeaCategories !== undefined) setCustomIdeaCategories(cached.customIdeaCategories);
        if (cached.customNoteCategories !== undefined) setCustomNoteCategories(cached.customNoteCategories);
        if (cached.customTabs !== undefined) setCustomTabs(cached.customTabs);
      }
    }
  }, [isLoadedFromCloud, cached]);

  // 2. Safe Auto-save (only runs after hydration)
  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    
    const timeout = setTimeout(() => {
      saveResult({ activeTab, taskSubTab, items, customTaskCategories, customIdeaCategories, customNoteCategories, customTabs });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, activeTab, taskSubTab, items, customTaskCategories, customIdeaCategories, customNoteCategories, customTabs]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Items & Custom Categories from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.uid) return;
      setIsLoading(true);
      try {
        // Fetch Items
        const notesRef = collection(db, 'users', userData.uid, 'notebooks');
        const q = query(notesRef, orderBy('updatedAt', 'desc'));
        const snap = await getDocs(q);
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(loaded);

        // Fetch Custom Categories Settings
        const catDocRef = doc(db, 'users', userData.uid, 'planner_settings', 'categories');
        const catSnap = await getDoc(catDocRef);
        if (catSnap.exists()) {
          const catData = catSnap.data();
          if (Array.isArray(catData.taskCategories) && catData.taskCategories.length > 0) {
            setCustomTaskCategories(catData.taskCategories);
          }
          if (Array.isArray(catData.ideaCategories) && catData.ideaCategories.length > 0) {
            setCustomIdeaCategories(catData.ideaCategories);
          }
          if (Array.isArray(catData.noteCategories) && catData.noteCategories.length > 0) {
            setCustomNoteCategories(catData.noteCategories);
          }
        }

        // Fetch Custom Main Tabs Settings
        const tabsDocRef = doc(db, 'users', userData.uid, 'planner_settings', 'tabs');
        const tabsSnap = await getDoc(tabsDocRef);
        if (tabsSnap.exists()) {
          const tabsData = tabsSnap.data();
          if (Array.isArray(tabsData.tabs)) {
            setCustomTabs(tabsData.tabs);
          }
        }
      } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userData]);

  // Set Active Note Data to Rich Text Editor Canvas
  useEffect(() => {
    if (activeNoteId) {
      const item = items.find(n => n.id === activeNoteId);
      if (item) {
        setTitle(item.title || '');
        setContent(item.content || '');
        setIsReadOnly(item.isLocked || false);
        setNotePriority(item.priority || 'medium');
        setTags(item.tags || []);
        setSelectedColor(item.colorAccent || '#6366F1');
        if (editorRef.current && editorRef.current.innerHTML !== item.content) {
          editorRef.current.innerHTML = item.content || '';
        }
      }
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      if (editorRef.current) editorRef.current.innerHTML = '';
    }
  }, [activeNoteId, items]);

  // Auto-Save Logic to Firestore
  useEffect(() => {
    if (!activeNoteId || !userData?.uid || isReadOnly) return;
    
    setSaveStatus('saving');

    const handleSave = async () => {
      try {
        const noteRef = doc(db, 'users', userData.uid, 'notebooks', activeNoteId);
        await setDoc(noteRef, {
          title,
          content,
          priority: notePriority,
          tags,
          colorAccent: selectedColor,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        setItems(prev => prev.map(n => n.id === activeNoteId ? { ...n, title, content, priority: notePriority, tags, colorAccent: selectedColor } : n));
        setSaveStatus('saved');
      } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    }
    };

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(handleSave, 1200);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [title, content, notePriority, tags, selectedColor, activeNoteId, userData, isReadOnly]);

  // Explicit Manual Save Action Button
  const handleManualSave = async () => {
    if (!activeNoteId || !userData?.uid) return;
    setSaveStatus('saving');
    try {
      const noteRef = doc(db, 'users', userData.uid, 'notebooks', activeNoteId);
      await setDoc(noteRef, {
        title,
        content,
        priority: notePriority,
        tags,
        colorAccent: selectedColor,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setItems(prev => prev.map(n => n.id === activeNoteId ? { ...n, title, content, priority: notePriority, tags, colorAccent: selectedColor } : n));
      setSaveStatus('saved');
      showToast(lang === 'en' ? 'Saved successfully!' : 'تم الحفظ بنجاح!');
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    }
  };

  // Create Item Handler (Task, Idea, Note, Custom)
  const handleCreateNewItem = async () => {
    if (!userData?.uid || !newItemTitle.trim()) return;
    const newId = Date.now().toString();
    const itemType = createType; // 'task' | 'idea' | 'note' | 'custom'
    const isCustomTab = customTabs.some(t => t.id === activeTab);
    
    const newItem = {
      id: newId,
      title: newItemTitle.trim(),
      content: newItemContent.trim(),
      type: isCustomTab ? 'custom' : itemType,
      tabId: isCustomTab ? activeTab : null,
      category: newItemCategory || (itemType === 'task' ? customTaskCategories[0] : itemType === 'idea' ? customIdeaCategories[0] : customNoteCategories[0]),
      priority: newItemPriority || 'medium',
      isCompleted: false,
      isFavorite: false,
      isPinned: false,
      isLocked: false,
      tags: [],
      colorAccent: '#6366F1',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    setItems([newItem, ...items]);
    setIsCreateModalOpen(false);
    setNewItemTitle('');
    setNewItemContent('');

    // Toast for Tasks & General Items
    showToast(
      itemType === 'task' 
        ? (lang === 'en' ? 'New task created successfully!' : 'تم إنشاء المهمة بنجاح!')
        : itemType === 'idea'
        ? (lang === 'en' ? 'Idea recorded successfully!' : 'تم تسجيل الفكرة بنجاح!')
        : (lang === 'en' ? 'Note created successfully!' : 'تم إنشاء الملاحظة بنجاح!')
    );

    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', newId), newItem);
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    }
  };

  // Toggle Favorite Star Handler from Outer Card
  const toggleFavorite = async (e, item) => {
    if (e) e.stopPropagation();
    const newStatus = !item.isFavorite;
    setItems(prev => prev.map(n => n.id === item.id ? { ...n, isFavorite: newStatus } : n));
    showToast(newStatus ? (lang === 'en' ? 'Added to Favorites ⭐' : 'أضيفت للمفضلة ⭐') : (lang === 'en' ? 'Removed from Favorites' : 'تمت الإزالة من المفضلة'));

    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', item.id), { isFavorite: newStatus }, { merge: true });
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    }
  };

  // Toggle Task Completion Handler (With Success Toast)
  const toggleTaskCompleted = async (e, item) => {
    if (e) e.stopPropagation();
    const newStatus = !item.isCompleted;
    setItems(prev => prev.map(n => n.id === item.id ? { ...n, isCompleted: newStatus } : n));
    
    showToast(
      newStatus 
        ? (lang === 'en' ? 'Task completed successfully! 🎉' : 'تم إنجاز المهمة بنجاح! 🎉') 
        : (lang === 'en' ? 'Task restored to active tasks' : 'تمت إعادة المهمة للمهام النشطة')
    );

    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', item.id), { isCompleted: newStatus, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    }
  };

  // Confirm Delete Handler
  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id;
    setItems(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
    setItemToDelete(null);
    showToast(lang === 'en' ? 'Item deleted' : 'تم الحذف');

    try {
      await deleteDoc(doc(db, 'users', userData.uid, 'notebooks', id));
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    }
  };

  // Handle Save Custom Tab (Add / Edit)
  const handleSaveTab = async () => {
    if (!newTabName.trim()) return;
    let updatedTabs = [...customTabs];
    if (editingTabId) {
      updatedTabs = updatedTabs.map(t => t.id === editingTabId ? { ...t, name: newTabName.trim() } : t);
    } else {
      updatedTabs.push({ id: `tab_${Date.now()}`, name: newTabName.trim() });
    }
    setCustomTabs(updatedTabs);
    setNewTabName('');
    setEditingTabId(null);
    setIsTabModalOpen(false);
    showToast(lang === 'en' ? 'Tab saved successfully!' : 'تم حفظ التبويب بنجاح!');

    if (userData?.uid) {
      try {
        await setDoc(doc(db, 'users', userData.uid, 'planner_settings', 'tabs'), {
          tabs: updatedTabs,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteTab = async (tabId) => {
    const updatedTabs = customTabs.filter(t => t.id !== tabId);
    setCustomTabs(updatedTabs);
    if (activeTab === tabId) setActiveTab('tasks');
    showToast(lang === 'en' ? 'Tab deleted' : 'تم حذف التبويب');

    if (userData?.uid) {
      try {
        await setDoc(doc(db, 'users', userData.uid, 'planner_settings', 'tabs'), {
          tabs: updatedTabs,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Add Custom Category Handler (WITH FIREBASE PERSISTENCE)
  const handleAddCustomCategory = async () => {
    if (!newCategoryName.trim()) return;
    const cat = newCategoryName.trim();
    let updatedTaskCats = [...customTaskCategories];
    let updatedIdeaCats = [...customIdeaCategories];
    let updatedNoteCats = [...customNoteCategories];

    if (categoryTarget === 'tasks') {
      if (!updatedTaskCats.includes(cat)) updatedTaskCats.push(cat);
      setCustomTaskCategories(updatedTaskCats);
      setNewItemCategory(cat);
    } else if (categoryTarget === 'ideas') {
      if (!updatedIdeaCats.includes(cat)) updatedIdeaCats.push(cat);
      setCustomIdeaCategories(updatedIdeaCats);
      setNewItemCategory(cat);
    } else {
      if (!updatedNoteCats.includes(cat)) updatedNoteCats.push(cat);
      setCustomNoteCategories(updatedNoteCats);
      setNewItemCategory(cat);
    }

    setNewCategoryName('');
    setIsCategoryModalOpen(false);
    showToast(lang === 'en' ? 'Category created & saved!' : 'تم إنشاء التصنيف وحفظه بنجاح!');

    // Persist Categories in Firestore
    if (userData?.uid) {
      try {
        await setDoc(doc(db, 'users', userData.uid, 'planner_settings', 'categories'), {
          taskCategories: updatedTaskCats,
          ideaCategories: updatedIdeaCats,
          noteCategories: updatedNoteCats,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    }
    }
  };

  // Editor Commands
  const execCommand = (cmd, value = null) => {
    if (isReadOnly) return;
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      setContent(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt(lang === 'en' ? 'Enter URL:' : 'أدخل رابط الموقع:');
    if (url) execCommand('createLink', url);
  };

  const insertImage = () => {
    const url = prompt(lang === 'en' ? 'Enter Image URL:' : 'أدخل رابط الصورة:');
    if (url) execCommand('insertImage', url);
  };

  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid rgba(255,255,255,0.15);">
        <thead>
          <tr style="background: rgba(255,255,255,0.05);">
            <th style="border: 1px solid rgba(255,255,255,0.15); padding: 8px;">Header 1</th>
            <th style="border: 1px solid rgba(255,255,255,0.15); padding: 8px;">Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid rgba(255,255,255,0.15); padding: 8px;">Data 1</td>
            <td style="border: 1px solid rgba(255,255,255,0.15); padding: 8px;">Data 2</td>
          </tr>
        </tbody>
      </table>
    `;
    execCommand('insertHTML', tableHtml);
  };

  const insertChecklistLine = () => {
    const checklistHtml = `<div style="display:flex; align-items:center; gap:8px; margin:4px 0;"><input type="checkbox" style="width:16px; height:16px; cursor:pointer;" /> <span>Checklist Item</span></div>`;
    execCommand('insertHTML', checklistHtml);
  };

  const insertCodeBlock = () => {
    const codeHtml = `<pre style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; font-family: monospace; border: 1px solid rgba(255,255,255,0.1);"><code>// Write code snippet here...</code></pre>`;
    execCommand('insertHTML', codeHtml);
  };

  // Filter Items based on Active Tab, Sub-Tab, Priority, Category, and Search Query
  const getFilteredItems = () => {
    return items.filter(item => {
      const matchSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.content || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      // Category Filter
      if (selectedCategoryFilter !== 'all' && (item.category || 'General') !== selectedCategoryFilter) {
        return false;
      }

      if (activeTab === 'favorites') {
        return item.isFavorite === true;
      }

      if (activeTab === 'tasks') {
        const isTaskType = item.type === 'task' || item.isChecklist || item.notebook === 'Check List';
        if (!isTaskType) return false;
        
        if (priorityFilter !== 'all' && (item.priority || 'medium') !== priorityFilter) {
          return false;
        }

        if (taskSubTab === 'completed') {
          return item.isCompleted === true;
        }
        return item.isCompleted !== true;
      }

      if (activeTab === 'ideas') {
        return item.type === 'idea' || item.notebook === 'Project Ideas';
      }

      if (activeTab === 'notes') {
        const isNoteType = item.type === 'note' || !item.type || item.type === 'default';
        return isNoteType;
      }

      const customTab = customTabs.find(t => t.id === activeTab);
      if (customTab) {
        return item.tabId === activeTab;
      }

      return true;
    });
  };

  const filteredList = getFilteredItems();

  // 2D HTML5 Drag & Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const sourceItem = filteredList[draggedIndex];
    const targetItem = filteredList[targetIndex];

    if (sourceItem && targetItem) {
      const sourceGlobalIdx = items.findIndex(i => i.id === sourceItem.id);
      const targetGlobalIdx = items.findIndex(i => i.id === targetItem.id);

      if (sourceGlobalIdx !== -1 && targetGlobalIdx !== -1) {
        const updated = [...items];
        const [moved] = updated.splice(sourceGlobalIdx, 1);
        updated.splice(targetGlobalIdx, 0, moved);
        setItems(updated);
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const textOnly = content.replace(/<[^>]+>/g, ' ').trim();
  const wordCount = textOnly.split(/\s+/).filter(w => w.length > 0).length;

  // Options for Dropdowns
  const priorityOptions = [
    { value: 'high', label: lang === 'en' ? '🔴 High / Urgent' : '🔴 عالية / عاجل' },
    { value: 'medium', label: lang === 'en' ? '🟡 Medium Priority' : '🟡 متوسطة الأهمية' },
    { value: 'low', label: lang === 'en' ? '🟢 Low Priority' : '🟢 منخفضة الأهمية' }
  ];

  const currentCategoryOptions = (createType === 'task' ? customTaskCategories : createType === 'idea' ? customIdeaCategories : customNoteCategories).map(cat => ({
    value: cat,
    label: cat
  }));

  const isCustomTabActive = customTabs.some(t => t.id === activeTab);
  const activeTabCategoryList = activeTab === 'ideas' ? customIdeaCategories : activeTab === 'notes' || isCustomTabActive ? customNoteCategories : customTaskCategories;

  const categoryFilterDropdownOptions = [
    { value: 'all', label: lang === 'en' ? 'All Categories' : 'كل التصنيفات' },
    ...activeTabCategoryList.map(cat => ({ value: cat, label: cat }))
  ];

  return (
    <div className={`sn-wrapper ${isFocusMode ? 'focus-mode' : ''} ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="sn-toast"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <Sparkles size={16} color="#6366F1" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ LEFT SIDEBAR (STRICTLY 4 CORE TABS) ═══════════════ */}
      {!isFocusMode && (
        <aside className={`sn-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Sidebar Header Title */}
          <div className="sn-sidebar-header">
            {!isSidebarCollapsed && (
              <div className="sn-sidebar-title">
                <Notebook size={20} color="#6366F1" />
                <span>{lang === 'en' ? 'The Comprehensive Planner' : 'سجل المهام والأفكار'}</span>
              </div>
            )}
            <button 
              className="sn-icon-btn"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? (lang === 'en' ? 'Expand Sidebar' : 'توسيع القائمة') : (lang === 'en' ? 'Collapse Sidebar' : 'طي القائمة')}
            >
              {isSidebarCollapsed ? (isRtl ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />) : (isRtl ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />)}
            </button>
          </div>

          {/* New Item Action Button (HIDDEN WHEN IN FAVORITES TAB) */}
          {activeTab !== 'favorites' && (
            <button 
              className="sn-primary-btn" 
              onClick={() => {
                const isCustom = customTabs.some(t => t.id === activeTab);
                setCreateType(activeTab === 'ideas' ? 'idea' : activeTab === 'notes' || isCustom ? 'note' : 'task');
                setNewItemCategory(activeTab === 'ideas' ? customIdeaCategories[0] : activeTab === 'notes' || isCustom ? customNoteCategories[0] : customTaskCategories[0]);
                setIsCreateModalOpen(true);
              }}
            >
              <Plus size={16} />
              {!isSidebarCollapsed && <span>{lang === 'en' ? 'Add Item' : 'إضافة جديدة'}</span>}
            </button>
          )}

          {/* Search Box */}
          {!isSidebarCollapsed && (
            <div className="sn-sidebar-search">
              <div className="sn-search-input-wrap">
                <Search size={14} />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  className="sn-search-input"
                  placeholder={lang === 'en' ? 'Search items...' : 'بحث سريع...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STRICT 4 MAIN CORE TABS */}
          <div className="sn-folders-list">
            {/* Tab 1: Tasks */}
            <div 
              className={`sn-folder-item ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tasks'); setActiveNoteId(null); setSelectedCategoryFilter('all'); }}
            >
              <div className="sn-folder-left">
                <ListTodo size={16} color="#6366F1" />
                {!isSidebarCollapsed && <span>{lang === 'en' ? 'Tasks' : 'قائمة المهام'}</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="sn-folder-badge">
                  {items.filter(i => (i.type === 'task' || i.isChecklist) && !i.isCompleted).length}
                </span>
              )}
            </div>

            {/* Tab 2: Ideas */}
            <div 
              className={`sn-folder-item ${activeTab === 'ideas' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ideas'); setActiveNoteId(null); setSelectedCategoryFilter('all'); }}
            >
              <div className="sn-folder-left">
                <Lightbulb size={16} color="#F59E0B" />
                {!isSidebarCollapsed && <span>{lang === 'en' ? 'Ideas' : 'الأفكار'}</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="sn-folder-badge">
                  {items.filter(i => i.type === 'idea' || i.notebook === 'Project Ideas').length}
                </span>
              )}
            </div>

            {/* Tab 3: Notes */}
            <div 
              className={`sn-folder-item ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => { setActiveTab('notes'); setActiveNoteId(null); setSelectedCategoryFilter('all'); }}
            >
              <div className="sn-folder-left">
                <FileText size={16} color="#10B981" />
                {!isSidebarCollapsed && <span>{lang === 'en' ? 'Notes' : 'الملاحظات'}</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="sn-folder-badge">
                  {items.filter(i => i.type === 'note' || !i.type).length}
                </span>
              )}
            </div>

            {/* Tab 4: Favorites */}
            <div 
              className={`sn-folder-item ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => { setActiveTab('favorites'); setActiveNoteId(null); setSelectedCategoryFilter('all'); }}
            >
              <div className="sn-folder-left">
                <Star size={16} color="#EC4899" fill="#EC4899" />
                {!isSidebarCollapsed && <span>{lang === 'en' ? 'Favorites' : 'المفضلة'}</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="sn-folder-badge">
                  {items.filter(i => i.isFavorite).length}
                </span>
              )}
            </div>

            {/* Custom Dynamic Tabs */}
            {customTabs.map(tab => (
              <div 
                key={tab.id}
                className={`sn-folder-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab.id); setActiveNoteId(null); setSelectedCategoryFilter('all'); }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div className="sn-folder-left">
                  <FolderPlus size={16} color="#6366F1" />
                  {!isSidebarCollapsed && <span>{tab.name}</span>}
                </div>
                {!isSidebarCollapsed && (
                  <div className="sn-folder-badge" style={{ background: 'transparent', padding: 0 }}>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', marginRight: '6px' }}
                      onClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); setNewTabName(tab.name); setIsTabModalOpen(true); }}
                      title={lang === 'en' ? 'Edit Tab' : 'تعديل التبويب'}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteTab(tab.id); }}
                      title={lang === 'en' ? 'Delete Tab' : 'حذف التبويب'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isSidebarCollapsed && (
            <button 
              className="sn-category-add-btn" 
              style={{ marginTop: '8px', borderStyle: 'dashed' }}
              onClick={() => { setEditingTabId(null); setNewTabName(''); setIsTabModalOpen(true); }}
            >
              <FolderPlus size={14} />
              <span>{lang === 'en' ? '+ Add New Tab' : '+ إضافة تبويب جديد'}</span>
            </button>
          )}

          {/* Quick Create Custom Category Trigger */}
          {!isSidebarCollapsed && activeTab !== 'favorites' && (
            <button
              className="sn-category-add-btn"
              onClick={() => {
                setCategoryTarget(activeTab === 'ideas' ? 'ideas' : activeTab === 'notes' ? 'notes' : 'tasks');
                setIsCategoryModalOpen(true);
              }}
            >
              <FolderPlus size={14} />
              <span>{lang === 'en' ? '+ Create Category' : '+ إنشاء تصنيف جديد'}</span>
            </button>
          )}

          {/* Scrollable Items List View (Sidebar with Professional Icons) */}
          {!isSidebarCollapsed && (
            <div className="sn-notes-scroll-list">
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'var(--text3)' }}>{lang === 'en' ? 'Loading...' : 'جاري التحميل...'}</div>
              ) : filteredList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'var(--text3)' }}>{lang === 'en' ? 'No items found' : 'لا توجد عناصر'}</div>
              ) : (
                filteredList.map(n => {
                  const isTask = n.type === 'task' || n.isChecklist;
                  const isIdea = n.type === 'idea';
                  return (
                    <div 
                      key={n.id} 
                      className={`sn-note-card ${activeNoteId === n.id ? 'active' : ''}`}
                      onClick={() => setActiveNoteId(n.id)}
                    >
                      <div className="sn-note-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flex: 1 }}>
                          {isTask ? (
                            <ListTodo size={13} color="#6366F1" flexShrink={0} />
                          ) : isIdea ? (
                            <Lightbulb size={13} color="#F59E0B" flexShrink={0} />
                          ) : (
                            <FileText size={13} color="#10B981" flexShrink={0} />
                          )}
                          <span className="sn-note-card-title">{n.title || (lang === 'en' ? 'Untitled' : 'بدون عنوان')}</span>
                        </div>

                        <div className="sn-card-actions">
                          <button className={`sn-card-action-btn ${n.isFavorite ? 'active' : ''}`} onClick={(e) => toggleFavorite(e, n)}>
                            <Star size={12} fill={n.isFavorite ? '#F59E0B' : 'none'} color={n.isFavorite ? '#F59E0B' : 'currentColor'} />
                          </button>
                          <button className="sn-card-action-btn" onClick={(e) => { e.stopPropagation(); setActiveNoteId(n.id); }}>
                            <Edit3 size={12} color="#6366F1" />
                          </button>
                          <button className="sn-card-action-btn" onClick={(e) => { e.stopPropagation(); setItemToDelete(n); }}>
                            <Trash2 size={12} color="#EF4444" />
                          </button>
                        </div>
                      </div>

                      <div className="sn-note-card-preview">
                        {(n.content || '').replace(/<[^>]+>/g, '').substring(0, 45)}...
                      </div>

                      <div className="sn-note-card-footer">
                        <span className="sn-card-cat-badge">{n.category || 'General'}</span>
                        {n.priority && (
                          <span className={`sn-priority-pill ${n.priority}`}>
                            {n.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </aside>
      )}

      {/* ═══════════════ RIGHT MAIN EDITOR / GALLERY VIEW ═══════════════ */}
      <main className="sn-main-editor">
        {activeNoteId ? (
          <>
            {/* Editor Top Bar (PRESERVED) */}
            <div className="sn-editor-header">
              <div className="sn-editor-header-start">
                <button className="sn-icon-btn" onClick={() => setActiveNoteId(null)} title={lang === 'en' ? 'Back' : 'العودة'}>
                  {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                <button 
                  className={`sn-icon-btn ${isFocusMode ? 'active' : ''}`}
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  title={lang === 'en' ? 'Focus Mode' : 'وضع التركيز'}
                >
                  {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                <button 
                  className={`sn-icon-btn ${isReadOnly ? 'active' : ''}`}
                  onClick={() => setIsReadOnly(!isReadOnly)}
                >
                  {isReadOnly ? <Lock size={16} color="#EF4444" /> : <Unlock size={16} />}
                </button>
              </div>

              <div className="sn-editor-header-end">
                <div className="sn-save-status">
                  <Check size={14} />
                  <span>{saveStatus === 'saving' ? (lang === 'en' ? 'Saving...' : 'جاري الحفظ...') : (lang === 'en' ? 'Auto-saved' : 'تم الحفظ تلقائياً')}</span>
                </div>

                <div className="sn-reading-stats">
                  <span>{wordCount} {lang === 'en' ? 'words' : 'كلمة'}</span>
                </div>

                {/* Explicit Professional Save Button */}
                <button
                  onClick={handleManualSave}
                  className="wc-btn wc-btn-primary"
                  style={{ padding: '6px 16px', fontSize: '11.5px', borderRadius: '10px' }}
                >
                  <Save size={13} />
                  <span>{lang === 'en' ? 'Save' : 'حفظ'}</span>
                </button>
              </div>
            </div>

            {/* Rich Text Toolbar (PRESERVED) */}
            {!isReadOnly && (
              <div className="sn-format-bar">
                <button className="sn-format-btn" onClick={() => execCommand('bold')} title="Bold"><BoldIcon size={14} /></button>
                <button className="sn-format-btn" onClick={() => execCommand('italic')} title="Italic"><ItalicIcon size={14} /></button>
                <button className="sn-format-btn" onClick={() => execCommand('underline')} title="Underline"><UnderlineIcon size={14} /></button>
                <button className="sn-format-btn" onClick={() => execCommand('strikethrough')} title="Strikethrough"><StrikethroughIcon size={14} /></button>

                <span className="sn-format-divider" />

                <button className="sn-format-btn" onClick={() => execCommand('formatBlock', 'H1')}>H1</button>
                <button className="sn-format-btn" onClick={() => execCommand('formatBlock', 'H2')}>H2</button>
                <button className="sn-format-btn" onClick={() => execCommand('formatBlock', 'H3')}>H3</button>

                <span className="sn-format-divider" />

                <button className="sn-format-btn" onClick={() => execCommand('insertUnorderedList')} title="Bullet List"><ListUnordered size={14} /></button>
                <button className="sn-format-btn" onClick={() => execCommand('insertOrderedList')} title="Numbered List"><ListOrdered size={14} /></button>

                <span className="sn-format-divider" />

                <button className="sn-format-btn" onClick={() => execCommand('justifyLeft')} title="Align Left"><AlignLeft size={14} /></button>
                <button className="sn-format-btn" onClick={() => execCommand('justifyCenter')} title="Align Center"><AlignCenter size={14} /></button>
                <button className="sn-format-btn" onClick={() => execCommand('justifyRight')} title="Align Right"><AlignRight size={14} /></button>

                <span className="sn-format-divider" />

                <button className="sn-format-btn" onClick={insertLink} title="Insert Link"><LinkIcon size={14} /></button>
                <button className="sn-format-btn" onClick={insertImage} title="Insert Image"><ImageIcon size={14} /></button>
                <button className="sn-format-btn" onClick={insertTable} title="Insert Table"><TableIcon size={14} /></button>
                <button className="sn-format-btn" onClick={insertChecklistLine} title="Insert Checklist Item"><CheckSquare size={14} /></button>
                <button className="sn-format-btn" onClick={insertCodeBlock} title="Insert Code Block"><CodeIcon size={14} /></button>
              </div>
            )}

            {/* Canvas Area (PRESERVED) */}
            <div className="sn-canvas-area">
              <input 
                type="text" 
                className="sn-title-input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === 'en' ? 'Title...' : 'العنوان...'}
                disabled={isReadOnly}
              />

              <div className="sn-content-canvas"
                ref={editorRef}
                contentEditable={!isReadOnly}
                onInput={() => setContent(editorRef.current?.innerHTML || '')}
                placeholder={lang === 'en' ? 'Start writing...' : 'ابدأ الكتابة...'}
              />
            </div>
          </>
        ) : (
          /* GALLERY / GRID VIEW AREA */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Gallery Top Filter & Control Header */}
            <div className="sn-gallery-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {activeTab === 'tasks' && <ListTodo size={20} color="#6366F1" />}
                {activeTab === 'ideas' && <Lightbulb size={20} color="#F59E0B" />}
                {activeTab === 'notes' && <FileText size={20} color="#10B981" />}
                {activeTab === 'favorites' && <Star size={20} color="#EC4899" fill="#EC4899" />}
                
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                  {activeTab === 'tasks' ? (lang === 'en' ? 'Tasks List' : 'قائمة المهام') :
                   activeTab === 'ideas' ? (lang === 'en' ? 'Ideas Space' : 'سجل الأفكار') :
                   activeTab === 'notes' ? (lang === 'en' ? 'Notes' : 'الملاحظات') :
                   activeTab === 'favorites' ? (lang === 'en' ? 'Favorites' : 'المفضلة') :
                   customTabs.find(t => t.id === activeTab)?.name || 'Custom Tab'}
                </h3>
              </div>

              {/* View Switcher, Custom Category Filter & Add Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Professional Custom Category Filter Dropdown */}
                <PlannerFilterCategoryDropdown
                  value={selectedCategoryFilter}
                  onChange={setSelectedCategoryFilter}
                  options={categoryFilterDropdownOptions}
                  lang={lang}
                />

                <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 10, padding: 2 }}>
                  <button className={`sn-icon-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                    <Grid size={15} />
                  </button>
                  <button className={`sn-icon-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                    <ListIcon size={15} />
                  </button>
                </div>

                {activeTab !== 'favorites' && (
                  <button 
                    className="sn-primary-btn" 
                    style={{ width: 'auto', margin: 0, padding: '8px 16px' }}
                    onClick={() => {
                      const isCustom = customTabs.some(t => t.id === activeTab);
                      setCreateType(activeTab === 'ideas' ? 'idea' : activeTab === 'notes' || isCustom ? 'note' : 'task');
                      setNewItemCategory(activeTab === 'ideas' ? customIdeaCategories[0] : activeTab === 'notes' || isCustom ? customNoteCategories[0] : customTaskCategories[0]);
                      setIsCreateModalOpen(true);
                    }}
                  >
                    <Plus size={14} />
                    <span>{lang === 'en' ? 'Add Item' : 'إضافة جديدة'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1 SPECIFIC SUB-BAR: TASKS SUB-TABS & PRIORITY FILTER */}
            {activeTab === 'tasks' && (
              <div className="sn-tasks-subbar">
                {/* Active vs Completed Tasks Sub-Tab */}
                <div className="sn-subtab-group">
                  <button
                    className={`sn-subtab-btn ${taskSubTab === 'active' ? 'active' : ''}`}
                    onClick={() => setTaskSubTab('active')}
                  >
                    <ListTodo size={13} />
                    <span>{lang === 'en' ? 'Active Tasks' : 'المهام النشطة'}</span>
                  </button>

                  <button
                    className={`sn-subtab-btn ${taskSubTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setTaskSubTab('completed')}
                  >
                    <CheckCircle2 size={13} color="#10B981" />
                    <span>{lang === 'en' ? 'Completed Tasks' : 'المهام المنجزة'}</span>
                  </button>
                </div>

                {/* Priority Filter Bar */}
                <div className="sn-priority-filter-bar">
                  <Filter size={13} color="#818CF8" />
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8' }}>
                    {lang === 'en' ? 'Priority:' : 'الأهمية:'}
                  </span>
                  {['all', 'high', 'medium', 'low'].map(p => (
                    <button
                      key={p}
                      className={`sn-p-filter-chip ${priorityFilter === p ? 'active' : ''} ${p}`}
                      onClick={() => setPriorityFilter(p)}
                    >
                      {p === 'all' ? (lang === 'en' ? 'All' : 'الكل') :
                       p === 'high' ? (lang === 'en' ? 'High / Urgent' : 'عالية / عاجل') :
                       p === 'medium' ? (lang === 'en' ? 'Medium' : 'متوسطة') :
                       (lang === 'en' ? 'Low' : 'منخفضة')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* REFACTORED 2D GRID/LIST CARD CONTAINER WITH HTML5 + FRAMER MOTION LAYOUT */}
            {filteredList.length > 0 ? (
              <div className={viewMode === 'grid' ? "sn-gallery-grid-reorder" : "sn-gallery-list-reorder"}>
                {filteredList.map((n, idx) => (
                  <motion.div 
                    key={n.id}
                    layout
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`sn-planner-card ${draggedIndex === idx ? 'is-dragging' : ''} ${dragOverIndex === idx ? 'drag-over' : ''}`}
                    whileHover={{ y: -2 }}
                  >
                    {/* Top Header Rail: Drag handle & Badges */}
                    <div className="sn-card-header-rail">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <div 
                          className="sn-card-drag-handle"
                          title={lang === 'en' ? 'Drag card to swap position' : 'اسحب الكارت لتغيير الترتيب'}
                        >
                          <GripVertical size={15} color="#818CF8" />
                        </div>

                        {(activeTab === 'tasks' || n.type === 'task') && (
                          <button
                            type="button"
                            onClick={(e) => toggleTaskCompleted(e, n)}
                            className={`sn-task-checkbox ${n.isCompleted ? 'checked' : ''}`}
                            title={n.isCompleted ? (lang === 'en' ? 'Mark active' : 'إعادة كـ نشطة') : (lang === 'en' ? 'Mark completed' : 'إنجاز المهمة')}
                          >
                            {n.isCompleted && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                          </button>
                        )}

                        <span className="sn-card-category-badge">{n.category || 'General'}</span>
                        
                        {n.priority && (
                          <span className={`sn-priority-pill ${n.priority}`}>
                            {n.priority === 'high' ? (lang === 'en' ? 'Urgent' : 'عاجل') :
                             n.priority === 'medium' ? (lang === 'en' ? 'Mid' : 'متوسطة') :
                             (lang === 'en' ? 'Low' : 'منخفضة')}
                          </span>
                        )}
                      </div>

                      {/* 3 Quick Action Icons (Star, Edit, Delete) */}
                      <div className="sn-card-quick-actions">
                        <button 
                          className={`sn-action-icon-btn star ${n.isFavorite ? 'active' : ''}`} 
                          onClick={(e) => toggleFavorite(e, n)}
                          title={n.isFavorite ? (lang === 'en' ? 'Starred' : 'في المفضلة') : (lang === 'en' ? 'Add to Favorites' : 'إضافة للمفضلة')}
                        >
                          <Star size={13} fill={n.isFavorite ? '#F59E0B' : 'none'} color={n.isFavorite ? '#F59E0B' : '#94A3B8'} />
                        </button>

                        <button 
                          className="sn-action-icon-btn edit" 
                          onClick={(e) => { e.stopPropagation(); setActiveNoteId(n.id); }}
                          title={lang === 'en' ? 'Edit Item' : 'تعديل العنصر'}
                        >
                          <Edit3 size={13} color="#818CF8" />
                        </button>

                        <button 
                          className="sn-action-icon-btn delete" 
                          onClick={(e) => { e.stopPropagation(); setItemToDelete(n); }}
                          title={lang === 'en' ? 'Delete Item' : 'حذف العنصر'}
                        >
                          <Trash2 size={13} color="#EF4444" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content Body Area */}
                    <div className="sn-card-body-area" onClick={() => setActiveNoteId(n.id)}>
                      <h4 className={`sn-card-title ${n.isCompleted ? 'completed-text' : ''}`}>
                        {n.title || (lang === 'en' ? 'Untitled' : 'بدون عنوان')}
                      </h4>

                      <p className="sn-card-snippet">
                        {(n.content || '').replace(/<[^>]+>/g, '') || (lang === 'en' ? 'No description...' : 'لا يوجد تفاصيل...')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* EMPTY STATE DISPLAY */
              <div className="sn-empty-planner-state">
                <Notebook size={44} color="#6366F1" style={{ opacity: 0.8 }} />
                <h3>
                  {activeTab === 'tasks' ? (taskSubTab === 'completed' ? (lang === 'en' ? 'No completed tasks yet' : 'لا توجد مهام منجزة بعد') : (lang === 'en' ? 'No active tasks' : 'لا توجد مهام نشطة حالياً')) :
                   activeTab === 'ideas' ? (lang === 'en' ? 'No ideas recorded yet' : 'لم يتم تسجيل أي أفكار بعد') :
                   activeTab === 'notes' ? (lang === 'en' ? 'No notes in this section' : 'لا توجد ملاحظات') :
                   activeTab === 'favorites' ? (lang === 'en' ? 'No favorite items starred' : 'لا توجد عناصر مفضلة') :
                   (lang === 'en' ? 'No items in this tab' : 'لا توجد عناصر في هذا التبويب')}
                </h3>
                <p>
                  {lang === 'en' ? 'Add a new item to organize your workflow efficiently.' : 'أضف عنصراً جديداً لتنظيم جدول عملك وأفكارك بسهولة.'}
                </p>
                {activeTab !== 'favorites' && (
                  <button 
                    className="sn-primary-btn" 
                    style={{ width: 'auto', margin: '14px auto' }} 
                    onClick={() => {
                      const isCustom = customTabs.some(t => t.id === activeTab);
                      setCreateType(activeTab === 'ideas' ? 'idea' : activeTab === 'notes' || isCustom ? 'note' : 'task');
                      setNewItemCategory(activeTab === 'ideas' ? customIdeaCategories[0] : activeTab === 'notes' || isCustom ? customNoteCategories[0] : customTaskCategories[0]);
                      setIsCreateModalOpen(true);
                    }}
                  >
                    <Plus size={16} />
                    <span>{lang === 'en' ? 'Add Item' : 'إضافة عنصر جديد'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══════════════ NEW ITEM CREATION MODAL WITH PROFESSIONAL DROPDOWNS ═══════════════ */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="sn-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
            <motion.div 
              className="sn-modal-box"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="sn-modal-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {createType === 'task' ? (
                    <CheckCircle2 size={20} color="#6366F1" />
                  ) : createType === 'idea' ? (
                    <Lightbulb size={20} color="#F59E0B" />
                  ) : (
                    <FileText size={20} color="#10B981" />
                  )}
                  <span>
                    {createType === 'task' ? (lang === 'en' ? 'Add New Task' : 'إضافة مهمة جديدة') :
                     createType === 'idea' ? (lang === 'en' ? 'Record New Idea' : 'تسجيل فكرة جديدة') :
                     (lang === 'en' ? 'Create Note' : 'إنشاء ملاحظة جديدة')}
                  </span>
                </div>
                <button className="sn-icon-btn" onClick={() => setIsCreateModalOpen(false)}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Title */}
                <div className="lpc-form-group">
                  <label className="lpc-label">
                    <FileText size={13} color="#818CF8" />
                    <span>{lang === 'en' ? 'Title / Name' : 'العنوان'}</span>
                  </label>
                  <input 
                    type="text" 
                    className="lpc-input"
                    placeholder={lang === 'en' ? 'Item title...' : 'اكتب العنوان هنا...'}
                    value={newItemTitle}
                    onChange={e => setNewItemTitle(e.target.value)}
                  />
                </div>

                {/* Professional UI Dropdowns (Category & Priority) */}
                <div style={{ display: 'grid', gridTemplateColumns: createType === 'task' ? '1fr 1fr' : '1fr', gap: 14 }}>
                  {/* Professional Category Dropdown */}
                  <PlannerCustomDropdown
                    label={lang === 'en' ? 'Category' : 'التصنيف'}
                    icon={TagIcon}
                    value={newItemCategory}
                    onChange={setNewItemCategory}
                    options={currentCategoryOptions}
                    lang={lang}
                  />

                  {/* Professional Priority Dropdown (Tasks ONLY) */}
                  {createType === 'task' && (
                    <PlannerCustomDropdown
                      label={lang === 'en' ? 'Priority Level' : 'مدى أهمية المهمة'}
                      icon={AlertCircle}
                      value={newItemPriority}
                      onChange={setNewItemPriority}
                      options={priorityOptions}
                      lang={lang}
                    />
                  )}
                </div>

                {/* Content / Notes */}
                <div className="lpc-form-group">
                  <label className="lpc-label">
                    <FileText size={13} color="#818CF8" />
                    <span>{lang === 'en' ? 'Description / Details' : 'التفاصيل والملاحظات'}</span>
                  </label>
                  <textarea 
                    className="lpc-input"
                    rows={4}
                    placeholder={lang === 'en' ? 'Enter item details...' : 'اكتب التفاصيل هنا...'}
                    value={newItemContent}
                    onChange={e => setNewItemContent(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button 
                  className="lpc-btn-primary"
                  onClick={handleCreateNewItem}
                  disabled={!newItemTitle.trim()}
                  style={{ marginTop: 8 }}
                >
                  <Plus size={16} />
                  <span>{lang === 'en' ? 'Add Item' : 'إضافة العنصر'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════ DYNAMIC CUSTOM CATEGORY CREATION MODAL ═══════════════ */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="sn-modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
            <motion.div 
              className="sn-modal-box"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="sn-modal-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FolderPlus size={20} color="#818CF8" />
                  <span>{lang === 'en' ? 'Create Custom Category' : 'إنشاء تصنيف خاص جديد'}</span>
                </div>
                <button className="sn-icon-btn" onClick={() => setIsCategoryModalOpen(false)}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="lpc-form-group">
                  <label className="lpc-label">{lang === 'en' ? 'Category Name' : 'اسم التصنيف'}</label>
                  <input 
                    type="text" 
                    className="lpc-input"
                    placeholder={lang === 'en' ? 'e.g., Marketing, Personal Project' : 'مثال: التسويق، مشروع خاص'}
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                  />
                </div>

                <button 
                  className="lpc-btn-primary"
                  onClick={handleAddCustomCategory}
                  disabled={!newCategoryName.trim()}
                >
                  <FolderPlus size={16} />
                  <span>{lang === 'en' ? 'Create Category' : 'إنشاء التصنيف'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="sn-modal-backdrop" onClick={() => setItemToDelete(null)}>
            <motion.div 
              className="sn-modal-box"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 440, border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: 16, fontWeight: 900 }}>
                    {lang === 'en' ? 'Delete Item?' : 'حذف العنصر؟'}
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {itemToDelete.title || (lang === 'en' ? 'Untitled' : 'بدون عنوان')}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                {lang === 'en' 
                  ? 'Are you sure you want to delete this item? This action cannot be undone.' 
                  : 'هل أنت متأكد من رغبتك في حذف هذا العنصر نهائياً؟'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button 
                  className="sn-format-btn" 
                  onClick={() => setItemToDelete(null)}
                  style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--bg3)' }}
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
                <button 
                  className="sn-primary-btn" 
                  onClick={confirmDeleteItem}
                  style={{ width: 'auto', margin: 0, padding: '8px 20px', borderRadius: 10, background: '#EF4444', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)' }}
                >
                  {lang === 'en' ? 'Delete' : 'حذف'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════ DYNAMIC CUSTOM TAB CREATION MODAL ═══════════════ */}
      <AnimatePresence>
        {isTabModalOpen && (
          <div className="sn-modal-backdrop" onClick={() => setIsTabModalOpen(false)}>
            <motion.div 
              className="sn-modal-box"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="sn-modal-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FolderPlus size={20} color="#818CF8" />
                  <span>{editingTabId ? (lang === 'en' ? 'Edit Tab' : 'تعديل التبويب') : (lang === 'en' ? 'Add New Tab' : 'إضافة تبويب جديد')}</span>
                </div>
                <button className="sn-icon-btn" onClick={() => setIsTabModalOpen(false)}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="lpc-form-group">
                  <label className="lpc-label">{lang === 'en' ? 'Tab Name' : 'اسم التبويب'}</label>
                  <input 
                    type="text" 
                    className="lpc-input"
                    placeholder={lang === 'en' ? 'e.g., Journal, Links' : 'مثال: يوميات، روابط هامة'}
                    value={newTabName}
                    onChange={e => setNewTabName(e.target.value)}
                  />
                </div>

                <button 
                  className="lpc-btn-primary"
                  onClick={handleSaveTab}
                  disabled={!newTabName.trim()}
                >
                  <FolderPlus size={16} />
                  <span>{lang === 'en' ? 'Save Tab' : 'حفظ التبويب'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
