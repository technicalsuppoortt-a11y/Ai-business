import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crown, Plus, Edit2, Trash2, Power, PowerOff, Save, Loader2, Users, Calendar, 
  Settings, CheckCircle2, XCircle, Search, AlertTriangle
} from "lucide-react";
import { db, firestore } from "../../config/firebase";
import { toast } from "sonner";
import { useAppState } from "../../context/StateContext";
import type { SubscriptionPlan } from "./SubscriptionPlansSection";
import type { UserProfile } from "../../context/AuthContext";

export default function AdminSubscriptionPlansSection() {
  const { state } = useAppState();
  const isRtl = state?.settings?.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  const [activeTab, setActiveTab] = useState<'plans' | 'users' | 'settings'>('plans');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [trialDurationDays, setTrialDurationDays] = useState<number>(30);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  
  // Delete Dialog State
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    titleEn: "",
    titleAr: "",
    price: 0,
    billingCycle: "monthly",
    featuresEn: [],
    featuresAr: [],
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Plans
      const plansSnap = await firestore.getDocs(firestore.collection(db, "subscriptionPlans"));
      setPlans(plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubscriptionPlan)));

      // Fetch Users
      const usersSnap = await firestore.getDocs(firestore.collection(db, "users"));
      setUsers(usersSnap.docs.map(doc => doc.data() as UserProfile));

      // Fetch Settings
      const configDoc = await firestore.getDoc(firestore.doc(db, "settings", "subscriptionConfig"));
      if (configDoc.exists()) {
        const data = configDoc.data();
        if (data.trialDurationDays !== undefined) setTrialDurationDays(data.trialDurationDays);
      }
    } catch (err) {
      console.error("Error fetching admin subscription data:", err);
      toast.error(t("حدث خطأ أثناء جلب البيانات", "Error fetching data"));
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await firestore.setDoc(
        firestore.doc(db, "settings", "subscriptionConfig"), 
        { trialDurationDays },
        { merge: true }
      );
      toast.success(t("تم حفظ الإعدادات بنجاح", "Settings saved successfully"));
    } catch (err) {
      toast.error(t("حدث خطأ أثناء حفظ الإعدادات", "Error saving settings"));
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openPlanModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData(plan);
    } else {
      setEditingPlan(null);
      setFormData({
        titleEn: "",
        titleAr: "",
        price: 0,
        billingCycle: "monthly",
        featuresEn: [""],
        featuresAr: [""],
        isActive: true,
      });
    }
    setShowPlanModal(true);
  };

  const savePlan = async () => {
    if (!formData.titleEn || !formData.titleAr) {
      toast.error(t("الرجاء إدخال عناوين الباقة", "Please enter plan titles"));
      return;
    }
    
    setIsSavingPlan(true);
    try {
      if (editingPlan) {
        await firestore.updateDoc(firestore.doc(db, "subscriptionPlans", editingPlan.id), formData);
        toast.success(t("تم تحديث الباقة", "Plan updated"));
      } else {
        await firestore.addDoc(firestore.collection(db, "subscriptionPlans"), formData);
        toast.success(t("تمت إضافة الباقة", "Plan added"));
      }
      setShowPlanModal(false);
      fetchData();
    } catch (err) {
      toast.error(t("حدث خطأ أثناء حفظ الباقة", "Error saving plan"));
    } finally {
      setIsSavingPlan(false);
    }
  };

  const togglePlanStatus = async (plan: SubscriptionPlan) => {
    try {
      await firestore.updateDoc(firestore.doc(db, "subscriptionPlans", plan.id), { isActive: !plan.isActive });
      toast.success(t("تم تحديث حالة الباقة", "Plan status updated"));
      fetchData();
    } catch (err) {
      toast.error(t("حدث خطأ", "Error updating plan status"));
    }
  };

  const deletePlan = async (id: string) => {
    setPlanToDelete(id);
  };

  const confirmDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await firestore.deleteDoc(firestore.doc(db, "subscriptionPlans", id));
      toast.success(t("تم الحذف بنجاح", "Deleted successfully"));
      fetchData();
      setPlanToDelete(null);
    } catch (err) {
      toast.error(t("حدث خطأ", "Error deleting plan"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFeatureChange = (lang: 'ar' | 'en', index: number, value: string) => {
    const key = lang === 'ar' ? 'featuresAr' : 'featuresEn';
    const newFeatures = [...(formData[key] || [])];
    newFeatures[index] = value;
    setFormData({ ...formData, [key]: newFeatures });
  };

  const addFeature = (lang: 'ar' | 'en') => {
    const key = lang === 'ar' ? 'featuresAr' : 'featuresEn';
    setFormData({ ...formData, [key]: [...(formData[key] || []), ""] });
  };

  const removeFeature = (lang: 'ar' | 'en', index: number) => {
    const key = lang === 'ar' ? 'featuresAr' : 'featuresEn';
    const newFeatures = [...(formData[key] || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, [key]: newFeatures });
  };

  const extendUserTrial = async (uid: string) => {
    const userDocRef = firestore.doc(db, "users", uid);
    try {
      // Add 30 days to trial
      const newEndDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
      await firestore.updateDoc(userDocRef, {
        "subscription.status": "trial",
        "subscription.endDate": newEndDate,
        trialEndDate: newEndDate
      });
      toast.success(t("تم تمديد الفترة التجريبية", "Trial extended"));
      fetchData();
    } catch (err) {
      toast.error(t("حدث خطأ", "Error extending trial"));
    }
  };

  const filteredUsers = users.filter(u => 
    u.role !== 'admin' && 
    ((u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
     (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
  );

  if (loading && !showPlanModal) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto animate-fade-in px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-[#12141c]/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Crown className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("إدارة خطط الاشتراك", "Subscription Plans Management")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("التحكم الكامل في الباقات، المستخدمين، وإعدادات الفترة التجريبية", "Full control over plans, users, and trial settings")}
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-[#090a0f] rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'plans' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Crown className="h-4 w-4 shrink-0" />
            <span>{t("الباقات", "Plans")}</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'users' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span>{t("المشتركون", "Subscribers")}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'settings' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>{t("الإعدادات", "Settings")}</span>
          </button>
        </div>
      </div>

      {/* PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => openPlanModal()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              {t("إضافة باقة جديدة", "Add New Plan")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className={`bg-white dark:bg-[#12141c] rounded-2xl border-2 overflow-hidden flex flex-col transition-all ${plan.isActive ? 'border-emerald-500/30' : 'border-slate-200 dark:border-slate-800 opacity-60'}`}>
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {isRtl ? plan.titleAr : plan.titleEn}
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={() => togglePlanStatus(plan)} className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors bg-slate-50 dark:bg-slate-900 rounded-lg">
                        {plan.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </button>
                      <button onClick={() => openPlanModal(plan)} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => deletePlan(plan.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">${plan.price}</span>
                    <span className="text-xs font-bold text-slate-400">/{plan.billingCycle}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("الميزات:", "Features:")}</p>
                    {(isRtl ? plan.featuresAr : plan.featuresEn).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm">{t("مشتركو المنصة", "Platform Subscribers")}</h3>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={t("بحث باسم او ايميل المشترك", "Search by name or email")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-10 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">{t("المستخدم", "User")}</th>
                  <th className="px-4 py-3">{t("الحالة", "Status")}</th>
                  <th className="px-4 py-3">{t("الباقة", "Plan")}</th>
                  <th className="px-4 py-3">{t("تاريخ الانتهاء", "End Date")}</th>
                  <th className="px-4 py-3 text-center">{t("إجراءات", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.map(user => {
                  const subStatus = user.subscription?.status || 'none';
                  return (
                    <tr key={user.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-[10px] text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        {subStatus === 'pro' && <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md text-[10px] font-black">{t("احترافي", "PRO")}</span>}
                        {subStatus === 'trial' && <span className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md text-[10px] font-black">{t("تجريبي", "TRIAL")}</span>}
                        {subStatus === 'expired' && <span className="px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-[10px] font-black">{t("منتهي", "EXPIRED")}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {user.subscription?.planId || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {user.subscription?.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => extendUserTrial(user.uid)}
                            title={t("تمديد التجربة 30 يوم", "Extend Trial 30 Days")}
                            className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl">
          <h3 className="font-black text-lg mb-4">{t("إعدادات الاشتراك والتجربة", "Subscription & Trial Settings")}</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">{t("مدة الفترة التجريبية الافتراضية (بالأيام)", "Default Trial Duration (Days)")}</label>
              <input 
                type="number" 
                value={trialDurationDays}
                onChange={(e) => setTrialDurationDays(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="text-[10px] text-slate-400">
                {t("هذه المدة ستطبق تلقائياً على أي مستخدم جديد يسجل في المنصة.", "This duration will apply automatically to any new registered user.")}
              </p>
            </div>
            
            <button
              onClick={saveSettings}
              disabled={isSavingSettings}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("حفظ الإعدادات", "Save Settings")}
            </button>
          </div>
        </div>
      )}

      {/* PLAN MODAL */}
      <AnimatePresence>
        {showPlanModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#12141c] rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#12141c] z-10 rounded-t-3xl">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {editingPlan ? t("تعديل الباقة", "Edit Plan") : t("إضافة باقة جديدة", "Add New Plan")}
                </h3>
                <button 
                  onClick={() => setShowPlanModal(false)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">{t("اسم الباقة (عربي)", "Plan Title (AR)")}</label>
                    <input 
                      type="text" 
                      value={formData.titleAr} 
                      onChange={(e) => setFormData({...formData, titleAr: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">{t("اسم الباقة (إنجليزي)", "Plan Title (EN)")}</label>
                    <input 
                      type="text" 
                      value={formData.titleEn} 
                      onChange={(e) => setFormData({...formData, titleEn: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">{t("السعر ($)", "Price ($)")}</label>
                    <input 
                      type="number" 
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">{t("دورة الفوترة", "Billing Cycle")}</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {(['monthly', 'yearly', 'lifetime'] as const).map(cycle => (
                        <button
                          key={cycle}
                          onClick={() => setFormData({...formData, billingCycle: cycle})}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                            formData.billingCycle === cycle 
                              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {cycle === 'monthly' ? t("شهري", "Monthly") : cycle === 'yearly' ? t("سنوي", "Yearly") : t("مدى الحياة", "Lifetime")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features AR */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 flex justify-between items-center">
                    <span>{t("الميزات (عربي)", "Features (AR)")}</span>
                    <button onClick={() => addFeature('ar')} className="text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                      <Plus className="h-3 w-3" /> {t("إضافة", "Add")}
                    </button>
                  </label>
                  {(formData.featuresAr || []).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={feature} 
                        onChange={(e) => handleFeatureChange('ar', idx, e.target.value)} 
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                      />
                      <button onClick={() => removeFeature('ar', idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Features EN */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 flex justify-between items-center">
                    <span>{t("الميزات (إنجليزي)", "Features (EN)")}</span>
                    <button onClick={() => addFeature('en')} className="text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                      <Plus className="h-3 w-3" /> {t("إضافة", "Add")}
                    </button>
                  </label>
                  {(formData.featuresEn || []).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={feature} 
                        onChange={(e) => handleFeatureChange('en', idx, e.target.value)} 
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                      />
                      <button onClick={() => removeFeature('en', idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive} 
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <span className="text-sm font-bold">{t("باقة نشطة (متاحة للمستخدمين)", "Active Plan (Available to users)")}</span>
                </label>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12141c] sticky bottom-0 rounded-b-3xl">
                <button
                  onClick={savePlan}
                  disabled={isSavingPlan}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSavingPlan ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {t("حفظ الباقة", "Save Plan")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {planToDelete && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#12141c] rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">
                  {t("تأكيد الحذف", "Confirm Deletion")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("هل أنت متأكد من رغبتك في حذف هذه الباقة؟ لا يمكن التراجع عن هذا الإجراء وسيؤثر على المستخدمين المشتركين بها.", "Are you sure you want to delete this plan? This action cannot be undone and will affect subscribed users.")}
                </p>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-3 rounded-b-3xl">
                <button
                  onClick={() => setPlanToDelete(null)}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  {t("إلغاء", "Cancel")}
                </button>
                <button
                  onClick={() => confirmDelete(planToDelete)}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {t("تأكيد الحذف", "Confirm Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
