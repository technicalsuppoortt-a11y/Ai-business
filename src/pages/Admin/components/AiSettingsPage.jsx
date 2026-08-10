import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Key, DollarSign, Cpu, Save, RefreshCw, BarChart2, List, Settings, Search, Download, Layers, Eye, EyeOff, Copy, Check, Activity, Sliders, MessageSquare, AlertCircle, Calendar, Users, Filter, ChevronLeft, ChevronRight, TrendingUp, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { doc, setDoc, serverTimestamp, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../context/AuthContext';
import { TOOLS_24H } from '../../../data/toolsData';
import { JOURNEY_STEPS } from '../../../data/database';
import { useToast } from '../../../context/ToastContext';

const CustomDateDropdown = ({ value, onChange, isRTL }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = [
    { value: 'all', label: isRTL ? 'كل الوقت' : 'All Time' },
    { value: 'today', label: isRTL ? 'اليوم' : 'Today' },
    { value: 'week', label: isRTL ? 'هذا الأسبوع' : 'This Week' },
    { value: 'month', label: isRTL ? 'هذا الشهر' : 'This Month' }
  ];

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div style={{ position: 'relative', minWidth: '160px' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg2)',
          border: '1px solid var(--line2)',
          borderRadius: '10px',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 'bold',
          color: 'var(--text)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isOpen ? '0 0 0 2px var(--orange)' : 'none'
        }}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={16} style={{ color: 'var(--text3)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          [isRTL ? 'right' : 'left']: 0,
          width: '100%',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 50,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '6px'
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{
                width: '100%',
                textAlign: isRTL ? 'right' : 'left',
                padding: '10px 12px',
                background: value === opt.value ? 'var(--orange)' : 'transparent',
                color: value === opt.value ? '#fff' : 'var(--text)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: value === opt.value ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: '0.2s'
              }}
              onMouseEnter={e => { if (value !== opt.value) e.target.style.background = 'var(--bg2)' }}
              onMouseLeave={e => { if (value !== opt.value) e.target.style.background = 'transparent' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AiSettingsPage = () => {
  const { state } = useApp();
  const { currentUser } = useAuth();
  const toast = useToast();
  const isRTL = state.language === 'ar';

  const [activeSubTab, setActiveSubTab] = useState('config'); // 'config' | 'logs' | 'analytics'
  const [activeCategoryTab, setActiveCategoryTab] = useState('');
  
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);


  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // New Dashboard States
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;


  // Fetch Usage Logs
  useEffect(() => {
    if (activeSubTab !== 'logs' && activeSubTab !== 'analytics') return;
    setLogsLoading(true);
    const q = query(collection(db, 'usage_logs'), orderBy('timestamp', 'desc'), limit(500));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLogs(data);
      setLogsLoading(false);
    }, (err) => {
      console.error(err);
      setLogsLoading(false);
    });
    return () => unsub();
  }, [activeSubTab]);

  // Dynamically compile all tools that have liveAiFeatures
  const liveAiTools = useMemo(() => {
    const allRegistered = [...JOURNEY_STEPS, ...TOOLS_24H];
    return allRegistered.filter(t => t.liveAiFeatures && t.liveAiFeatures.length > 0);
  }, []);

  // Generate dynamic defaults
  const dynamicDefaults = useMemo(() => {
    const defs = {
      openaiApiKey: '',
      temperature: 0.7,
      maxTokens: 2000,
      maxBudget: 100,
      systemPrompt: '',
    };
    liveAiTools.forEach(tool => {
      tool.liveAiFeatures.forEach(feature => {
        defs[feature.key] = feature.defaultCost || 10;
      });
    });
    return defs;
  }, [liveAiTools]);

  const [settings, setSettings] = useState(dynamicDefaults);

  // Group tools by their group_en / group_ar for rendering
  const groupedTools = useMemo(() => {
    const groups = {};
    liveAiTools.forEach(tool => {
      const gName = isRTL ? (tool.group_ar || tool.group_en || 'أخرى') : (tool.group_en || 'Other');
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(tool);
    });
    return groups;
  }, [liveAiTools, isRTL]);

  const categoryKeys = Object.keys(groupedTools);
  useEffect(() => {
    if (categoryKeys.length > 0 && !activeCategoryTab) {
      setActiveCategoryTab(categoryKeys[0]);
    }
  }, [categoryKeys, activeCategoryTab]);

  // Firestore Sync
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tenants', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        
        // Dynamically merge
        const merged = {
          ...dynamicDefaults,
          ...data,
          openaiApiKey: data.openaiApiKey || '',
          temperature: data.temperature ?? 0.7,
          maxTokens: data.maxTokens ?? 2000,
          maxBudget: data.maxBudget ?? 100,
          systemPrompt: data.systemPrompt || '',
        };

        // Ensure numbers
        liveAiTools.forEach(tool => {
          tool.liveAiFeatures.forEach(feat => {
            if (data[feat.key] !== undefined) {
              merged[feat.key] = Number(data[feat.key]);
            }
          });
        });

        setSettings(merged);
      }
    }, (err) => {
      console.error(err);
      setLoadError(isRTL ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading settings');
    });
    return () => unsub();
  }, [isRTL, dynamicDefaults, liveAiTools]);

  const handleFieldChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTestKey = async () => {
    if (!settings.openaiApiKey) return;
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${settings.openaiApiKey}`
        }
      });
      if (res.ok) {
        setTestResult({ success: true, message: isRTL ? 'تم الاتصال بنجاح!' : 'Connection successful!' });
      } else {
        const errorData = await res.json();
        setTestResult({ success: false, message: errorData?.error?.message || (isRTL ? 'فشل الاتصال' : 'Connection failed') });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        openaiApiKey: settings.openaiApiKey,
        temperature: Number(settings.temperature),
        maxTokens: Number(settings.maxTokens),
        maxBudget: Number(settings.maxBudget),
        systemPrompt: settings.systemPrompt,
        updatedAt: serverTimestamp(),
      };
      
      // Enforce numeric types for all dynamic costs
      liveAiTools.forEach(tool => {
        tool.liveAiFeatures.forEach(feat => {
          payload[feat.key] = Number(settings[feat.key]);
        });
      });

      await setDoc(doc(db, 'tenants', 'global'), payload, { merge: true });
      setSaved(true);
      toast(isRTL ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!', 'success');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };


  // --- Analytics & Formatting Helpers ---
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];
    
    // Date Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(log => {
        if (!log.timestamp) return false;
        const logDate = log.timestamp.toDate();
        if (dateFilter === 'today') {
          return logDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return logDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          return logDate >= monthAgo;
        }
        return true;
      });
    }

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        (log.userEmail || '').toLowerCase().includes(q) ||
        (log.userName || '').toLowerCase().includes(q) ||
        (log.toolName || '').toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [logs, dateFilter, searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToCSV = () => {
    const headers = [
      isRTL ? 'التاريخ' : 'Date',
      isRTL ? 'المستخدم' : 'User',
      isRTL ? 'البريد الإلكتروني' : 'Email',
      isRTL ? 'الأداة' : 'Tool',
      isRTL ? 'النموذج' : 'Model',
      isRTL ? 'إدخال' : 'Prompt Tokens',
      isRTL ? 'مخرجات' : 'Completion Tokens',
      isRTL ? 'إجمالي الكلمات' : 'Total Tokens',
      isRTL ? 'التكلفة ($)' : 'Cost ($)',
      isRTL ? 'النقاط المخصومة' : 'Credits Deducted'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => {
        const date = log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : 'N/A';
        return [
          `"${date}"`,
          `"${log.userName || 'N/A'}"`,
          `"${log.userEmail || 'N/A'}"`,
          `"${log.toolName || log.toolKey}"`,
          `"${log.model || 'N/A'}"`,
          log.promptTokens || 0,
          log.completionTokens || 0,
          log.totalTokens || 0,
          (log.estimatedCostUsd || 0).toFixed(6),
          log.creditsDeducted || 0
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usage_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const dashboardMetrics = useMemo(() => {
    let totalUsd = 0;
    let totalTokens = 0;
    let totalRequests = filteredLogs.length;

    const userStats = {};
    const toolStats = {};
    const timeTrend = {}; // By Day

    filteredLogs.forEach(log => {
      totalUsd += (log.estimatedCostUsd || 0);
      totalTokens += (log.totalTokens || 0);

      // User Stats
      const uEmail = log.userEmail || 'Unknown';
      if (!userStats[uEmail]) {
        userStats[uEmail] = { email: uEmail, name: log.userName || uEmail, requests: 0, cost: 0, credits: 0, tokens: 0, tools: {} };
      }
      userStats[uEmail].requests += 1;
      userStats[uEmail].cost += (log.estimatedCostUsd || 0);
      userStats[uEmail].credits += (log.creditsDeducted || 0);
      userStats[uEmail].tokens += (log.totalTokens || 0);
      const tName = log.toolName || log.toolKey || 'Action';
      userStats[uEmail].tools[tName] = (userStats[uEmail].tools[tName] || 0) + 1;

      // Tool Stats
      if (!toolStats[tName]) {
        toolStats[tName] = { name: tName, requests: 0, cost: 0 };
      }
      toolStats[tName].requests += 1;
      toolStats[tName].cost += (log.estimatedCostUsd || 0);

      // Time Trend
      if (log.timestamp) {
        const dStr = new Date(log.timestamp.toDate()).toISOString().split('T')[0];
        if (!timeTrend[dStr]) timeTrend[dStr] = { date: dStr, tokens: 0, cost: 0 };
        timeTrend[dStr].tokens += (log.totalTokens || 0);
        timeTrend[dStr].cost += (log.estimatedCostUsd || 0);
      }
    });

    const rankedUsers = Object.values(userStats).sort((a, b) => b.requests - a.requests).map(u => {
      let maxT = 'N/A';
      let maxTC = 0;
      for (const [tn, tc] of Object.entries(u.tools)) {
        if (tc > maxTC) { maxT = tn; maxTC = tc; }
      }
      return { ...u, mostUsedTool: maxT };
    });

    const rankedTools = Object.values(toolStats).sort((a, b) => b.requests - a.requests);
    const trendData = Object.values(timeTrend).sort((a, b) => a.date.localeCompare(b.date));

    return { totalUsd, totalTokens, totalRequests, rankedUsers, rankedTools, trendData };
  }, [filteredLogs]);

  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EAB308'];

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text2)',
    marginBottom: '6px',
    textTransform: 'uppercase',
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg3)',
    border: '1px solid var(--line2)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  };

  const cardStyle = {
    background: 'var(--panel)',
    border: '1px solid var(--line)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
  };

  const cardTitleStyle = {
    fontSize: '15px', 
    fontWeight: '700', 
    color: 'var(--text)', 
    marginBottom: '16px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px'
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px', direction: isRTL ? 'rtl' : 'ltr', fontFamily: "'Tajawal', 'Cairo', sans-serif" }}>
      {/* Tab Controls */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveSubTab('config')} 
          style={{ 
            color: activeSubTab === 'config' ? 'var(--orange)' : 'var(--text2)', 
            fontWeight: 'bold', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '5px 0',
            borderBottom: activeSubTab === 'config' ? '2px solid var(--orange)' : '2px solid transparent',
            marginBottom: '-13px'
          }}
        >
          {isRTL ? 'إعدادات الخدمة' : 'Service Settings'}
        </button>
        <button 
          onClick={() => setActiveSubTab('logs')} 
          style={{ 
            color: activeSubTab === 'logs' ? 'var(--orange)' : 'var(--text2)', 
            fontWeight: 'bold', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '5px 0',
            borderBottom: activeSubTab === 'logs' ? '2px solid var(--orange)' : '2px solid transparent',
            marginBottom: '-13px'
          }}
        >
          {isRTL ? 'سجل الاستهلاك الفعلي' : 'Usage Logs'}
        </button>
        <button 
          onClick={() => setActiveSubTab('analytics')} 
          style={{ 
            color: activeSubTab === 'analytics' ? 'var(--orange)' : 'var(--text2)', 
            fontWeight: 'bold', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '5px 0',
            borderBottom: activeSubTab === 'analytics' ? '2px solid var(--orange)' : '2px solid transparent',
            marginBottom: '-13px'
          }}
        >
          {isRTL ? 'لوحة التحليلات' : 'Analytics Dashboard'}
        </button>
      </div>

      {activeSubTab === 'config' && (
        <>
          {/* Main OpenAI Key Section */}
          <div style={cardStyle}>
            <h4 style={cardTitleStyle}>
              <Key size={18} style={{ color: 'var(--orange)' }} />
              {isRTL ? 'مفتاح OpenAI الرئيسي (OpenAI Secret Key)' : 'Main OpenAI API Key'}
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={settings.openaiApiKey}
                  onChange={e => handleFieldChange('openaiApiKey', e.target.value)}
                  style={{ ...inputStyle, paddingRight: isRTL ? '14px' : '40px', paddingLeft: isRTL ? '40px' : '14px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line2)'}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{ position: 'absolute', right: isRTL ? 'auto' : '10px', left: isRTL ? '10px' : 'auto', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(settings.openaiApiKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                title={isRTL ? "نسخ المفتاح" : "Copy Key"}
                style={{ background: 'var(--bg2)', border: '1px solid var(--line2)', borderRadius: '8px', padding: '10px', cursor: 'pointer', color: copiedKey ? 'var(--success)' : 'var(--text2)', transition: '0.2s' }}
              >
                {copiedKey ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button 
                onClick={handleTestKey}
                disabled={testingKey || !settings.openaiApiKey}
                title={isRTL ? "اختبار الاتصال" : "Test Connection"}
                style={{ background: 'var(--bg2)', border: '1px solid var(--line2)', borderRadius: '8px', padding: '10px', cursor: (!settings.openaiApiKey || testingKey) ? 'not-allowed' : 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' }}
              >
                {testingKey ? <RefreshCw size={16} className="animate-spin" /> : <Activity size={16} />}
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{isRTL ? 'فحص' : 'Test'}</span>
              </button>
            </div>
            {testResult && (
              <p style={{ fontSize: '12px', color: testResult.success ? 'var(--success)' : 'var(--danger)', marginTop: '8px' }}>
                {testResult.message}
              </p>
            )}
          </div>

          {/* Global Generation Settings */}
          <div style={cardStyle}>
            <h4 style={cardTitleStyle}>
              <Sliders size={18} style={{ color: 'var(--orange)' }} />
              {isRTL ? 'إعدادات التوليد المتقدمة (Global Generation Settings)' : 'Global Generation Settings'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>{isRTL ? 'درجة الإبداع (Temperature)' : 'Temperature'}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1.2"
                  value={settings.temperature}
                  onChange={e => handleFieldChange('temperature', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line2)'}
                />
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                  {isRTL ? '0.0 (دقيق جداً) - 1.2 (مبدع جداً)' : '0.0 (Strict) to 1.2 (Creative)'}
                </div>
              </div>
              <div>
                <label style={labelStyle}>{isRTL ? 'الحد الأقصى للكلمات (Max Tokens)' : 'Max Tokens'}</label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  value={settings.maxTokens}
                  onChange={e => handleFieldChange('maxTokens', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line2)'}
                />
              </div>
              <div>
                <label style={labelStyle}>{isRTL ? 'الحد الأقصى للميزانية ($)' : 'Max Budget Limit ($)'}</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={14} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={settings.maxBudget}
                    onChange={e => handleFieldChange('maxBudget', e.target.value)}
                    style={{ ...inputStyle, paddingLeft: isRTL ? '14px' : '32px', paddingRight: isRTL ? '32px' : '14px' }}
                    onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line2)'}
                  />
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>
                <MessageSquare size={14} style={{ verticalAlign: 'middle', marginInlineEnd: '4px' }} />
                {isRTL ? 'تعليمات النظام العامة (Global System Prompt)' : 'Global System Prompt'}
              </label>
              <textarea
                rows={3}
                placeholder={isRTL ? "مثال: أنت خبير تسويق إلكتروني وتكتب دائماً بصيغة احترافية..." : "Example: You are a senior marketing expert..."}
                value={settings.systemPrompt}
                onChange={e => handleFieldChange('systemPrompt', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                onBlur={e => e.target.style.borderColor = 'var(--line2)'}
              />
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} />
                {isRTL ? 'سيتم دمج هذا النص قبل جميع التعليمات المرسلة للذكاء الاصطناعي.' : 'This prompt will be prepended to all individual AI tool requests.'}
              </div>
            </div>
          </div>

          {/* Dynamic Tools Categories with Tabs */}
          <div style={cardStyle}>
            <h4 style={cardTitleStyle}>
              <Layers size={18} style={{ color: 'var(--orange)' }} />
              <span>{isRTL ? 'تكلفة الأدوات بالنقاط (Tools Credits Config)' : 'Tools Credits Config'}</span>
            </h4>

            {/* Sub-Category Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              {categoryKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveCategoryTab(key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: activeCategoryTab === key ? 'var(--orange)' : 'var(--bg2)',
                    color: activeCategoryTab === key ? '#fff' : 'var(--text)',
                    border: '1px solid',
                    borderColor: activeCategoryTab === key ? 'var(--orange)' : 'var(--line)',
                    fontWeight: activeCategoryTab === key ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '13px'
                  }}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Render Only Active Category */}
            {activeCategoryTab && groupedTools[activeCategoryTab] && (() => {
              const renderToolCard = (tool) => (
                  <div key={tool.id} style={{ background: 'var(--bg2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', color: 'var(--text)', borderBottom: '1px solid var(--line2)', paddingBottom: '8px' }}>
                      {tool.icon && React.createElement(tool.icon, { size: 16, style: { color: 'var(--orange)' } })}
                      {isRTL ? (tool.label_ar || tool.label_en) : (tool.label_en || tool.label_ar)}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {tool.liveAiFeatures && tool.liveAiFeatures.map((feat, index) => {
                        const showHeader = feat.groupHeader_ar && (index === 0 || tool.liveAiFeatures[index - 1].groupHeader_ar !== feat.groupHeader_ar);
                        return (
                          <React.Fragment key={feat.key}>
                            {showHeader && (
                              <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--orange)', marginTop: index > 0 ? '8px' : '0', padding: '0 4px' }}>
                                {isRTL ? feat.groupHeader_ar : (feat.groupHeader_en || feat.groupHeader_ar)}
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line2)' }}>
                              
                              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: 0, flex: 1 }}>
                                {isRTL ? (feat.label_ar || feat.label_en) : (feat.label_en || feat.label_ar)}
                              </label>
                              
                              <div style={{ position: 'relative', width: '80px' }}>
                                <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'left' : 'right']: '12px', fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold', pointerEvents: 'none' }}>
                                  CR
                                </span>
                                <input 
                                  type="number" 
                                  value={settings[feat.key] || ''} 
                                  onChange={e => handleFieldChange(feat.key, e.target.value)} 
                                  style={{ 
                                    ...inputStyle, 
                                    padding: '8px', 
                                    [isRTL ? 'paddingLeft' : 'paddingRight']: '32px',
                                    textAlign: 'center',
                                    margin: 0
                                  }} 
                                  onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                                  onBlur={e => e.target.style.borderColor = 'var(--line2)'}
                                />
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
              );

              // Special Two-Column Layout for Content & Marketing
              if (activeCategoryTab === 'المحتوى والتسويق' || activeCategoryTab === 'Content & Marketing') {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Column 1 (Left): Social Media */}
                    <div className="flex flex-col gap-6">
                      {groupedTools[activeCategoryTab].filter(t => t.id === 'social-media').map(renderToolCard)}
                    </div>
                    
                    {/* Column 2 (Right): Campaign Planner + Ad Creative */}
                    <div className="flex flex-col gap-6">
                      {groupedTools[activeCategoryTab].filter(t => t.id === 'marketing-plan' || t.id === 'ad-creative').map(renderToolCard)}
                      
                      {/* Catch-all for any other tool that might get added to this category in the future */}
                      {groupedTools[activeCategoryTab].filter(t => t.id !== 'social-media' && t.id !== 'marketing-plan' && t.id !== 'ad-creative').map(renderToolCard)}
                    </div>
                  </div>
                );
              }

              // Default Layout for other categories
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {groupedTools[activeCategoryTab].map(renderToolCard)}
                </div>
              );
            })()}
          </div>

          <div style={{ position: 'sticky', bottom: '20px', zIndex: 10 }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 'bold', boxShadow: '0 8px 16px rgba(249, 115, 22, 0.2)' }}>
              <Save size={18} />
              <span>{saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ جميع التغييرات' : 'Save All Changes')}</span>
            </button>
          </div>
          
          {saved && <p style={{ color: 'var(--success)', fontSize: '14px', marginTop: '10px', textAlign: 'center', fontWeight: 'bold' }}>{isRTL ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!'}</p>}
        </>
      )}

      {activeSubTab === 'logs' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
            <h4 style={{ ...cardTitleStyle, marginBottom: 0 }}>
              <List size={18} style={{ color: 'var(--orange)' }} />
              {isRTL ? 'سجل الاستهلاك الفعلي' : 'Live Usage Logs'}
            </h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input 
                  type="text"
                  placeholder={isRTL ? "بحث بالبريد أو الأداة..." : "Search user or tool..."}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ ...inputStyle, padding: '8px 12px', [isRTL ? 'paddingRight' : 'paddingLeft']: '36px', width: '200px' }}
                />
              </div>
              <CustomDateDropdown 
                value={dateFilter} 
                onChange={(v) => { setDateFilter(v); setCurrentPage(1); }} 
                isRTL={isRTL} 
              />
              <button onClick={exportToCSV} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: 'var(--bg2)', border: '1px solid var(--line2)', cursor: 'pointer', color: 'var(--text)' }}>
                <Download size={16} />
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{isRTL ? 'تصدير CSV' : 'Export CSV'}</span>
              </button>
            </div>
          </div>
          
          {logsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 16px' }} />
              <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div style={{ background: 'var(--bg2)', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', color: 'var(--text2)', border: '1px dashed var(--line)' }}>
              <List size={32} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '14px' }}>{isRTL ? 'لا توجد سجلات مطابقة.' : 'No matching logs found.'}</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--line2)', marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--line2)' }}>
                      <th style={{ padding: '12px', color: 'var(--text2)', fontWeight: 'bold' }}>{isRTL ? 'التاريخ' : 'Date'}</th>
                      <th style={{ padding: '12px', color: 'var(--text2)', fontWeight: 'bold' }}>{isRTL ? 'المستخدم' : 'User'}</th>
                      <th style={{ padding: '12px', color: 'var(--text2)', fontWeight: 'bold' }}>{isRTL ? 'الأداة والنموذج' : 'Tool & Model'}</th>
                      <th style={{ padding: '12px', color: 'var(--text2)', fontWeight: 'bold', textAlign: 'center' }}>{isRTL ? 'الكلمات (Tokens)' : 'Tokens'}</th>
                      <th style={{ padding: '12px', color: 'var(--text2)', fontWeight: 'bold' }}>{isRTL ? 'التكلفة' : 'Cost'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
                        <td style={{ padding: '12px', color: 'var(--text3)' }}>
                          {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString(isRTL ? 'ar-EG' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ color: 'var(--text)', fontWeight: 'bold' }}>{log.userName || log.userEmail.split('@')[0]}</div>
                          <div style={{ color: 'var(--text3)', fontSize: '11px' }}>{log.userEmail}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ color: 'var(--text)', fontWeight: '600' }}>{log.toolName || log.toolKey}</div>
                          <div style={{ color: 'var(--orange)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Cpu size={12} /> {log.model || 'gpt-4o-mini'}
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', background: 'var(--bg2)', padding: '4px 8px', borderRadius: '16px', fontSize: '11px', border: '1px solid var(--line)' }}>
                            <span style={{ color: '#10B981' }} title="Prompt">{log.promptTokens || 0}</span>
                            <span style={{ color: 'var(--text3)' }}>/</span>
                            <span style={{ color: '#3B82F6' }} title="Completion">{log.completionTokens || 0}</span>
                            <span style={{ color: 'var(--text3)' }}>=</span>
                            <span style={{ color: 'var(--text)', fontWeight: 'bold' }} title="Total">{log.totalTokens || 0}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ color: 'var(--text)', fontWeight: 'bold' }}>${(log.estimatedCostUsd || 0).toFixed(6)}</div>
                          <div style={{ color: 'var(--orange)', fontSize: '11px' }}>{log.creditsDeducted} CR</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
                    style={{ background: currentPage === 1 ? 'transparent' : 'var(--bg2)', border: '1px solid var(--line)', color: currentPage === 1 ? 'var(--text3)' : 'var(--text)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                  
                  {getPageNumbers().map((num, i) => (
                    <button
                      key={i}
                      disabled={num === '...'}
                      onClick={() => num !== '...' && setCurrentPage(num)}
                      className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 font-semibold text-sm"
                      style={{
                        background: currentPage === num ? 'var(--orange)' : 'transparent',
                        border: num === '...' ? 'none' : '1px solid ' + (currentPage === num ? 'var(--orange)' : 'var(--line)'),
                        color: currentPage === num ? '#fff' : (num === '...' ? 'var(--text3)' : 'var(--text)'),
                        cursor: num === '...' ? 'default' : 'pointer',
                        boxShadow: currentPage === num ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none'
                      }}
                    >
                      {num}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
                    style={{ background: currentPage === totalPages ? 'transparent' : 'var(--bg2)', border: '1px solid var(--line)', color: currentPage === totalPages ? 'var(--text3)' : 'var(--text)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeSubTab === 'analytics' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h4 style={{ ...cardTitleStyle, marginBottom: 0 }}>
              <TrendingUp size={18} style={{ color: 'var(--orange)' }} />
              {isRTL ? 'لوحة التحليلات المتقدمة' : 'Advanced Analytics Dashboard'}
            </h4>
            
            <CustomDateDropdown 
              value={dateFilter} 
              onChange={(v) => setDateFilter(v)} 
              isRTL={isRTL} 
            />
          </div>
          
          {logsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 16px' }} />
            </div>
          ) : (
            <>
              {/* TOP METRIC CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--bg2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line2)' }}>
                  <div style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} /> {isRTL ? 'إجمالي تكلفة المنصة' : 'Total Platform Cost'}
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text)' }}>
                    ${(dashboardMetrics.totalUsd).toFixed(4)}
                  </div>
                </div>
                
                <div style={{ background: 'var(--bg2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line2)' }}>
                  <div style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={16} /> {isRTL ? 'إجمالي الكلمات المستهلكة' : 'Total Tokens Consumed'}
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text)' }}>
                    {(dashboardMetrics.totalTokens).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line2)' }}>
                  <div style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={16} /> {isRTL ? 'إجمالي طلبات الذكاء' : 'Total AI Requests'}
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text)' }}>
                    {(dashboardMetrics.totalRequests).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* CHARTS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                
                {/* Trend Chart */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5" style={{ minWidth: 0 }}>
                  <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: '#E5E7EB', marginBottom: '20px' }}>
                    {isRTL ? 'استهلاك الكلمات عبر الزمن' : 'Token Consumption Trend'}
                  </h5>
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardMetrics.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(0)}k` : value} tickMargin={10} />
                        <RechartsTooltip 
                          contentStyle={{ background: '#1E1B4B', border: '1px solid #4C1D95', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                          itemStyle={{ color: '#C4B5FD', fontWeight: 'bold' }}
                          labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="tokens" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tool Distribution Chart */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5" style={{ minWidth: 0 }}>
                  <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: '#E5E7EB', marginBottom: '20px' }}>
                    {isRTL ? 'الأدوات الأعلى تكلفة' : 'Highest Cost Tools'}
                  </h5>
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardMetrics.rankedTools.slice(0, 5)} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${value.toFixed(4)}`} tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} width={120} tickLine={false} axisLine={false} tickMargin={10} />
                        <RechartsTooltip 
                          formatter={(value) => `${Number(value).toFixed(4)}`}
                          contentStyle={{ background: '#1E1B4B', border: '1px solid #4C1D95', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                          itemStyle={{ color: '#06B6D4', fontWeight: 'bold' }}
                          cursor={{ fill: '#374151', opacity: 0.2 }}
                        />
                        <Bar dataKey="cost" radius={[0, 6, 6, 0]} barSize={24} fill="#06B6D4">
                          {dashboardMetrics.rankedTools.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366F1" : "#06B6D4"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* USER ACTIVITY TABLE */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 mb-8">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h5 style={{ fontSize: '15px', fontWeight: 'bold', color: '#E5E7EB' }}>
                    {isRTL ? 'تحليل استهلاك ونشاط جميع المستخدمين' : 'User Activity Analysis'}
                  </h5>
                </div>
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #1E293B' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#0F172A', borderBottom: '1px solid #1E293B' }}>
                        <th style={{ padding: '16px', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'المستخدم' : 'User'}</th>
                        <th style={{ padding: '16px', color: '#9CA3AF', fontWeight: '600', textAlign: 'center' }}>{isRTL ? 'الطلبات' : 'Requests'}</th>
                        <th style={{ padding: '16px', color: '#9CA3AF', fontWeight: '600', textAlign: 'center' }}>{isRTL ? 'النقاط المستهلكة' : 'Credits Used'}</th>
                        <th style={{ padding: '16px', color: '#9CA3AF', fontWeight: '600', textAlign: 'center' }}>{isRTL ? 'التكلفة الإجمالية' : 'Total Cost'}</th>
                        <th style={{ padding: '16px', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'أكثر أداة استخداماً' : 'Most Used Tool'}</th>
                        <th style={{ padding: '16px', color: '#9CA3AF', fontWeight: '600', textAlign: 'center' }}>{isRTL ? 'إجراء' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardMetrics.rankedUsers.slice(0, 20).map((user, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #1E293B', background: i % 2 === 0 ? '#1E293B40' : 'transparent', transition: 'background 0.2s' }} className="hover:bg-slate-800/50">
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                                {(user.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 'bold', color: '#F3F4F6' }}>{user.name}</div>
                                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#F3F4F6' }}>{user.requests}</td>
                          <td style={{ padding: '16px', textAlign: 'center', color: '#8B5CF6', fontWeight: 'bold' }}>{user.credits} CR</td>
                          <td style={{ padding: '16px', textAlign: 'center', color: '#10B981', fontWeight: 'bold' }}>${(user.cost || 0).toFixed(4)}</td>
                          <td style={{ padding: '16px', color: '#D1D5DB' }}>{user.mostUsedTool}</td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <button 
                              onClick={() => toast(isRTL ? 'ميزة شحن الرصيد ستتوفر قريباً' : 'Charge credits coming soon', 'info')}
                              className="hover:bg-indigo-500/10 transition-colors duration-200"
                              style={{ padding: '6px 14px', borderRadius: '8px', background: 'transparent', color: '#818CF8', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(99, 102, 241, 0.3)', cursor: 'pointer', outline: 'none' }}>
                              {isRTL ? 'شحن رصيد' : 'Charge'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AiSettingsPage;
