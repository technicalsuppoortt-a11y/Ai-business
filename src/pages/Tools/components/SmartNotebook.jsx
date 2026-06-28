import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import './SmartNotebook.css';

const NOTEBOOKS = ['Personal', 'Work', 'Study', 'Check List'];

export default function SmartNotebook() {
  const { state } = useApp();
  const { userData } = useAuth();
  const lang = state.language || 'ar';
  
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeNotebook, setActiveNotebook] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Checklist State
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  const [checklistTitle, setChecklistTitle] = useState('');
  const [checklistItems, setChecklistItems] = useState([]); // [{id, text, completed}]
  const [viewingChecklist, setViewingChecklist] = useState(null);

  // Load Notes
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

  // Set Active Note Data
  useEffect(() => {
    if (activeNoteId) {
      const note = notes.find(n => n.id === activeNoteId);
      if (note) {
        setTitle(note.title || '');
        setContent(note.content || '');
        setIsReadOnly(note.isLocked || false);
        if (editorRef.current && editorRef.current.innerHTML !== note.content) {
          editorRef.current.innerHTML = note.content || '';
        }
      }
    } else {
      setTitle('');
      setContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
    }
  }, [activeNoteId, notes]);

  // Auto-Save Logic
  useEffect(() => {
    if (!activeNoteId || !userData?.uid || isReadOnly) return;
    
    const handleSave = async () => {
      try {
        const noteRef = doc(db, 'users', userData.uid, 'notebooks', activeNoteId);
        await setDoc(noteRef, {
          title,
          content,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Update local state without re-triggering active note effect
        setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, title, content } : n));
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    };

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(handleSave, 1500);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [title, content, activeNoteId, userData, isReadOnly]);

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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    setNotes([newNote, ...notes]);
    setActiveNoteId(newId);
    setActiveNotebook(notebook);
    
    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', newId), newNote);
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

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
    
    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', newId), newList);
    } catch (err) {
      console.error("Error creating checklist:", err);
    }
  };

  const addChecklistItemField = () => {
    setChecklistItems([...checklistItems, { id: Date.now(), text: '', completed: false }]);
  };

  const updateChecklistItem = (id, text) => {
    setChecklistItems(checklistItems.map(i => i.id === id ? { ...i, text } : i));
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

  const handleDeleteNote = async (e, id) => {
    e.stopPropagation();
    if (!confirm(lang === 'en' ? 'Delete this note?' : 'هل أنت متأكد من حذف هذه الملاحظة؟')) return;
    
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
    
    try {
      await deleteDoc(doc(db, 'users', userData.uid, 'notebooks', id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const togglePin = async (e, id, currentStatus) => {
    e.stopPropagation();
    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', id), { isPinned: !currentStatus }, { merge: true });
      setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !currentStatus } : n));
    } catch (err) {}
  };

  const toggleLock = async () => {
    if (!activeNoteId) return;
    const newStatus = !isReadOnly;
    setIsReadOnly(newStatus);
    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', activeNoteId), { isLocked: newStatus }, { merge: true });
      setNotes(notes.map(n => n.id === activeNoteId ? { ...n, isLocked: newStatus } : n));
    } catch (err) {}
  };

  const toggleFavorite = async (e, id, currentStatus) => {
    if (e) e.stopPropagation();
    try {
      await setDoc(doc(db, 'users', userData.uid, 'notebooks', id), { isFavorite: !currentStatus }, { merge: true });
      setNotes(notes.map(n => n.id === id ? { ...n, isFavorite: !currentStatus } : n));
    } catch (err) {}
  };

  const handleEditorInput = () => {
    if (editorRef.current && !isReadOnly) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const execCommand = (cmd, value = null) => {
    if (isReadOnly) return;
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
        editorRef.current.focus();
        setContent(editorRef.current.innerHTML);
    }
  };

  const insertTemplate = (type) => {
    if (isReadOnly) return;
    let template = '';
    if (lang === 'en') {
      if (type === 'meeting') template = '<h2>🤝 Meeting Notes</h2><ul><li><strong>Date:</strong> </li><li><strong>Attendees:</strong> </li></ul><h3>Agenda</h3><ul><li>Item 1</li></ul><h3>Action Items</h3><ul><li>Task 1</li></ul>';
      if (type === 'study') template = '<h2>📚 Study Notes</h2><h3>Topic: </h3><ul><li><strong>Key Concept:</strong> </li><li><strong>Important:</strong> </li></ul><h3>Summary</h3><p></p>';
      if (type === 'daily') template = '<h2>🌅 Daily Journal</h2><h3>Goals for Today</h3><ul><li>Goal 1</li></ul><h3>Notes</h3><p></p>';
    } else {
      if (type === 'meeting') template = '<h2>🤝 ملاحظات الاجتماع</h2><ul><li><strong>التاريخ:</strong> </li><li><strong>الحاضرون:</strong> </li></ul><h3>جدول الأعمال</h3><ul><li>الموضوع الأول</li></ul><h3>المهام المطلوبة</h3><ul><li>المهمة الأولى</li></ul>';
      if (type === 'study') template = '<h2>📚 ملاحظات الدراسة والمذاكرة</h2><h3>الموضوع: </h3><ul><li><strong>المفهوم الأساسي:</strong> </li><li><strong>أهم النقاط:</strong> </li></ul><h3>الملخص</h3><p></p>';
      if (type === 'daily') template = '<h2>🌅 اليوميات والتخطيط اليومي</h2><h3>أهداف اليوم</h3><ul><li>الهدف الأول</li></ul><h3>الملاحظات</h3><p></p>';
    }
    
    if (editorRef.current) {
        editorRef.current.innerHTML += template;
        setContent(editorRef.current.innerHTML);
    }
  };

  const exportNote = (format) => {
    if (!activeNoteId) return;
    if (format === 'print') {
        window.print();
        return;
    }
    const element = document.createElement("a");
    const file = new Blob([content.replace(/<[^>]+>/g, '\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title || 'note'}.${format}`;
    document.body.appendChild(element);
    element.click();
  };

  // Derived state
  const filteredNotes = notes.filter(n => {
    if (activeNotebook === 'Favorites') return n.isFavorite;
    const matchBook = activeNotebook === 'All' || n.notebook === activeNotebook;
    const matchQuery = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (n.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchBook && matchQuery;
  }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const wordCount = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = content.replace(/<[^>]+>/g, '').length;

  return (
    <div className={`sn-wrapper ${isFocusMode ? 'focus-mode' : ''} ${activeNoteId ? 'sn-show-editor' : 'sn-show-list'} ${lang === 'en' ? 'ltr' : 'rtl'}`}>
      
      {/* SIDEBAR */}
      {!isFocusMode && (
        <div className="sn-sidebar">
          <div className="sn-header">
            <h2>📓 {lang === 'en' ? 'Note Book' : 'دفتر الملاحظات'}</h2>
            <button className="sn-new-btn" onClick={() => handleCreateNote('Personal')}>
              + {lang === 'en' ? 'New Note' : 'ملاحظة جديدة'}
            </button>
          </div>

          <div className="sn-search">
            <input 
              type="text" 
              placeholder={lang === 'en' ? 'Search notes...' : 'البحث في الملاحظات...'} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="sn-notebooks">
            <div className="sn-section-title">{lang === 'en' ? 'Notebooks' : 'الدفاتر والمجلدات'}</div>
            <div 
              className={`sn-book ${activeNotebook === 'All' ? 'active' : ''}`}
              onClick={() => { setActiveNotebook('All'); setActiveNoteId(null); }}
            >{lang === 'en' ? '📁 All' : '📁 الكل'}</div>
            <div 
              className={`sn-book sn-fav-item ${activeNotebook === 'Favorites' ? 'active' : ''}`}
              onClick={() => { setActiveNotebook('Favorites'); setActiveNoteId(null); }}
            >{lang === 'en' ? '⭐ Favorites' : '⭐ المفضلة'}</div>
            {NOTEBOOKS.map(book => (
              <div 
                key={book} 
                className={`sn-book ${activeNotebook === book ? 'active' : ''}`}
                onClick={() => { setActiveNotebook(book); setActiveNoteId(null); }}
              >
                {book === 'Personal' ? '👤' : book === 'Work' ? '💼' : book === 'Study' ? '📚' : '✅'} {lang === 'en' ? book : (book === 'Personal' ? 'شخصي' : book === 'Work' ? 'عمل' : book === 'Study' ? 'دراسة' : 'قائمة المهام')}
              </div>
            ))}
          </div>

          <div className="sn-notes-list">
            <div className="sn-section-title">{lang === 'en' ? 'Notes' : 'الملاحظات'}</div>
            {isLoading ? (
              <div className="sn-empty">{lang === 'en' ? 'Loading...' : 'جاري التحميل...'}</div>
            ) : filteredNotes.length === 0 ? (
              <div className="sn-empty">{lang === 'en' ? 'No notes found' : 'لا توجد ملاحظات'}</div>
            ) : (
              filteredNotes.map(n => (
                <div 
                  key={n.id} 
                  className={`sn-note-item ${activeNoteId === n.id ? 'active' : ''}`}
                  onClick={() => setActiveNoteId(n.id)}
                >
                  <div className="sn-note-title">
                    {n.isPinned && <span className="sn-pin-icon">📌</span>}
                    {n.isLocked && <span className="sn-lock-icon">🔒</span>}
                    {n.isFavorite && <span className="sn-fav-icon" style={{ color: '#ffb800' }}>⭐</span>}
                    {n.title || (lang === 'en' ? 'Untitled Note' : 'ملاحظة بدون عنوان')}
                  </div>
                  <div className="sn-note-preview">
                    {(n.content || '').replace(/<[^>]+>/g, '').substring(0, 40)}...
                  </div>
                  <div className="sn-note-actions">
                    <button onClick={(e) => toggleFavorite(e, n.id, n.isFavorite)} title="Favorite">{n.isFavorite ? '⭐' : '☆'}</button>
                    <button onClick={(e) => togglePin(e, n.id, n.isPinned)}>📌</button>
                    <button onClick={(e) => handleDeleteNote(e, n.id)}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MAIN EDITOR */}
      <div className="sn-main">
        {activeNoteId ? (
          <>
            {/* Top Toolbar */}
            <div className="sn-topbar">
              <div className="sn-topbar-left">
                <button className="sn-back-btn" onClick={() => setActiveNoteId(null)} title="Back to List">⬅️</button>
                <button className={`sn-icon-btn ${isFocusMode ? 'active' : ''}`} onClick={() => setIsFocusMode(!isFocusMode)} title="Focus Mode">🎯</button>
                <button className={`sn-icon-btn ${isReadOnly ? 'active' : ''}`} onClick={toggleLock} title="Read Only / Lock">🔒</button>
                <button 
                  className={`sn-icon-btn sn-fav-btn ${notes.find(n => n.id === activeNoteId)?.isFavorite ? 'active' : ''}`} 
                  onClick={() => toggleFavorite(null, activeNoteId, notes.find(n => n.id === activeNoteId)?.isFavorite)} 
                  title="Favorite"
                >⭐</button>
                <div className="sn-dropdown">
                  <button className="sn-icon-btn">💾 {lang === 'en' ? 'Export' : 'تصدير'}</button>
                  <div className="sn-dropdown-content">
                    <div onClick={() => exportNote('txt')}>TXT</div>
                    <div onClick={() => exportNote('print')}>{lang === 'en' ? 'PDF (Print)' : 'PDF (طباعة)'}</div>
                  </div>
                </div>
                <div className="sn-dropdown">
                  <button className="sn-icon-btn">📄 {lang === 'en' ? 'Templates' : 'قوالب'}</button>
                  <div className="sn-dropdown-content">
                    <div onClick={() => insertTemplate('meeting')}>{lang === 'en' ? 'Meeting Notes' : 'ملاحظات اجتماع'}</div>
                    <div onClick={() => insertTemplate('study')}>{lang === 'en' ? 'Study Notes' : 'ملاحظات دراسية'}</div>
                    <div onClick={() => insertTemplate('daily')}>{lang === 'en' ? 'Daily Journal' : 'يوميات'}</div>
                  </div>
                </div>
              </div>
              <div className="sn-topbar-right">
                <span className="sn-stats">{wordCount} {lang === 'en' ? 'words' : 'كلمة'} | {charCount} {lang === 'en' ? 'chars' : 'حرف'}</span>
              </div>
            </div>

            {/* Rich Text Toolbar */}
            {!isReadOnly && (
              <div className="sn-format-toolbar">
                <button onClick={() => execCommand('bold')} title="Bold"><b>B</b></button>
                <button onClick={() => execCommand('italic')} title="Italic"><i>I</i></button>
                <button onClick={() => execCommand('underline')} title="Underline"><u>U</u></button>
                <button onClick={() => execCommand('strikethrough')} title="Strikethrough"><s>S</s></button>
                <span className="sn-divider"></span>
                <button onClick={() => execCommand('formatBlock', 'H1')}>H1</button>
                <button onClick={() => execCommand('formatBlock', 'H2')}>H2</button>
                <button onClick={() => execCommand('formatBlock', 'H3')}>H3</button>
                <span className="sn-divider"></span>
                <button onClick={() => execCommand('insertUnorderedList')}>• List</button>
                <button onClick={() => execCommand('insertOrderedList')}>1. List</button>
                <span className="sn-divider"></span>
                <button onClick={() => execCommand('justifyLeft')}>⬅️</button>
                <button onClick={() => execCommand('justifyCenter')}>↕️</button>
                <button onClick={() => execCommand('justifyRight')}>➡️</button>
                <span className="sn-divider"></span>
                <input type="color" onChange={(e) => execCommand('foreColor', e.target.value)} title="Text Color" className="sn-color-picker" />
                <input type="color" onChange={(e) => execCommand('hiliteColor', e.target.value)} title="Highlight Color" className="sn-color-picker" />
              </div>
            )}

            {/* Editor Area */}
            <div className="sn-editor-area">
              <input 
                type="text" 
                className="sn-title-input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === 'en' ? 'Note Title' : 'عنوان الملاحظة'}
                disabled={isReadOnly}
              />
              <div 
                className={`sn-content-editor ${isReadOnly ? 'read-only' : ''}`}
                ref={editorRef}
                contentEditable={!isReadOnly}
                onInput={handleEditorInput}
                placeholder={lang === 'en' ? 'Start typing your ideas here...' : 'ابدأ كتابة أفكارك هنا... (يدعم لصق الصور والروابط)'}
              />
            </div>
          </>
        ) : (
          <div className="sn-gallery-container">
            <div className="sn-topbar">
              <div className="sn-topbar-left" style={{ fontWeight: 800, color: 'var(--text)' }}>
                {activeNotebook === 'All' ? (lang === 'en' ? '📂 All Notes' : '📂 كل الملاحظات') : activeNotebook === 'Favorites' ? (lang === 'en' ? '⭐ Favorites' : '⭐ المفضلة') : (lang === 'en' ? `📂 Notebook: ${activeNotebook}` : `📂 دفتر: ${activeNotebook === 'Personal' ? 'شخصي' : activeNotebook === 'Work' ? 'عمل' : activeNotebook === 'Study' ? 'دراسة' : 'قائمة المهام'}`)}
              </div>
              <div className="sn-topbar-right">
                <span className="sn-stats">{filteredNotes.length} {lang === 'en' ? 'notes' : 'ملاحظة'}</span>
              </div>
            </div>
            
            {filteredNotes.length > 0 ? (
              <div className="sn-gallery">
                {filteredNotes.map(n => (
                  <div key={n.id} className={`sn-gallery-item ${n.isChecklist ? 'sn-type-checklist' : ''}`} onClick={() => {
                    if (n.isChecklist) {
                      setViewingChecklist(n);
                      setIsChecklistModalOpen(true);
                    } else {
                      setActiveNoteId(n.id);
                    }
                  }}>
                    <div className="sn-gallery-title" style={{ color: n.isChecklist ? 'var(--accent)' : 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: '8px', minHeight: '44px' }}>
                      {n.isPinned && <span style={{ flexShrink: 0, marginTop: '2px' }}>📌</span>}
                      <span className="sn-gallery-title-text" style={{ flex: 1 }}>
                        {n.title || (n.isChecklist ? (lang === 'en' ? 'New Checklist' : 'قائمة مهام جديدة') : (lang === 'en' ? 'Untitled Note' : 'ملاحظة بدون عنوان'))}
                      </span>
                    </div>
                    {n.isChecklist ? (
                        <div className="sn-checklist-preview">
                            {n.items.slice(0, 3).map(i => (
                                <div key={i.id} className="sn-preview-item">
                                    <span className={`sn-checkbox-small ${i.completed ? 'checked' : ''}`}></span>
                                    <span style={{ color: 'var(--text2)', fontSize: 10 }}>{i.text || '...'}</span>
                                </div>
                            ))}
                            {n.items.length > 3 && <div style={{ fontSize: 10, opacity: 0.5 }}>+{n.items.length - 3} {lang === 'en' ? 'more...' : 'أكثر...'}</div>}
                            <div className="sn-progress-mini">
                                <div className="sn-progress-fill" style={{ width: `${(n.items.filter(i => i.completed).length / n.items.length) * 100}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="sn-gallery-preview">
                            {(n.content || '').replace(/<[^>]+>/g, '') || (lang === 'en' ? 'No content...' : 'لا يوجد محتوى...')}
                        </div>
                    )}
                    <div className="sn-gallery-footer">
                      <span>{lang === 'en' ? n.notebook : (n.notebook === 'Personal' ? 'شخصي' : n.notebook === 'Work' ? 'عمل' : n.notebook === 'Study' ? 'دراسة' : n.notebook === 'Check List' ? 'قائمة المهام' : n.notebook)}</span>
                      {n.isFavorite && <span style={{ color: '#ffb800' }}>⭐</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sn-no-selection">
                <div className="sn-icon-large">📓</div>
                <h3>{activeNotebook === 'Favorites' ? (lang === 'en' ? 'No favorites' : 'لا توجد مفضلات') : (lang === 'en' ? 'This notebook is empty' : 'هذا الدفتر فارغ')}</h3>
                <p>{lang === 'en' ? 'Start by adding your first note here.' : 'ابدأ بإضافة ملاحظاتك الأولى هنا.'}</p>
                {activeNotebook === 'Check List' ? (
                    <button className="sn-new-btn-large" onClick={() => setIsCreatingChecklist(true)}>
                        + {lang === 'en' ? 'Create new checklist' : 'إنشاء قائمة جديدة'}
                    </button>
                ) : (
                    <button className="sn-new-btn-large" onClick={() => handleCreateNote(activeNotebook === 'All' || activeNotebook === 'Favorites' ? 'Personal' : activeNotebook)}>
                        + {lang === 'en' ? 'Create new note' : 'إنشاء ملاحظة جديدة'}
                    </button>
                )}
              </div>
            )}
            
            {activeNotebook === 'Check List' && filteredNotes.length > 0 && (
                <button className="sn-fab-add" onClick={() => setIsCreatingChecklist(true)}>+</button>
            )}
          </div>
        )}
      </div>

      {/* CREATE CHECKLIST MODAL */}
      {isCreatingChecklist && (
          <div className="sn-modal-overlay">
              <div className="sn-modal animate-pop">
                  <div className="sn-modal-header">
                      <h3>{lang === 'en' ? 'Create New Checklist ✅' : 'إنشاء قائمة جديدة ✅'}</h3>
                      <button className="sn-close" onClick={() => setIsCreatingChecklist(false)}>×</button>
                  </div>
                  <div className="sn-modal-body">
                      <input 
                        type="text" 
                        className="field-input" 
                        placeholder={lang === 'en' ? 'Checklist Title...' : 'عنوان القائمة...'} 
                        value={checklistTitle}
                        onChange={e => setChecklistTitle(e.target.value)}
                        autoFocus
                      />
                      <div className="sn-checklist-builder">
                          {checklistItems.map(item => (
                              <div key={item.id} className="sn-builder-row">
                                  <span className="sn-checkbox-dummy"></span>
                                  <input 
                                    type="text" 
                                    placeholder={lang === 'en' ? 'Write item...' : 'اكتب نقطة...'} 
                                    value={item.text}
                                    onChange={e => updateChecklistItem(item.id, e.target.value)}
                                  />
                                  <button onClick={() => setChecklistItems(checklistItems.filter(i => i.id !== item.id))}>🗑️</button>
                              </div>
                          ))}
                          <button className="sn-add-row" onClick={addChecklistItemField}>+ {lang === 'en' ? 'Add item' : 'إضافة نقطة'}</button>
                      </div>
                  </div>
                  <div className="sn-modal-footer">
                      <button className="btn btn-primary" onClick={handleCreateChecklist}>💾 {lang === 'en' ? 'Save Checklist' : 'حفظ القائمة'}</button>
                  </div>
              </div>
          </div>
      )}

      {/* VIEW/EDIT CHECKLIST MODAL */}
      {isChecklistModalOpen && viewingChecklist && (
          <div className="sn-modal-overlay" onClick={() => setIsChecklistModalOpen(false)}>
              <div className="sn-modal animate-pop" onClick={e => e.stopPropagation()}>
                  <div className="sn-modal-header">
                      <h3>{viewingChecklist.title}</h3>
                      <button className="sn-close" onClick={() => setIsChecklistModalOpen(false)}>×</button>
                  </div>
                  <div className="sn-modal-body">
                      <div className="sn-checklist-viewer">
                          {viewingChecklist.items.map(item => (
                              <div 
                                key={item.id} 
                                className={`sn-viewer-row ${item.completed ? 'done' : ''}`}
                                onClick={() => toggleChecklistItem(viewingChecklist, item.id)}
                              >
                                  <span className={`sn-checkbox ${item.completed ? 'checked' : ''}`}>
                                      {item.completed && '✓'}
                                  </span>
                                  <span className="sn-item-text" style={{ color: 'var(--text)' }}>{item.text}</span>
                              </div>
                          ))}
                      </div>
                      <div className="sn-progress-bar">
                          <div className="sn-progress-fill" style={{ width: `${(viewingChecklist.items.filter(i => i.completed).length / viewingChecklist.items.length) * 100}%` }}></div>
                          <span className="sn-progress-text">
                              {lang === 'en' ? `Completed ${viewingChecklist.items.filter(i => i.completed).length} of ${viewingChecklist.items.length}` : `تم إنجاز ${viewingChecklist.items.filter(i => i.completed).length} من ${viewingChecklist.items.length}`}
                          </span>
                      </div>
                  </div>
                  <div className="sn-modal-footer">
                      <button className="btn btn-red" onClick={(e) => { handleDeleteNote(e, viewingChecklist.id); setIsChecklistModalOpen(false); }}>🗑️ {lang === 'en' ? 'Delete Checklist' : 'حذف القائمة'}</button>
                      <button className="btn btn-primary" onClick={() => setIsChecklistModalOpen(false)}>{lang === 'en' ? 'Close' : 'إغلاق'}</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
