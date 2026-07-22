import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Notebook,
  Folder,
  FolderPlus,
  Plus,
  Search,
  Grid,
  List as ListIcon,
  Pin,
  Lock,
  Unlock,
  Star,
  Trash2,
  Share2,
  Download,
  FileText,
  Printer,
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
  Minus,
  Sparkles,
  Maximize2,
  Minimize2,
  Clock,
  Calendar,
  Tag as TagIcon,
  Palette,
  Check,
  X,
  Eye,
  FileCode,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Filter
} from 'lucide-react';
import './SmartNotebook.css';

const DEFAULT_NOTEBOOKS = ['Personal', 'Work', 'Study', 'Check List', 'Project Ideas'];

const COLOR_ACCENTS = [
  { id: 'indigo', name: 'Indigo', hex: '#6366F1' },
  { id: 'emerald', name: 'Emerald', hex: '#10B981' },
  { id: 'amber', name: 'Amber', hex: '#F59E0B' },
  { id: 'rose', name: 'Rose', hex: '#F43F5E' },
  { id: 'purple', name: 'Purple', hex: '#8B5CF6' }
];

export default function SmartNotebook() {
  const { state } = useApp();
  const { userData } = useAuth();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  
  // Data State
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeNotebook, setActiveNotebook] = useState('All');
  const [customNotebooks, setCustomNotebooks] = useState(DEFAULT_NOTEBOOKS);
  
  // UI & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  
  // Active Note Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [notePriority, setNotePriority] = useState('low');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved'

  // Modals & Notifications
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Checklist Modal State
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  const [checklistTitle, setChecklistTitle] = useState('');
  const [checklistItems, setChecklistItems] = useState([]);
  const [viewingChecklist, setViewingChecklist] = useState(null);

  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Delete Handlers
  const requestDeleteNote = (e, note) => {
    if (e) e.stopPropagation();
    setNoteToDelete(note);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    const id = noteToDelete.id || noteToDelete;
    
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
    setNoteToDelete(null);
    showToast(lang === 'en' ? 'Note deleted 🗑️' : 'تم حذف الملاحظة 🗑️');
    
    try {
      await deleteDoc(doc(db, 'users', userData.uid, 'notebooks', id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + N (New Note)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNote(activeNotebook === 'All' || activeNotebook === 'Favorites' ? 'Personal' : activeNotebook);
      }
      // Ctrl + Shift + F (Focus Mode)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
      }
      // Ctrl + F (Search Focus)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && !e.shiftKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Esc (Close Modals & Clear Active Note)
      if (e.key === 'Escape') {
        setIsTemplateModalOpen(false);
        setIsChecklistModalOpen(false);
        setIsCreatingChecklist(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNotebook]);

  // Load Notes from Firestore
  useEffect(() => {
    const fetchNotes = async () => {
      if (!userData?.uid) return;
      setIsLoading(true);
      try {
        const notesRef = collection(db, 'users', userData.uid, 'notebooks');
        const q = query(notesRef, orderBy('updatedAt', 'desc'));
        const snap = await getDocs(q);
        const loadedNotes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotes(loadedNotes);
      } catch (err) {
        console.error("Error loading notes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, [userData]);

  // Set Active Note Data to Editor Form
  useEffect(() => {
    if (activeNoteId) {
      const note = notes.find(n => n.id === activeNoteId);
      if (note) {
        setTitle(note.title || '');
        setContent(note.content || '');
        setIsReadOnly(note.isLocked || false);
        setNotePriority(note.priority || 'low');
        setTags(note.tags || []);
        setSelectedColor(note.colorAccent || '#6366F1');
        if (editorRef.current && editorRef.current.innerHTML !== note.content) {
          editorRef.current.innerHTML = note.content || '';
        }
      }
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      if (editorRef.current) editorRef.current.innerHTML = '';
    }
  }, [activeNoteId, notes]);

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
        
        setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, title, content, priority: notePriority, tags, colorAccent: selectedColor } : n));
        setSaveStatus('saved');
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus('saved');
      }
    };

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(handleSave, 1200);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [title, content, notePriority, tags, selectedColor, activeNoteId, userData, isReadOnly]);

  // Note Handlers
  const handleCreateNote = async (notebook = 'Personal') => {
    if (!userData?.uid) return;
    const newId = Date.now().toString();
    const newNote = {
      id: newId,
      title: lang === 'en' ? 'New Note' : 'ملاحظة جديدة',
      content: '',
      notebook: notebook,
      isPinned: false,
      isLocked: false,
      isFavorite: false,
      priority: 'low',
      tags: [],
      colorAccent: '#6366F1',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    setNotes([newNote, ...notes]);
    setActiveNoteId(newId);
    setActiveNotebook(notebook);
    showToast(lang === 'en' ? 'New note created! ✨' : 'تم إنشاء ملاحظة جديدة! ✨');
    
    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', newId), newNote);
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  const handleDeleteNote = async (e, id) => {
    if (e) e.stopPropagation();
    if (!confirm(lang === 'en' ? 'Delete this note permanently?' : 'هل أنت متأكد من حذف هذه الملاحظة نهائياً؟')) return;
    
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
    showToast(lang === 'en' ? 'Note deleted' : 'تم حذف الملاحظة');
    
    try {
      await deleteDoc(doc(db, 'users', userData.uid, 'notebooks', id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const togglePin = async (e, id, currentStatus) => {
    if (e) e.stopPropagation();
    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', id), { isPinned: !currentStatus }, { merge: true });
      setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !currentStatus } : n));
      showToast(currentStatus ? (lang === 'en' ? 'Unpinned' : 'تم إلغاء التثبيت') : (lang === 'en' ? 'Pinned 📌' : 'تم التثبيت 📌'));
    } catch (err) {}
  };

  const toggleLock = async () => {
    if (!activeNoteId) return;
    const newStatus = !isReadOnly;
    setIsReadOnly(newStatus);
    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', activeNoteId), { isLocked: newStatus }, { merge: true });
      setNotes(notes.map(n => n.id === activeNoteId ? { ...n, isLocked: newStatus } : n));
      showToast(newStatus ? (lang === 'en' ? 'Locked 🔒' : 'تم التأمين 🔒') : (lang === 'en' ? 'Unlocked 🔓' : 'تم إلغاء القفل 🔓'));
    } catch (err) {}
  };

  const toggleFavorite = async (e, id, currentStatus) => {
    if (e) e.stopPropagation();
    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', id), { isFavorite: !currentStatus }, { merge: true });
      setNotes(notes.map(n => n.id === id ? { ...n, isFavorite: !currentStatus } : n));
      showToast(currentStatus ? (lang === 'en' ? 'Removed from favorites' : 'تمت الإزالة من المفضلة') : (lang === 'en' ? 'Added to favorites ⭐' : 'أضيفت للمفضلة ⭐'));
    } catch (err) {}
  };

  // Editor Commands & Formatting
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

  // Templates Handler
  const TEMPLATES = [
    {
      id: 'business',
      name_ar: '🤝 خطة العمل واجتماع العملاء',
      name_en: '🤝 Business Meeting & Strategy Plan',
      html_ar: `<h2>🤝 ملاحظات اجتماع العميل والاستراتيجية</h2><hr/><p><strong>اسم العميل:</strong> </p><p><strong>التاريخ:</strong> </p><h3>🎯 الأهداف الرئيسية:</h3><ul><li>الهدف الأول</li><li>الهدف الثاني</li></ul><h3>📝 النقاشات والقرارات:</h3><p></p><h3>🚀 خطوات العمل القادمة:</h3><ul><li>المهمة الأولى</li></ul>`,
      html_en: `<h2>🤝 Business Meeting & Strategy</h2><hr/><p><strong>Client Name:</strong> </p><p><strong>Date:</strong> </p><h3>🎯 Core Objectives:</h3><ul><li>Objective 1</li></ul><h3>📝 Discussion Summary:</h3><p></p><h3>🚀 Action Plan:</h3><ul><li>Action Item 1</li></ul>`
    },
    {
      id: 'study',
      name_ar: '📚 تلخيص المذاكرة والدراسة',
      name_en: '📚 Study & Research Summary',
      html_ar: `<h2>📚 ملخص الدراسة والتعلم</h2><hr/><h3>الموضوع الرئيسي: </h3><ul><li><strong>المفهوم الأساسي:</strong> </li><li><strong>أهم المعادلات والنقاط:</strong> </li></ul><h3>💡 الأسئلة المفتوحة:</h3><p></p>`,
      html_en: `<h2>📚 Research & Study Notes</h2><hr/><h3>Main Subject: </h3><ul><li><strong>Key Concepts:</strong> </li><li><strong>Core Points:</strong> </li></ul><h3>💡 Open Questions:</h3><p></p>`
    },
    {
      id: 'daily',
      name_ar: '🌅 التخطيط واليوميات',
      name_en: '🌅 Daily Planner & Journal',
      html_ar: `<h2>🌅 أهداف وتخطيط اليوم</h2><hr/><h3>🎯 أهم 3 أهداف لليوم:</h3><ul><li>الهدف 1</li><li>الهدف 2</li><li>الهدف 3</li></ul><h3>📓 ملاحظات اليوم والأفكار:</h3><p></p>`,
      html_en: `<h2>🌅 Daily Goals & Journal</h2><hr/><h3>🎯 Top 3 Goals:</h3><ul><li>Goal 1</li><li>Goal 2</li><li>Goal 3</li></ul><h3>📓 Daily Thoughts:</h3><p></p>`
    }
  ];

  const applyTemplate = (tpl) => {
    if (isReadOnly) return;
    const html = lang === 'en' ? tpl.html_en : tpl.html_ar;
    if (editorRef.current) {
      editorRef.current.innerHTML += html;
      setContent(editorRef.current.innerHTML);
    }
    setIsTemplateModalOpen(false);
    showToast(lang === 'en' ? 'Template inserted! 📄' : 'تم إدراج القالب بنجاح! 📄');
  };

  // Export File Formats
  const exportNote = (format) => {
    if (!activeNoteId) return;
    if (format === 'print') {
      window.print();
      return;
    }
    let ext = format;
    let mime = 'text/plain';
    let rawContent = content.replace(/<[^>]+>/g, '\n');

    if (format === 'html') {
      mime = 'text/html';
      rawContent = `<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1>${content}</body></html>`;
    }
    if (format === 'md') {
      rawContent = `# ${title}\n\n${rawContent}`;
    }

    const element = document.createElement("a");
    const file = new Blob([rawContent], { type: mime });
    element.href = URL.createObjectURL(file);
    element.download = `${title || 'note'}.${ext}`;
    document.body.appendChild(element);
    element.click();
    showToast(lang === 'en' ? `Exported as .${ext} 💾` : `تم التصدير بصيغة .${ext} 💾`);
  };

  // Tag Management
  const addTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const removeTag = (tToRemove) => {
    setTags(tags.filter(t => t !== tToRemove));
  };

  // Checklist Modal Handlers
  const handleCreateChecklist = async () => {
    if (!userData?.uid || !checklistTitle.trim()) return;
    const newId = Date.now().toString();
    const newList = {
      id: newId,
      title: checklistTitle,
      items: checklistItems.filter(i => i.text.trim() !== ''),
      notebook: 'Check List',
      isChecklist: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setNotes([newList, ...notes]);
    setIsCreatingChecklist(false);
    setChecklistTitle('');
    setChecklistItems([]);
    showToast(lang === 'en' ? 'Checklist created! ✅' : 'تم إنشاء قائمة المهام! ✅');
    
    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', newId), newList);
    } catch (err) {
      console.error("Error creating checklist:", err);
    }
  };

  const toggleChecklistItem = async (checklist, itemId) => {
    const updatedItems = checklist.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i);
    const updatedChecklist = { ...checklist, items: updatedItems };
    
    setNotes(notes.map(n => n.id === checklist.id ? updatedChecklist : n));
    if (viewingChecklist?.id === checklist.id) setViewingChecklist(updatedChecklist);

    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', checklist.id), { items: updatedItems, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {}
  };

  // Derived Calculations
  const filteredNotes = notes.filter(n => {
    if (activeNotebook === 'Favorites') return n.isFavorite;
    const matchBook = activeNotebook === 'All' || n.notebook === activeNotebook;
    const matchQuery = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (n.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === 'all' || n.priority === filterPriority;
    return matchBook && matchQuery && matchPriority;
  }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const textOnly = content.replace(/<[^>]+>/g, ' ').trim();
  const wordCount = textOnly.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = textOnly.length;
  const readTimeMin = Math.ceil(wordCount / 200) || 1;

  // Extract Thumbnail Image if present in content
  const getThumbnail = (htmlStr) => {
    const match = htmlStr.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

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

      {/* LEFT SIDEBAR */}
      {!isFocusMode && (
        <aside className={`sn-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Header */}
          <div className="sn-sidebar-header">
            {!isSidebarCollapsed && (
              <div className="sn-sidebar-title">
                <Notebook size={20} color="#6366F1" />
                <span>{lang === 'en' ? 'Smart Notebook' : 'دفتر الملاحظات الذكي'}</span>
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

          {/* Action Button */}
          <button className="sn-primary-btn" onClick={() => handleCreateNote('Personal')}>
            <Plus size={16} />
            {!isSidebarCollapsed && <span>{lang === 'en' ? 'New Note' : 'ملاحظة جديدة'}</span>}
          </button>

          {/* Search */}
          {!isSidebarCollapsed && (
            <div className="sn-sidebar-search">
              <div className="sn-search-input-wrap">
                <Search size={14} />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  className="sn-search-input"
                  placeholder={lang === 'en' ? 'Search notes (Ctrl+F)...' : 'البحث في الملاحظات (Ctrl+F)...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Folder Notebooks */}
          <div className="sn-folders-list">
            <div 
              className={`sn-folder-item ${activeNotebook === 'All' ? 'active' : ''}`}
              onClick={() => { setActiveNotebook('All'); setActiveNoteId(null); }}
            >
              <div className="sn-folder-left">
                <Folder size={16} />
                {!isSidebarCollapsed && <span>{lang === 'en' ? 'All Notes' : 'كل الملاحظات'}</span>}
              </div>
              {!isSidebarCollapsed && <span className="sn-folder-badge">{notes.length}</span>}
            </div>

            <div 
              className={`sn-folder-item ${activeNotebook === 'Favorites' ? 'active' : ''}`}
              onClick={() => { setActiveNotebook('Favorites'); setActiveNoteId(null); }}
            >
              <div className="sn-folder-left">
                <Star size={16} color="#F59E0B" />
                {!isSidebarCollapsed && <span>{lang === 'en' ? 'Favorites' : 'المفضلة'}</span>}
              </div>
              {!isSidebarCollapsed && <span className="sn-folder-badge">{notes.filter(n => n.isFavorite).length}</span>}
            </div>

            {customNotebooks.map(book => {
              const count = notes.filter(n => n.notebook === book).length;
              return (
                <div 
                  key={book}
                  className={`sn-folder-item ${activeNotebook === book ? 'active' : ''}`}
                  onClick={() => { setActiveNotebook(book); setActiveNoteId(null); }}
                >
                  <div className="sn-folder-left">
                    <Folder size={16} color={book === 'Personal' ? '#6366F1' : book === 'Work' ? '#10B981' : book === 'Study' ? '#F59E0B' : '#EC4899'} />
                    {!isSidebarCollapsed && <span>{lang === 'en' ? book : (book === 'Personal' ? 'شخصي' : book === 'Work' ? 'عمل' : book === 'Study' ? 'دراسة' : book === 'Check List' ? 'قائمة المهام' : book)}</span>}
                  </div>
                  {!isSidebarCollapsed && <span className="sn-folder-badge">{count}</span>}
                </div>
              );
            })}
          </div>

          {/* Scrollable Note Cards (Sidebar) */}
          {!isSidebarCollapsed && (
            <div className="sn-notes-scroll-list">
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'var(--text3)' }}>{lang === 'en' ? 'Loading...' : 'جاري التحميل...'}</div>
              ) : filteredNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'var(--text3)' }}>{lang === 'en' ? 'No notes found' : 'لا توجد ملاحظات'}</div>
              ) : (
                filteredNotes.map(n => (
                  <div 
                    key={n.id} 
                    className={`sn-note-card ${activeNoteId === n.id ? 'active' : ''}`}
                    onClick={() => setActiveNoteId(n.id)}
                  >
                    <div className="sn-note-card-header">
                      <span className="sn-note-card-title">{n.title || (lang === 'en' ? 'Untitled Note' : 'ملاحظة بدون عنوان')}</span>
                      <div className="sn-card-actions">
                        <button className={`sn-card-action-btn ${n.isFavorite ? 'active' : ''}`} onClick={(e) => toggleFavorite(e, n.id, n.isFavorite)}>
                          <Star size={12} fill={n.isFavorite ? '#F59E0B' : 'none'} />
                        </button>
                        <button className="sn-card-action-btn" onClick={(e) => togglePin(e, n.id, n.isPinned)}>
                          <Pin size={12} color={n.isPinned ? '#6366F1' : 'currentColor'} />
                        </button>
                        <button className="sn-card-action-btn" onClick={(e) => handleDeleteNote(e, n.id)}>
                          <Trash2 size={12} color="#EF4444" />
                        </button>
                      </div>
                    </div>

                    <div className="sn-note-card-preview">
                      {(n.content || '').replace(/<[^>]+>/g, '').substring(0, 50)}...
                    </div>

                    <div className="sn-note-card-footer">
                      <span>{n.notebook}</span>
                      {n.isLocked && <Lock size={12} color="#EF4444" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </aside>
      )}

      {/* RIGHT MAIN EDITOR / GALLERY VIEW */}
      <main className="sn-main-editor">
        {activeNoteId ? (
          <>
            {/* Editor Top Bar */}
            <div className="sn-editor-header">
              <div className="sn-editor-header-start">
                <button className="sn-icon-btn" onClick={() => setActiveNoteId(null)} title={lang === 'en' ? 'Back to Gallery' : 'العودة للمعرض'}>
                  {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                <button 
                  className={`sn-icon-btn ${isFocusMode ? 'active' : ''}`}
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  title={lang === 'en' ? 'Focus Mode (Ctrl+Shift+F)' : 'وضع التركيز (Ctrl+Shift+F)'}
                >
                  {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                <button 
                  className={`sn-icon-btn ${isReadOnly ? 'active' : ''}`}
                  onClick={toggleLock}
                  title={isReadOnly ? (lang === 'en' ? 'Unlock Note' : 'إلغاء قفل الملاحظة') : (lang === 'en' ? 'Lock Note' : 'قفل الملاحظة')}
                >
                  {isReadOnly ? <Lock size={16} color="#EF4444" /> : <Unlock size={16} />}
                </button>

                <button 
                  className="sn-icon-btn"
                  onClick={() => setIsTemplateModalOpen(true)}
                  title={lang === 'en' ? 'Insert Template' : 'إدراج قالب'}
                >
                  <FileText size={16} />
                </button>
              </div>

              <div className="sn-editor-header-end">
                <div className="sn-save-status">
                  <Check size={14} />
                  <span>{saveStatus === 'saving' ? (lang === 'en' ? 'Saving...' : 'جاري الحفظ...') : (lang === 'en' ? 'Auto-saved' : 'تم الحفظ تلقائياً')}</span>
                </div>

                <div className="sn-reading-stats">
                  <span>{wordCount} {lang === 'en' ? 'words' : 'كلمة'}</span>
                  <span> • </span>
                  <span>{readTimeMin} {lang === 'en' ? 'min read' : 'دقيقة قراءة'}</span>
                </div>

                {/* Export Formats */}
                <div className="sn-editor-header-start">
                  <button className="sn-icon-btn" onClick={() => exportNote('md')} title={lang === 'en' ? 'Export .md' : 'تصدير Markdown'}>
                    <FileCode size={16} />
                  </button>
                  <button className="sn-icon-btn" onClick={() => exportNote('txt')} title={lang === 'en' ? 'Export .txt' : 'تصدير نص عادي'}>
                    <Download size={16} />
                  </button>
                  <button className="sn-icon-btn" onClick={() => exportNote('print')} title={lang === 'en' ? 'Print (Ctrl+P)' : 'طباعة (Ctrl+P)'}>
                    <Printer size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Rich Text Toolbar */}
            {!isReadOnly && (
              <div className="sn-format-bar">
                <button className="sn-format-btn" onClick={() => execCommand('bold')} title="Bold (Ctrl+B)"><BoldIcon size={14} /></button>
                <button className="sn-format-btn" onClick={() => execCommand('italic')} title="Italic (Ctrl+I)"><ItalicIcon size={14} /></button>
                <button className="sn-format-btn" onClick={() => execCommand('underline')} title="Underline (Ctrl+U)"><UnderlineIcon size={14} /></button>
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
                <button className="sn-format-btn" onClick={insertImage} title="Insert Image URL"><ImageIcon size={14} /></button>
                <button className="sn-format-btn" onClick={insertTable} title="Insert Table"><TableIcon size={14} /></button>
                <button className="sn-format-btn" onClick={insertChecklistLine} title="Insert Checklist Item"><CheckSquare size={14} /></button>
                <button className="sn-format-btn" onClick={insertCodeBlock} title="Insert Code Block"><CodeIcon size={14} /></button>

                <span className="sn-format-divider" />

                <input 
                  type="color" 
                  className="sn-color-input" 
                  onChange={(e) => execCommand('foreColor', e.target.value)} 
                  title={lang === 'en' ? 'Text Color' : 'لون النص'} 
                />
              </div>
            )}

            {/* Canvas Area */}
            <div className="sn-canvas-area">
              <input 
                type="text" 
                className="sn-title-input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === 'en' ? 'Note Title...' : 'عنوان الملاحظة...'}
                disabled={isReadOnly}
              />

              {/* Tags & Metadata Pill Bar */}
              <div className="sn-tags-bar">
                {tags.map(t => (
                  <span key={t} className="sn-tag-pill">
                    #{t}
                    {!isReadOnly && <button onClick={() => removeTag(t)}>✕</button>}
                  </span>
                ))}
                {!isReadOnly && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input 
                      type="text" 
                      placeholder={lang === 'en' ? '+ Add Tag' : '+ إضافة وسام'}
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTag()}
                      style={{ fontSize: 11, background: 'transparent', border: '1px solid var(--line)', borderRadius: 10, padding: '2px 8px', color: 'var(--text)', outline: 'none' }}
                    />
                  </div>
                )}
              </div>

              {/* Editable Content Editor */}
              <div 
                className="sn-content-canvas"
                ref={editorRef}
                contentEditable={!isReadOnly}
                onInput={() => setContent(editorRef.current?.innerHTML || '')}
                placeholder={lang === 'en' ? 'Start typing your ideas here...' : 'ابدأ كتابة أفكارك هنا...'}
              />
            </div>
          </>
        ) : (
          /* GALLERY / GRID VIEW AREA */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Gallery Topbar */}
            <div className="sn-gallery-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Folder size={18} color="#6366F1" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
                  {activeNotebook === 'All' ? (lang === 'en' ? 'All Notes' : 'كل الملاحظات') : activeNotebook}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* View Switcher */}
                <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 10, padding: 2 }}>
                  <button className={`sn-icon-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                    <Grid size={16} />
                  </button>
                  <button className={`sn-icon-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                    <ListIcon size={16} />
                  </button>
                </div>

                <button className="sn-primary-btn" style={{ width: 'auto', margin: 0 }} onClick={() => handleCreateNote(activeNotebook === 'All' ? 'Personal' : activeNotebook)}>
                  <Plus size={14} />
                  <span>{lang === 'en' ? 'New Note' : 'ملاحظة جديدة'}</span>
                </button>
              </div>
            </div>

            {/* Notes Grid/List Display */}
            {filteredNotes.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="sn-gallery-grid">
                  {filteredNotes.map(n => {
                    const thumb = getThumbnail(n.content || '');
                    return (
                      <motion.div 
                        key={n.id} 
                        className="sn-gallery-card"
                        whileHover={{ y: -3 }}
                        onClick={() => {
                          if (n.isChecklist) {
                            setViewingChecklist(n);
                            setIsChecklistModalOpen(true);
                          } else {
                            setActiveNoteId(n.id);
                          }
                        }}
                      >
                        <div className="sn-gallery-card-top">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 800 }}>{n.notebook}</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {n.isPinned && <Pin size={12} color="#6366F1" />}
                              {n.isFavorite && <Star size={12} color="#F59E0B" fill="#F59E0B" />}
                              {n.isLocked && <Lock size={12} color="#EF4444" />}
                            </div>
                          </div>

                          <h4 className="sn-gallery-card-title">{n.title || (lang === 'en' ? 'Untitled Note' : 'ملاحظة بدون عنوان')}</h4>
                          
                          {thumb && (
                            <div style={{ width: '100%', height: 100, borderRadius: 10, overflow: 'hidden', margin: '8px 0', background: `url(${thumb}) center/cover no-repeat` }} />
                          )}

                          <p className="sn-gallery-card-desc">
                            {(n.content || '').replace(/<[^>]+>/g, '') || (lang === 'en' ? 'No content...' : 'لا يوجد محتوى...')}
                          </p>
                        </div>

                        <div className="sn-gallery-card-footer">
                          <span>{lang === 'en' ? 'Edit Note' : 'تعديل الملاحظة'}</span>
                          <button className="sn-card-action-btn" onClick={(e) => requestDeleteNote(e, n)}>
                            <Trash2 size={13} color="#EF4444" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="sn-gallery-list">
                  {filteredNotes.map(n => (
                    <motion.div 
                      key={n.id}
                      className="sn-gallery-list-item"
                      whileHover={{ x: isRtl ? -4 : 4 }}
                      onClick={() => {
                        if (n.isChecklist) {
                          setViewingChecklist(n);
                          setIsChecklistModalOpen(true);
                        } else {
                          setActiveNoteId(n.id);
                        }
                      }}
                    >
                      <div className="sn-list-item-main">
                        <Folder size={18} color="#6366F1" style={{ flexShrink: 0 }} />
                        <div style={{ overflow: 'hidden' }}>
                          <div className="sn-list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{n.title || (lang === 'en' ? 'Untitled Note' : 'ملاحظة بدون عنوان')}</span>
                            {n.isPinned && <Pin size={12} color="#6366F1" />}
                            {n.isFavorite && <Star size={12} color="#F59E0B" fill="#F59E0B" />}
                            {n.isLocked && <Lock size={12} color="#EF4444" />}
                          </div>
                          <div className="sn-list-item-snippet">
                            {(n.content || '').replace(/<[^>]+>/g, '') || (lang === 'en' ? 'No content...' : 'لا يوجد محتوى...')}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <span className="sn-folder-badge" style={{ fontSize: 10 }}>{n.notebook}</span>
                        <button className="sn-card-action-btn" onClick={(e) => requestDeleteNote(e, n)}>
                          <Trash2 size={15} color="#EF4444" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
                <Notebook size={48} color="var(--accent)" style={{ marginBottom: 16, opacity: 0.7 }} />
                <h3 style={{ color: 'var(--text)', margin: '0 0 8px 0' }}>{lang === 'en' ? 'No notes in this folder' : 'لا توجد ملاحظات في هذا الدفتر'}</h3>
                <p style={{ fontSize: 13 }}>{lang === 'en' ? 'Create a new note to start capturing your business strategy ideas.' : 'ابدأ بإضافة ملاحظة جديدة لتأطير استراتيجيتك اليوم.'}</p>
                <button className="sn-primary-btn" style={{ width: 'auto', margin: '16px auto' }} onClick={() => handleCreateNote('Personal')}>
                  <Plus size={16} />
                  <span>{lang === 'en' ? 'Create Note' : 'إنشاء ملاحظة جديدة'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* TEMPLATES PREVIEW MODAL */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="sn-modal-backdrop" onClick={() => setIsTemplateModalOpen(false)}>
            <motion.div 
              className="sn-modal-box"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="sn-modal-title">
                <span>📄 {lang === 'en' ? 'Note Templates Library' : 'مكتبة قوالب الملاحظات'}</span>
                <button className="sn-icon-btn" onClick={() => setIsTemplateModalOpen(false)}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {TEMPLATES.map(tpl => (
                  <div 
                    key={tpl.id}
                    style={{ background: 'var(--bg3)', border: '1px solid var(--line)', padding: 14, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => applyTemplate(tpl)}
                  >
                    <h4 style={{ margin: '0 0 6px 0', color: 'var(--accent)', fontSize: 14 }}>{lang === 'en' ? tpl.name_en : tpl.name_ar}</h4>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text3)' }}>{lang === 'en' ? 'Click to insert template into active note canvas.' : 'اضغط لإدراج القالب في مساحة الكتابة الحالية.'}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROFESSIONAL DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {noteToDelete && (
          <div className="sn-modal-backdrop" onClick={() => setNoteToDelete(null)}>
            <motion.div 
              className="sn-modal-box"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 440, border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}>
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 16, fontWeight: 900 }}>
                    {lang === 'en' ? 'Delete Note?' : 'حذف الملاحظة؟'}
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {noteToDelete.title || (lang === 'en' ? 'Untitled Note' : 'ملاحظة بدون عنوان')}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                {lang === 'en' 
                  ? 'Are you sure you want to delete this note? This action cannot be undone.' 
                  : 'هل أنت متأكد من رغبتك في حذف هذه الملاحظة نهائياً؟ لا يمكن التراجع عن هذه الخطوة.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button 
                  className="sn-format-btn" 
                  onClick={() => setNoteToDelete(null)}
                  style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--bg3)' }}
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
                <button 
                  className="sn-primary-btn" 
                  onClick={confirmDeleteNote}
                  style={{ width: 'auto', margin: 0, padding: '8px 20px', borderRadius: 10, background: '#EF4444', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)' }}
                >
                  {lang === 'en' ? 'Delete Note' : 'حذف الملاحظة'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
