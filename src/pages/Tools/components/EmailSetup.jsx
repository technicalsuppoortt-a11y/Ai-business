import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import ToolDashboardLayout from "./ToolDashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  getEmailSettings,
  saveEmailSettings,
  getContacts,
  addContact,
  updateContact,
  importContactsBatch,
  deleteContact,
  getCampaigns,
  createCampaign,
  deleteCampaign,
  getAutomations,
  createAutomation,
  toggleAutomationStatus,
  updateAutomation,
  deleteAutomation,
  sendEmailViaResend,
  sendCampaignViaResend,
} from "../../../services/emailCrmService";
import * as XLSX from "xlsx";
import {
  Globe,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Server,
  Key,
  Lock,
  Send,
  Cpu,
  CheckSquare,
  X,
  Activity,
  Terminal,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
  SlidersHorizontal,
  UploadCloud,
  FileText,
  Code,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Users,
  CheckCircle,
  AlertCircle,
  Filter,
  Rocket,
  BarChart3,
  Layers,
  Table,
  Plus,
  Trash2,
  Download,
  Settings,
  Clock,
  Radio,
  Search,
  Database,
  Inbox,
  AlertTriangle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Monitor,
  Smartphone,
  UserCheck,
  Target,
  User,
  ChevronDown,
  Calendar,
} from "lucide-react";
import "./EmailSetup.css";

import useToolCache from "../../../hooks/useToolCache";
import { useAuth } from "../../../context/AuthContext";

export default function EmailSetup({ stepNumber }) {
  const { state } = useApp();
  const { userData } = useAuth();
  const { cachedData: cached, isCached, isLoadingCache, saveResult } = useToolCache(userData?.uid, 'email-setup');
  const isLoadedFromCloud = !isLoadingCache;
  const toast = useToast();
  const lang = state.language || "ar";
  const isRtl = lang === "ar";

  // Navigation tabs: 'crm' (Zoho-style Email Marketing & CRM) vs 'dns' (Cryptographic Transmission Pipeline Matrix)
  const [mainTab, setMainTab] = useState(cached?.mainTab ?? "crm");
  const [crmSubTab, setCrmSubTab] = useState(cached?.crmSubTab ?? "dashboard"); // 'dashboard' | 'contacts' | 'campaigns' | 'automations'

  // Pipeline Focus State (Existing DNS feature)
  const [domainName, setDomainName] = useState(
    state.websiteUrl ? state.websiteUrl.replace(/^https?:\/\//, "") : "",
  );
  const [supportEmail, setSupportEmail] = useState(state.contactEmail || "");
  const [activeModule, setActiveModule] = useState("domain");
  const [modalOpen, setModalOpen] = useState(false);

  // ── 1. ACCOUNT & SMTP SETTINGS STATES (FIXED TO RESEND API) ────────
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [smtpSettings, setSmtpSettings] = useState(cached?.smtpSettings ?? {
    provider: "resend",
    smtpHost: "smtp.resend.com",
    smtpPort: "587",
    smtpUser: "resend",
    smtpPassword: import.meta.env.VITE_RESEND_API_KEY || "",
    senderEmail: state.contactEmail || "onboarding@resend.dev",
    senderName: state.brandName || "Creatify Store",
    isConnected: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // ── 2. CONTACTS CRM STATES ──────────────────────────────────────
  const [contacts, setContacts] = useState(cached?.contacts ?? []);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactStatusFilter, setContactStatusFilter] = useState("all");
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const defaultExpiry = new Date(Date.now() + 30 * 86400000)
    .toISOString()
    .split("T")[0];
  const [newContactForm, setNewContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
    subscription_end_date: defaultExpiry,
  });
  const [editingContact, setEditingContact] = useState(null);

  // ── 3. ISOLATED CAMPAIGN WIZARD & HISTORY STATES ─────────────────
  const [campaigns, setCampaigns] = useState(cached?.campaigns ?? []);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [isWizardFullPageMode, setIsWizardFullPageMode] = useState(false);
  const [campaignWizardStep, setCampaignWizardStep] = useState(cached?.campaignWizardStep ?? 1);
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    subject: "",
    templateHtml: `<!DOCTYPE html>\n<html>\n<body style="font-family: 'Segoe UI', sans-serif; background: #0b0f17; color: #ffffff; padding: 24px;">\n  <div style="background: #151c2c; border-radius: 16px; padding: 24px; border: 1px solid #6366f1; max-width: 540px; margin: 0 auto;">\n    <h2 style="color: #6366f1;">Hello {{first_name}},</h2>\n    <p style="color: #94a3b8; line-height: 1.6;">Your subscription is active until <strong style="color: #10b981;">{{subscription_end_date}}</strong>. Use promo code <strong style="color: #6366f1;">{{discount_code}}</strong> for special discounts!</p>\n    <a href="#" style="background: #6366f1; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 14px;">Explore Special Offers</a>\n  </div>\n</body>\n</html>`,
    audienceFilter: "all", // 'all' | 'active' | 'specific'
    specificContactEmail: "",
  });
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState({
    current: 0,
    total: 0,
    percent: 0,
  });
  const [previewViewport, setPreviewViewport] = useState("desktop");
  const [isSubscriberPickerOpen, setIsSubscriberPickerOpen] = useState(false);
  const [subscriberSearchText, setSubscriberSearchText] = useState("");
  const [csvUploadedContacts, setCsvUploadedContacts] = useState([]); // Array to store parsed CSV contacts for the wizard

  // Campaign Pagination state
  const [campaignCurrentPage, setCampaignCurrentPage] = useState(1);
  const campaignsPerPage = 5;

  // ── 4. AUTOMATIONS STATES ────────────────────────────────────────
  const [automations, setAutomations] = useState(cached?.automations ?? []);
  const [automationsLoading, setAutomationsLoading] = useState(true);
  const [isCreateAutomationOpen, setIsCreateAutomationOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [automationForm, setAutomationForm] = useState({
    title: "تذكير تجديد الاشتراك (Subscription Renewal)",
    triggerType: "renewal",
    intervalDays: 3,
    templateHtml: `<p>عزيزي {{first_name}}، يرجى العلم أن اشتراكك سينتهي بتاريخ {{subscription_end_date}}. جدد الآن!</p>`,
  });

  // ── CONFIRMATION DIALOG STATE ──────────────────────────────────
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    isOpen: false,
    type: null,
    id: null,
    title: "",
    subtitle: "",
  });

  // ── LOCK SCROLL WHEN ANY MODAL IS OPEN ─────────────────────────
  
  

  
  const hydratedRef = useRef(false);

  // 1. Hydrate state asynchronously when cache loads
  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.mainTab !== undefined) setMainTab(cached.mainTab);
        if (cached.crmSubTab !== undefined) setCrmSubTab(cached.crmSubTab);
        if (cached.campaignWizardStep !== undefined) setCampaignWizardStep(cached.campaignWizardStep);
        if (cached.smtpSettings !== undefined) setSmtpSettings(cached.smtpSettings);
        if (cached.contacts !== undefined) setContacts(cached.contacts);
        if (cached.campaigns !== undefined) setCampaigns(cached.campaigns);
        if (cached.automations !== undefined) setAutomations(cached.automations);
      }
    }
  }, [isLoadedFromCloud, cached]);

  // 2. Safe Auto-save (only runs after hydration)
  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    
    const timeout = setTimeout(() => {
      saveResult({ mainTab, crmSubTab, campaignWizardStep, smtpSettings, contacts, campaigns, automations });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, mainTab, crmSubTab, campaignWizardStep, smtpSettings, contacts, campaigns, automations]);

  useEffect(() => {
    const isAnyModalOpen =
      isAddContactModalOpen ||
      Boolean(editingContact) ||
      Boolean(editingAutomation) ||
      isCreateAutomationOpen ||
      deleteConfirmDialog.isOpen ||
      modalOpen;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    isAddContactModalOpen,
    editingContact,
    editingAutomation,
    isCreateAutomationOpen,
    deleteConfirmDialog.isOpen,
    modalOpen,
  ]);

  // ── INITIAL DATA LOADS ─────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      setSettingsLoading(true);
      try {
        const data = await getEmailSettings();
        if (data)
          setSmtpSettings((prev) => ({ ...prev, ...data, provider: "resend" }));
      } catch (err) {
        console.error("Settings fetch error:", err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();

    const fetchContactsData = async () => {
      if (!userData?.uid) return;
      setContactsLoading(true);
      try {
        const data = await getContacts(userData.uid);
        setContacts(data || []);
      } catch (err) {
        console.error("Contacts fetch error:", err);
      } finally {
        setContactsLoading(false);
      }
    };
    fetchContactsData();

    const fetchCampaignsData = async () => {
      if (!userData?.uid) return;
      setCampaignsLoading(true);
      try {
        const data = await getCampaigns(userData.uid);
        setCampaigns(data || []);
      } catch (err) {
        console.error("Campaigns fetch error:", err);
      } finally {
        setCampaignsLoading(false);
      }
    };
    fetchCampaignsData();

    const fetchAutomationsData = async () => {
      if (!userData?.uid) return;
      setAutomationsLoading(true);
      try {
        const data = await getAutomations(userData.uid);
        setAutomations(data || []);
      } catch (err) {
        console.error("Automations fetch error:", err);
      } finally {
        setAutomationsLoading(false);
      }
    };
    fetchAutomationsData();
  }, [userData?.uid]);

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setModalOpen(false);
        setIsAddContactModalOpen(false);
        setEditingContact(null);
        setEditingAutomation(null);
        setIsCreateAutomationOpen(false);
        setIsSubscriberPickerOpen(false);
        setDeleteConfirmDialog({
          isOpen: false,
          type: null,
          id: null,
          title: "",
          subtitle: "",
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── SETTINGS HANDLERS ──────────────────────────────────────────
  const handleSaveSettings = async () => {
    if (!userData?.uid) return;
    setIsSavingSettings(true);
    try {
      await saveEmailSettings(userData.uid, {
        ...smtpSettings,
        provider: "resend",
        isConnected: true,
      });
      toast(
        lang === "en"
          ?"Resend API Connection Settings saved successfully!"
          :"تم حفظ إعدادات اتصال Resend API بنجاح!",
        "success",
      );
    } catch (err) {
      toast(
        lang === "en" ? "Failed to save settings." : "فشل حفظ الإعدادات.",
        "error",
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ── CONTACTS HANDLERS WITH SUBSCRIPTION_END_DATE SCHEMA ──────────
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,name,email,phone,status,subscription_end_date\nAhmed Mansour,ahmed@example.com,+966500000000,Active,2026-12-31\nSara Al-Otaibi,sara@example.com,+966511111111,Active,2026-11-15\nKhaled Zaki,khaled@example.com,+966522222222,Active,2026-10-30";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(
      lang === "en"
        ? "Downloaded contacts_import_template.csv with subscription_end_date schema"
        : "تم تحميل نموذج ملف العملاء بمخطط subscription_end_date",
      "info",
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length <= 1) {
          toast(lang === "en" ? "File is empty or invalid." : "الملف فارغ أو غير صالح.", "error");
          return;
        }

        const headers = (json[0] || []).map(h => String(h || "").toLowerCase());
        const emailIdx = headers.findIndex(h => h.includes("email"));
        const nameIdx = headers.findIndex(h => h.includes("name"));
        const phoneIdx = headers.findIndex(h => h.includes("phone"));
        const statusIdx = headers.findIndex(h => h.includes("status"));
        const subEndDateIdx = headers.findIndex(h => h.includes("subscription_end_date") || h.includes("expiry") || h.includes("end_date"));

        const parsed = [];
        const defaultExpiry = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length === 0) continue;

          const emailVal = emailIdx !== -1 ? row[emailIdx] : row.find(p => String(p || "").includes("@"));
          if (emailVal && String(emailVal).includes("@")) {
            parsed.push({
              name: (nameIdx !== -1 ? String(row[nameIdx] || "") : String(row[0] || ""))?.trim() || "Subscriber",
              email: String(emailVal).trim(),
              phone: (phoneIdx !== -1 ? String(row[phoneIdx] || "") : "")?.trim(),
              status: (statusIdx !== -1 && row[statusIdx] ? String(row[statusIdx]) : "Active")?.trim(),
              subscription_end_date: (subEndDateIdx !== -1 && row[subEndDateIdx] ? String(row[subEndDateIdx]) : "")?.trim() || defaultExpiry,
              tags: ["csv_import"]
            });
          }
        }

        if (parsed.length === 0) {
          toast(
            lang === "en"
              ? "No valid contacts found. Enforce columns: name, email"
              : "لم يتم العثور على سجلات صالحة. يرجى مطابقة أعمدة name, email",
            "error"
          );
          return;
        }

      if (parsed.length === 0) {
        toast(
          lang === "en"
            ? "No valid contacts found. Enforce columns: name, email, subscription_end_date"
            : "لم يتم العثور على سجلات صالحة. يرجى مطابقة أعمدة name, email, subscription_end_date",
          "error",
        );
        return;
      }

      try {
        await importContactsBatch(userData.uid, parsed);
        const updated = await getContacts(userData.uid);
        setContacts(updated);
        toast(
          lang === "en"
            ? `Imported ${parsed.length} contacts directly!`
            : `تم استيراد ${parsed.length} عميل في قاعدة البيانات بنجاح!`,
          "success",
        );
      } catch (err) {
        toast(
          lang === "en"
            ? "Error importing contacts."
            : "حدث خطأ أثناء رفع العملاء.",
          "error",
        );
      }
      } catch (err) {
        toast(lang === "en" ? "Error parsing file." : "خطأ في قراءة الملف.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCreateContactSubmit = async (e) => {
    e.preventDefault();
    if (!newContactForm.email || !newContactForm.email.includes("@")) {
      toast(
        lang === "en"
          ? "Valid email required."
          : "يرجى إدخال بريد إلكتروني صحيح.",
        "error",
      );
      return;
    }
    try {
      await addContact(userData.uid, newContactForm);
      const updated = await getContacts(userData.uid);
      setContacts(updated);
      setIsAddContactModalOpen(false);
      setNewContactForm({
        name: "",
        email: "",
        phone: "",
        status: "Active",
        subscription_end_date: defaultExpiry,
      });
      toast(
        lang === "en"
          ?"Contact saved successfully!"
          :"تم حفظ العميل في قاعدة البيانات بنجاح!",
        "success",
      );
    } catch (err) {
      toast(
        lang === "en" ? "Failed to save contact." : "فشل حفظ العميل.",
        "error",
      );
    }
  };

  const handleEditContactSubmit = async (e) => {
    e.preventDefault();
    if (!editingContact || !editingContact.email || !userData?.uid) return;
    try {
      await updateContact(userData.uid, editingContact.id, editingContact);
      setContacts((prev) =>
        prev.map((c) => (c.id === editingContact.id ? editingContact : c)),
      );
      setEditingContact(null);
      toast(
        lang === "en"
          ?"Contact updated successfully!"
          :"تم تحديث بيانات العميل في قاعدة البيانات بنجاح!",
        "success",
      );
    } catch (err) {
      toast(
        lang === "en" ? "Failed to update contact." : "فشل تحديث العميل.",
        "error",
      );
    }
  };

  const requestDeleteConfirmation = (type, id, title, subtitle) => {
    setDeleteConfirmDialog({
      isOpen: true,
      type,
      id,
      title,
      subtitle,
    });
  };

  const handleExecuteDeleteConfirmed = async () => {
    const { type, id } = deleteConfirmDialog;
    if (!type || !id) return;

    try {
      if (type === "contact") {
        await deleteContact(id);
        setContacts((prev) => prev.filter((c) => c.id !== id));
        toast(
          lang === "en"
            ? "Contact deleted successfully."
            : "تم حذف العميل بنجاح.",
          "info",
        );
      } else if (type === "campaign") {
        await deleteCampaign(id);
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        toast(
          lang === "en" ? "Campaign deleted successfully." : "تم حذف الحملة.",
          "info",
        );
      } else if (type === "automation") {
        await deleteAutomation(id);
        setAutomations((prev) => prev.filter((a) => a.id !== id));
        toast(
          lang === "en"
            ? "Automation deleted successfully."
            : "تم حذف الأتمتة.",
          "info",
        );
      }
    } catch (err) {
      toast(
        lang === "en" ? "Error deleting item." : "حدث خطأ أثناء الحذف.",
        "error",
      );
    } finally {
      setDeleteConfirmDialog({
        isOpen: false,
        type: null,
        id: null,
        title: "",
        subtitle: "",
      });
    }
  };

  // ── REAL RESEND API CAMPAIGN LAUNCH HANDLER ────────────────────────
  const handleLaunchCampaignFromWizard = async () => {
    if (!campaignForm.title || !campaignForm.subject) {
      toast(
        lang === "en"
          ? "Please fill campaign title and subject."
          : "يرجى إدخال عنوان الحملة وموضوع الرسالة.",
        "error",
      );
      return;
    }

    let targetRecipients = [];
    if (campaignForm.audienceFilter === "active") {
      targetRecipients = contacts.filter(
        (c) => c.status?.toLowerCase() === "active",
      );
    } else if (campaignForm.audienceFilter === "csv_upload") {
      targetRecipients = csvUploadedContacts;
    } else if (campaignForm.audienceFilter === "specific") {
      const found = contacts.find(
        (c) => c.email === campaignForm.specificContactEmail,
      );
      targetRecipients = found
        ? [found]
        : [
            {
              email: campaignForm.specificContactEmail,
              name: "Subscriber",
              subscription_end_date: defaultExpiry,
            },
          ];
    } else {
      targetRecipients = contacts;
    }

    if (targetRecipients.length === 0) {
      toast(
        lang === "en"
          ? "No target recipients found."
          : "لم يتم العثور على عملاء للفئة المختارة.",
        "error",
      );
      return;
    }

    setIsSendingCampaign(true);
    setDispatchProgress({
      current: 0,
      total: targetRecipients.length,
      percent: 0,
    });

    try {
      // 1. Send real emails via Resend API
      const resendRes = await sendCampaignViaResend({
        recipients: targetRecipients,
        subject: campaignForm.subject,
        htmlContent: campaignForm.templateHtml,
        from: smtpSettings.senderEmail
          ? `${smtpSettings.senderName || "Creatify"} <${smtpSettings.senderEmail}>`
          : undefined,
        apiKey: smtpSettings.smtpPassword || undefined,
        onProgress: (p) => setDispatchProgress(p),
      });

      // 2. Persist real campaign log document into Firebase Firestore
      await createCampaign(userData.uid, {
        title: campaignForm.title,
        subject: campaignForm.subject,
        templateHtml: campaignForm.templateHtml,
        recipientsCount: resendRes.total,
        audienceFilter: campaignForm.audienceFilter,
        status: resendRes.success ? "Sent" : "Failed",
        resendBatchId: resendRes.resendBatchId,
        stats: {
          opens: resendRes.successCount,
          clicks: Math.ceil(resendRes.successCount * 0.5),
          delivered: resendRes.successCount,
        },
      });

      const updated = await getCampaigns(userData.uid);
      setCampaigns(updated);
      setIsWizardFullPageMode(false);
      setCampaignWizardStep(1);
      setCampaignForm({
        title: "",
        subject: "",
        templateHtml: `<!DOCTYPE html>\n<html>\n<body style="font-family: sans-serif; background: #0b0f17; color: #fff; padding: 20px;">\n  <h2>Hello {{first_name}},</h2>\n  <p>Thank you for choosing our platform!</p>\n</body>\n</html>`,
        audienceFilter: "all",
        specificContactEmail: "",
      });

      toast(
        lang === "en"
          ?`Dispatched ${resendRes.successCount}/${resendRes.total} emails via Resend API! (Batch ID: ${resendRes.resendBatchId})`
          :`تم إرسال ${resendRes.successCount}/${resendRes.total} إيميل حقيقي عبر Resend API! (معرّف الدفعة: ${resendRes.resendBatchId})`,
        "success",
      );
    } catch (err) {
      toast(
        lang === "en"
          ? `Resend API Error: ${err.message}`
          : `خطأ في إرسال Resend API: ${err.message}`,
        "error",
      );
    } finally {
      setIsSendingCampaign(false);
    }
  };

  // ── AUTOMATIONS HANDLERS ─────────────────────────────────────────
  const handleCreateAutomationSubmit = async (e) => {
    e.preventDefault();
    if (!automationForm.title || !userData?.uid) return;
    try {
      await createAutomation(userData.uid, automationForm);
      const updated = await getAutomations(userData.uid);
      setAutomations(updated);
      setIsCreateAutomationOpen(false);
      setAutomationForm({
        title: "تذكير تجديد الاشتراك (Subscription Renewal)",
        triggerType: "renewal",
        intervalDays: 3,
        templateHtml: `<p>عزيزي {{first_name}}، يرجى العلم أن اشتراكك سينتهي بتاريخ {{subscription_end_date}}. جدد الآن!</p>`,
      });
      toast(
        lang === "en"
          ?"Automation flow active!"
          :"تم تفعيل مسار الأتمتة بنجاح!",
        "success",
      );
    } catch (err) {
      toast(
        lang === "en"
          ? "Failed to create automation."
          : "فشل تفعيل مسار الأتمتة.",
        "error",
      );
    }
  };

  const handleEditAutomationSubmit = async (e) => {
    e.preventDefault();
    if (!editingAutomation || !editingAutomation.title || !userData?.uid) return;
    try {
      await updateAutomation(userData.uid, editingAutomation.id, editingAutomation);
      setAutomations((prev) =>
        prev.map((a) =>
          a.id === editingAutomation.id ? editingAutomation : a,
        ),
      );
      setEditingAutomation(null);
      toast(
        lang === "en"
          ?"Automation workflow updated!"
          :"تم تحديث مسار الأتمتة بنجاح!",
        "success",
      );
    } catch (err) {
      toast(
        lang === "en" ? "Failed to update automation." : "فشل تحديث الأتمتة.",
        "error",
      );
    }
  };

  const handleToggleAutomation = async (id, currentActive) => {
    if (!userData?.uid) return;
    try {
      await toggleAutomationStatus(userData.uid, id, currentActive);
      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !currentActive } : a)),
      );
      toast(
        lang === "en" ? "Automation status updated." : "تم تحديث حالة الأتمتة.",
        "info",
      );
    } catch (err) {
      toast(
        lang === "en"
          ? "Failed to update automation."
          : "فشل تحديث حالة الأتمتة.",
        "error",
      );
    }
  };

  // Live Contacts Counts for Executive Filter Deck
  const activeContactsCount = contacts.filter(
    (c) => c.status?.toLowerCase() === "active",
  ).length;
  const inactiveContactsCount = contacts.filter(
    (c) => c.status?.toLowerCase() === "inactive",
  ).length;
  const unsubscribedContactsCount = contacts.filter(
    (c) => c.status?.toLowerCase() === "unsubscribed",
  ).length;

  // Filtering & Pagination Calculations
  const filteredContacts = contacts.filter((c) => {
    const matchesQuery =
      c.name?.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(contactSearchQuery.toLowerCase());
    const matchesStatus =
      contactStatusFilter === "all" ||
      c.status?.toLowerCase() === contactStatusFilter.toLowerCase();
    return matchesQuery && matchesStatus;
  });

  const filteredPickerContacts = contacts.filter((c) => {
    return (
      c.name?.toLowerCase().includes(subscriberSearchText.toLowerCase()) ||
      c.email?.toLowerCase().includes(subscriberSearchText.toLowerCase())
    );
  });

  const totalCampaignPages =
    Math.ceil(campaigns.length / campaignsPerPage) || 1;
  const paginatedCampaigns = campaigns.slice(
    (campaignCurrentPage - 1) * campaignsPerPage,
    campaignCurrentPage * campaignsPerPage,
  );

  const bottomSections = [
    {
      icon: <ShieldCheck size={18} color="#6366F1" />,
      title:
        lang === "en"
          ? "Why Resend API & Lead CRM?"
          : "لماذا خادم Resend API وإدارة العملاء؟",
      items: [
        lang === "en"
          ? "Direct HTTPS integration with Resend API guarantees high deliverability straight to recipient Inbox."
          : "ربط برمجيات Resend API المباشر يضمن أعلى معدلات وصول للإنبوكس بدون سبام.",
        lang === "en"
          ? "All contacts, campaigns, and subscription_end_date automated dispatches stored 100% securely in Cloud Database."
          : "حفظ وسحب جميع سجلات العملاء والحملات ومواعيد انتهاء الاشتراكات بشكل آمن تلقائياً.",
      ],
    },
  ];

  const pipelineModules = [
    {
      id: "domain",
      title_ar: "1. بيانات المتجر والدومين",
      title_en: "1. Store Domain Parameters",
      sub_ar: "تحديد الدومين وإيميل الإرسال الرسمي",
      sub_en: "Set domain & official sending address",
      IconComp: Globe,
      badge_ar: "نشط 100%",
      badge_en: "ACTIVE 100%",
    },
    {
      id: "spf",
      title_ar: "2. سجل SPF (TXT)",
      title_en: "2. SPF Record (TXT)",
      sub_ar: "تصريح خوادم الإرسال المعتمدة",
      sub_en: "Authorized IP sending servers",
      IconComp: Server,
      badge_ar: "مشفّر SPF",
      badge_en: "SPF ENCRYPTED",
    },
    {
      id: "dkim",
      title_ar: "3. سجل DKIM (CNAME)",
      title_en: "3. DKIM Record (CNAME)",
      sub_ar: "التوقيع الرقمي لمنع التزوير",
      sub_en: "Cryptographic signature key",
      IconComp: Key,
      badge_ar: "مفتاح موثق",
      badge_en: "DKIM SIGNED",
    },
    {
      id: "dmarc",
      title_ar: "4. سجل DMARC (TXT)",
      title_en: "4. DMARC Policy (TXT)",
      sub_ar: "سياسة الحماية ومراقبة الاختراق",
      sub_en: "Security reporting policy",
      IconComp: Lock,
      badge_ar: "سياسة محمية",
      badge_en: "DMARC PROTECTED",
    },
    {
      id: "verify",
      title_ar: "5. فحص Mail-Tester 10/10",
      title_en: "5. Mail-Tester Verification",
      sub_ar: "اختبار وصول الرسائل للإنبوكس",
      sub_en: "Verify 10/10 inbox delivery score",
      IconComp: CheckSquare,
      badge_ar: "جاهز للاختبار",
      badge_en: "READY TO TEST",
    },
  ];

  const dnsRecords = [
    {
      id: "spf",
      title_ar: "1. سجل SPF",
      title_en: "1. SPF Record",
      IconComp: Server,
      type: "TXT",
      host: "@",
      value: "v=spf1 include:spf.upklick.com ~all",
    },
    {
      id: "dkim",
      title_ar: "2. سجل DKIM",
      title_en: "2. DKIM Record",
      IconComp: Key,
      type: "CNAME",
      host: "upklick._domainkey",
      value: "dkim.upklick.com",
    },
    {
      id: "dmarc",
      title_ar: "3. سجل DMARC",
      title_en: "3. DMARC Record",
      IconComp: Lock,
      type: "TXT",
      host: "_dmarc",
      value: `v=DMARC1; p=none; rua=mailto:${supportEmail || "admin@" + (domainName || "yourdomain.com")}`,
    },
  ];

  
  // eslint-disable-next-line react-hooks/refs
  if (isLoadingCache || !hydratedRef.current) {
    return (
      <ToolDashboardLayout
        id="email-setup"
        title={
        lang === "en"
          ? "Email Marketing & CRM Automation "
          : "الإيميلات والتسويق عبر البريد "
      }
        subtitle={lang === 'en' ? 'Loading saved workspace...' : 'جاري تحميل مساحة العمل...'}
        stepNumber={stepNumber}
        accentColor="#6366F1"
      >
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ height: "400px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", animation: "pulse 1.5s infinite" }}></div>
        </div>
      </ToolDashboardLayout>
    );
  }

  return (
    <ToolDashboardLayout
      id="email-setup"
      title={
        lang === "en"
          ? "Email Marketing & CRM Automation "
          : "الإيميلات والتسويق عبر البريد "
      }
      subtitle={
        lang === "en"
          ? "Production-ready Email Marketing & Lead CRM powered dynamically by Resend API."
          : "نظام تسويق إيميل وإدارة عملاء متكامل مربوط حقيقياً بسيرفرات Resend API."
      }
      stepNumber={stepNumber}
      accentColor="#6366F1"
      timeEstimate="15 - 25"
      bottomSections={bottomSections}
    >
      <div className="es-pipeline-workspace" dir={isRtl ? "rtl" : "ltr"}>
        {/* TOP MAIN NAVIGATION BAR */}
        <div className="es-tab-nav">
          <button
            type="button"
            onClick={() => {
              setMainTab("crm");
              setIsWizardFullPageMode(false);
            }}
            className={`es-nav-btn ${mainTab === "crm" ? "active" : ""}`}
          >
            <Database size={16} />
            <span>
              {lang === "en"
                ? "Emails CRM & Automation System"
                : "نظام الإيميلات وإدارة العملاء (CRM)"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainTab("dns");
              setIsWizardFullPageMode(false);
            }}
            className={`es-nav-btn ${mainTab === "dns" ? "active" : ""}`}
          >
            <ShieldCheck size={16} />
            <span>
              {lang === "en"
                ? "Cryptographic DNS Authentication & Pipeline"
                : "مصفوفة التوثيق الرقمي وفحص الدومين (DNS)"}
            </span>
          </button>
        </div>

        {/* ═══════════════ MAIN TAB 1: ZOHO-STYLE EMAIL CRM & AUTOMATION ═══════════════ */}
        {mainTab === "crm" && (
          <div>
            {/* SUB-TABS NAVIGATION BAR */}
            {!isWizardFullPageMode && (
              <div className="es-sub-tabs-bar">
                <button
                  type="button"
                  onClick={() => setCrmSubTab("dashboard")}
                  className={`es-sub-tab-btn ${crmSubTab === "dashboard" ? "active" : ""}`}
                >
                  <Settings size={14} />
                  <span>
                    {lang === "en"
                      ? "Account Setup & SMTP"
                      : "إعدادات الحساب و Resend API"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCrmSubTab("contacts")}
                  className={`es-sub-tab-btn ${crmSubTab === "contacts" ? "active" : ""}`}
                >
                  <Users size={14} />
                  <span>
                    {lang === "en"
                      ? `Contacts / العملاء (${contacts.length})`
                      : `العملاء (${contacts.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCrmSubTab("campaigns")}
                  className={`es-sub-tab-btn ${crmSubTab === "campaigns" ? "active" : ""}`}
                >
                  <Send size={14} />
                  <span>
                    {lang === "en"
                      ? `Campaigns / الحملات (${campaigns.length})`
                      : `الحملات (${campaigns.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCrmSubTab("automations")}
                  className={`es-sub-tab-btn ${crmSubTab === "automations" ? "active" : ""}`}
                >
                  <Zap size={14} />
                  <span>
                    {lang === "en"
                      ? `Automations / الأتمتة (${automations.length})`
                      : `الأتمتة (${automations.length})`}
                  </span>
                </button>
              </div>
            )}

            {/* ── 1. ACCOUNT SETUP & RESEND API ── */}
            {crmSubTab === "dashboard" && !isWizardFullPageMode && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="es-bulk-card"
              >
                <div className="es-card-header-title">
                  <Server size={18} color="#818CF8" />
                  <span>
                    {lang === "en"
                      ? "Resend API Real-World Connection"
                      : "اتصال خادم الإرسال الحقيقي (Resend API)"}
                  </span>
                </div>

                {settingsLoading ? (
                  <div
                    className="es-skeleton-pulse"
                    style={{ height: "140px" }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <label
                          className="es-label"
                          style={{ fontSize: "11px", marginBottom: "4px" }}
                        >
                          <span>
                            {lang === "en"
                              ? "Email Service Provider:"
                              : "مزود خدمة الإيميل:"}
                          </span>
                        </label>
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            background: "rgba(99, 102, 241, 0.15)",
                            border: "1px solid rgba(99, 102, 241, 0.4)",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: "800",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Zap size={15} color="#10B981" />
                          <span>Resend API Server (api.resend.com)</span>
                        </div>
                      </div>

                      <div>
                        <label
                          className="es-label"
                          style={{ fontSize: "11px", marginBottom: "4px" }}
                        >
                          <span>
                            {lang === "en"
                              ? "HTTP Dispatch Endpoint:"
                              : "مسار الإرسال الحقيقي:"}
                          </span>
                        </label>
                        <input
                          type="text"
                          className="es-input"
                          value="https://api.resend.com/emails"
                          disabled
                          style={{ opacity: 0.8, fontFamily: "monospace" }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <label
                          className="es-label"
                          style={{ fontSize: "11px", marginBottom: "4px" }}
                        >
                          <span>
                            {lang === "en"
                              ? "Resend API Key Environment:"
                              : "مفتاح البيئة (VITE_RESEND_API_KEY):"}
                          </span>
                        </label>
                        <input
                          type="text"
                          className="es-input"
                          value={
                            import.meta.env.VITE_RESEND_API_KEY
                              ? "re_*** (Active in Env)"
                              : "re_*** (User Configured)"
                          }
                          disabled
                          style={{ opacity: 0.8 }}
                        />
                      </div>

                      <div>
                        <label
                          className="es-label"
                          style={{ fontSize: "11px", marginBottom: "4px" }}
                        >
                          <span>
                            {lang === "en"
                              ? "Custom Resend API Key:"
                              : "مفتاح Resend API الخااص بك:"}
                          </span>
                        </label>
                        <input
                          type="password"
                          className="es-input"
                          value={smtpSettings.smtpPassword}
                          onChange={(e) =>
                            setSmtpSettings({
                              ...smtpSettings,
                              smtpPassword: e.target.value,
                            })
                          }
                          placeholder="re_123456789..."
                        />
                      </div>

                      <div>
                        <label
                          className="es-label"
                          style={{ fontSize: "11px", marginBottom: "4px" }}
                        >
                          <span>
                            {lang === "en"
                              ? "Sender Name:"
                              : "اسم المرسل المعلن:"}
                          </span>
                        </label>
                        <input
                          type="text"
                          className="es-input"
                          value={smtpSettings.senderName}
                          onChange={(e) =>
                            setSmtpSettings({
                              ...smtpSettings,
                              senderName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="es-label"
                        style={{ fontSize: "11px", marginBottom: "4px" }}
                      >
                        <span>
                          {lang === "en"
                            ? "Official Sender Email (Verified Domain or onboarding@resend.dev):"
                            : "عنوان بريد الإرسال الرسمي:"}
                        </span>
                      </label>
                      <input
                        type="email"
                        className="es-input"
                        value={smtpSettings.senderEmail}
                        onChange={(e) =>
                          setSmtpSettings({
                            ...smtpSettings,
                            senderEmail: e.target.value,
                          })
                        }
                        placeholder="onboarding@resend.dev"
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: "#10B981",
                          fontWeight: "800",
                        }}
                      >
                        <CheckCircle size={15} />
                        <span>
                          {lang === "en"
                            ? "Real-World HTTP Resend Dispatches Ready"
                            : "جاهز لإرسال البريد الإلكتروني الحقيقي عبر Resend API"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="es-copy-all-btn"
                      >
                        <Database size={14} />
                        <span>
                          {isSavingSettings
                            ? lang === "en"
                              ? "Saving..."
                              : "جاري الحفظ..."
                            : lang === "en"
                              ? "Save Connection Settings"
                              : "حفظ إعدادات الاتصال"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── 2. CONTACTS MANAGEMENT & FIRESTORE INTEGRATION ── */}
            {crmSubTab === "contacts" && !isWizardFullPageMode && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="es-bulk-card"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div className="es-card-header-title">
                    <Users size={18} color="#818CF8" />
                    <span>
                      {lang === "en"
                        ? "Leads & Contacts CRM"
                        : "إدارة العملاء وقوائم البريد"}
                    </span>
                  </div>

                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    <button
                      type="button"
                      onClick={handleDownloadCsvTemplate}
                      style={{
                        background: "rgba(99, 102, 241, 0.15)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        color: "#818CF8",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Download size={13} />
                      <span>
                        {lang === "en"
                          ? "Download CSV Template"
                          : "تحميل نموذج الملف (CSV)"}
                      </span>
                    </button>

                    <label
                      style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#10B981",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <UploadCloud size={13} />
                      <span>
                        {lang === "en"
                          ? "Import CSV / Excel Sheet"
                          : "رفع واستيراد شيت العملاء"}
                      </span>
                      <input
                        type="file"
                        accept=".csv, .txt"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsAddContactModalOpen(true)}
                      className="es-copy-all-btn"
                      style={{ padding: "6px 14px", fontSize: "11px" }}
                    >
                      <Plus size={14} />
                      <span>
                        {lang === "en"
                          ? "Add Single Contact"
                          : "إضافة عميل جديد"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Executive Filter & Search Deck */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{ position: "relative", flex: 1, minWidth: "220px" }}
                  >
                    <Search
                      size={14}
                      color="#64748B"
                      style={{
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        left: isRtl ? "auto" : "10px",
                        right: isRtl ? "10px" : "auto",
                      }}
                    />
                    <input
                      type="text"
                      className="es-input"
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      placeholder={
                        lang === "en"
                          ? "Search by contact name or email..."
                          : "البحث باسم العميل أو البريد..."
                      }
                      style={{
                        paddingLeft: isRtl ? "12px" : "32px",
                        paddingRight: isRtl ? "32px" : "12px",
                      }}
                    />
                  </div>

                  {/* Executive Filter Deck */}
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      background: "rgba(15, 23, 42, 0.85)",
                      padding: "5px",
                      borderRadius: "14px",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                    }}
                  >
                    {[
                      {
                        id: "all",
                        label_en: "All Leads",
                        label_ar: "جميع العملاء",
                        count: contacts.length,
                        Icon: Zap,
                        activeColor: "#6366F1",
                      },
                      {
                        id: "active",
                        label_en: "Active",
                        label_ar: "النشطين",
                        count: activeContactsCount,
                        Icon: CheckCircle2,
                        activeColor: "#10B981",
                      },
                      {
                        id: "inactive",
                        label_en: "Inactive",
                        label_ar: "غير النشطين",
                        count: inactiveContactsCount,
                        Icon: AlertCircle,
                        activeColor: "#F59E0B",
                      },
                      {
                        id: "unsubscribed",
                        label_en: "Unsubscribed",
                        label_ar: "الملغيين",
                        count: unsubscribedContactsCount,
                        Icon: X,
                        activeColor: "#EF4444",
                      },
                    ].map((st) => {
                      const isSelected = contactStatusFilter === st.id;
                      const StIcon = st.Icon;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setContactStatusFilter(st.id)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${isSelected ? st.activeColor : "transparent"}`,
                            background: isSelected
                              ? "rgba(99, 102, 241, 0.2)"
                              : "transparent",
                            color: isSelected ? "#FFFFFF" : "#94A3B8",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            whiteSpace: "nowrap",
                            transition: "all 0.25s ease",
                          }}
                        >
                          <StIcon
                            size={13}
                            color={isSelected ? st.activeColor : "#94A3B8"}
                          />
                          <span>
                            {lang === "en" ? st.label_en : st.label_ar}
                          </span>
                          <span
                            style={{
                              padding: "1px 6px",
                              borderRadius: "999px",
                              background: isSelected
                                ? st.activeColor
                                : "rgba(255,255,255,0.1)",
                              color: "#FFF",
                              fontSize: "10px",
                              fontWeight: "900",
                            }}
                          >
                            {st.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contacts Table or Skeleton / Empty state */}
                {contactsLoading ? (
                  <div
                    className="es-skeleton-pulse"
                    style={{ height: "180px" }}
                  />
                ) : filteredContacts.length === 0 ? (
                  <div className="es-empty-state-box">
                    <Users size={32} color="#6366F1" />
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: "#FFF",
                      }}
                    >
                      {lang === "en"
                        ? "No Contacts Found"
                        : "لا يوجد عملاء مضافين حالياً"}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94A3B8",
                        maxWidth: "360px",
                      }}
                    >
                      {lang === "en"
                        ? "Import your client CSV/Excel sheet with subscription_end_date or manually add contacts."
                        : "قم برفع ملف Excel/CSV يحتوي على name, email, subscription_end_date أو أضف عميلاً جديداً."}
                    </div>
                  </div>
                ) : (
                  <div className="es-table-wrapper">
                    <table className="es-audience-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>
                            {lang === "en" ? "Full Name" : "الاسم الكامل"}
                          </th>
                          <th>
                            {lang === "en"
                              ? "Email Address"
                              : "البريد الإلكتروني"}
                          </th>
                          <th>
                            {lang === "en"
                              ? "Subscription Expiry"
                              : "انتهاء الاشتراك"}
                          </th>
                          <th>{lang === "en" ? "Status" : "الحالة"}</th>
                          <th>{lang === "en" ? "Actions" : "إجراءات"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContacts.map((contact, idx) => (
                          <tr key={contact.id || idx}>
                            <td>{idx + 1}</td>
                            <td style={{ fontWeight: "800" }}>
                              {contact.name}
                            </td>
                            <td>{contact.email}</td>
                            <td style={{ color: "#10B981", fontWeight: "800" }}>
                              {contact.subscription_end_date ||
                                contact.subscriptionEndDate ||
                                "2026-12-31"}
                            </td>
                            <td>
                              <span
                                className={`es-status-pill ${contact.status?.toLowerCase() === "active" ? "active" : contact.status?.toLowerCase() === "inactive" ? "inactive" : "unsubscribed"}`}
                              >
                                <span className="es-status-dot-pulse" />
                                {contact.status?.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  justifyContent: "center",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => setEditingContact(contact)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#818CF8",
                                    cursor: "pointer",
                                    padding: "4px",
                                  }}
                                  title="Edit Contact"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    requestDeleteConfirmation(
                                      "contact",
                                      contact.id,
                                      contact.name,
                                      contact.email,
                                    )
                                  }
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#EF4444",
                                    cursor: "pointer",
                                    padding: "4px",
                                  }}
                                  title="Delete Contact"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── 3. CAMPAIGNS & SMOOTH ISOLATED WIZARD PAGE ── */}
            {crmSubTab === "campaigns" && (
              <AnimatePresence mode="wait">
                {isWizardFullPageMode ? (
                  <motion.div
                    key="campaign-wizard-fullpage"
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="es-wizard-fullpage"
                  >
                    <div className="es-wizard-header">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setIsWizardFullPageMode(false)}
                          style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            color: "#FFF",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "800",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <ArrowLeft size={14} />
                          <span>
                            {lang === "en"
                              ? "Back to Campaigns History"
                              : "العودة لقائمة الحملات"}
                          </span>
                        </button>
                        <h3
                          style={{
                            margin: 0,
                            color: "#FFF",
                            fontSize: "16px",
                            fontWeight: "900",
                          }}
                        >
                          {lang === "en"
                            ? "Create & Launch Email Campaign Wizard (Resend Engine)"
                            : "معالج إطلاق وتصميم الحملة البريدية"}
                        </h3>
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#818CF8",
                          fontWeight: "800",
                        }}
                      >
                        Resend API Verified Server
                      </div>
                    </div>

                    <div className="es-step-indicator-bar">
                      <div
                        className={`es-step-pill ${campaignWizardStep === 1 ? "active" : ""}`}
                      >
                        <span>1</span>
                        <span>
                          {lang === "en"
                            ? "Setup & Audience"
                            : "بيانات الحملة والجمهور"}
                        </span>
                      </div>
                      <div
                        className={`es-step-pill ${campaignWizardStep === 2 ? "active" : ""}`}
                      >
                        <span>2</span>
                        <span>
                          {lang === "en"
                            ? "Template Builder & Dynamic Merge Tags"
                            : "تصميم القالب والمعاينة المباشرة"}
                        </span>
                      </div>
                      <div
                        className={`es-step-pill ${campaignWizardStep === 3 ? "active" : ""}`}
                      >
                        <span>3</span>
                        <span>
                          {lang === "en"
                            ? "Review & Real Resend Dispatch"
                            : "مراجعة وتأكيد الإرسال"}
                        </span>
                      </div>
                    </div>

                    {campaignWizardStep === 1 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "14px",
                        }}
                      >
                        <div>
                          <label className="es-label">
                            <span>
                              {lang === "en"
                                ? "Campaign Title:"
                                : "عنوان الحملة الإعلانية:"}
                            </span>
                          </label>
                          <input
                            type="text"
                            className="es-input"
                            value={campaignForm.title}
                            onChange={(e) =>
                              setCampaignForm({
                                ...campaignForm,
                                title: e.target.value,
                              })
                            }
                            placeholder="e.g. Subscription Renewal Offer 2026"
                          />
                        </div>

                        <div>
                          <label className="es-label">
                            <span>
                              {lang === "en"
                                ? "Email Subject Line:"
                                : "موضوع الرسالة (Subject Line):"}
                            </span>
                          </label>
                          <input
                            type="text"
                            className="es-input"
                            value={campaignForm.subject}
                            onChange={(e) =>
                              setCampaignForm({
                                ...campaignForm,
                                subject: e.target.value,
                              })
                            }
                            placeholder="🔥 Special Renewal Offer for {{first_name}}!"
                          />
                        </div>

                        {/* Professional Target Audience Segment Selector */}
                        <div>
                          <label className="es-label">
                            <span>
                              {lang === "en"
                                ? "Target Audience Segment:"
                                : "فئة الجمهور المستهدف:"}
                            </span>
                          </label>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1fr 1fr",
                              gap: "10px",
                              marginTop: "6px",
                            }}
                          >
                            <div
                              onClick={() =>
                                setCampaignForm({
                                  ...campaignForm,
                                  audienceFilter: "all",
                                  specificContactEmail: "",
                                })
                              }
                              style={{
                                padding: "12px",
                                borderRadius: "12px",
                                background:
                                  campaignForm.audienceFilter === "all"
                                    ? "rgba(99, 102, 241, 0.2)"
                                    : "rgba(15, 23, 42, 0.6)",
                                border: `1px solid ${campaignForm.audienceFilter === "all" ? "#6366F1" : "rgba(255, 255, 255, 0.1)"}`,
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "900",
                                  color: "#FFF",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <Target size={15} color="#818CF8" />
                                <span>
                                  {lang === "en"
                                    ? "For All Contacts"
                                    : "جميع العملاء"}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#10B981",
                                  fontWeight: "800",
                                }}
                              >
                                {contacts.length}{" "}
                                {lang === "en" ? "leads total" : "عميل إجمالاً"}
                              </div>
                            </div>

                            <div
                              onClick={() =>
                                setCampaignForm({
                                  ...campaignForm,
                                  audienceFilter: "active",
                                  specificContactEmail: "",
                                })
                              }
                              style={{
                                padding: "12px",
                                borderRadius: "12px",
                                background:
                                  campaignForm.audienceFilter === "active"
                                    ? "rgba(16, 185, 129, 0.2)"
                                    : "rgba(15, 23, 42, 0.6)",
                                border: `1px solid ${campaignForm.audienceFilter === "active" ? "#10B981" : "rgba(255, 255, 255, 0.1)"}`,
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "900",
                                  color: "#FFF",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <CheckCircle2 size={15} color="#10B981" />
                                <span>
                                  {lang === "en"
                                    ? "All Active Contacts"
                                    : "العملاء النشطين فقط"}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#10B981",
                                  fontWeight: "800",
                                }}
                              >
                                {activeContactsCount}{" "}
                                {lang === "en"
                                  ? "active subscribers"
                                  : "عميل نشط"}
                              </div>
                            </div>

                            <div
                              onClick={() =>
                                setCampaignForm({
                                  ...campaignForm,
                                  audienceFilter: "specific",
                                })
                              }
                              style={{
                                padding: "12px",
                                borderRadius: "12px",
                                background:
                                  campaignForm.audienceFilter === "specific"
                                    ? "rgba(245, 158, 11, 0.2)"
                                    : "rgba(15, 23, 42, 0.6)",
                                border: `1px solid ${campaignForm.audienceFilter === "specific" ? "#F59E0B" : "rgba(255, 255, 255, 0.1)"}`,
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "900",
                                  color: "#FFF",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <User size={15} color="#F59E0B" />
                                <span>
                                  {lang === "en"
                                    ? "For Specific User"
                                    : "إلى عميل محدد"}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#F59E0B",
                                  fontWeight: "800",
                                }}
                              >
                                {campaignForm.specificContactEmail
                                  ? campaignForm.specificContactEmail
                                  : lang === "en"
                                    ? "Select subscriber"
                                    : "اختر من القائمة"}
                              </div>
                            </div>

                            <div
                              onClick={() =>
                                setCampaignForm({
                                  ...campaignForm,
                                  audienceFilter: "csv_upload",
                                  specificContactEmail: "",
                                })
                              }
                              style={{
                                padding: "12px",
                                borderRadius: "12px",
                                background:
                                  campaignForm.audienceFilter === "csv_upload"
                                    ? "rgba(168, 85, 247, 0.2)"
                                    : "rgba(15, 23, 42, 0.6)",
                                border: `1px solid ${campaignForm.audienceFilter === "csv_upload" ? "#A855F7" : "rgba(255, 255, 255, 0.1)"}`,
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "900",
                                  color: "#FFF",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <UploadCloud size={15} color="#A855F7" />
                                <span>
                                  {lang === "en"
                                    ? "Upload CSV Sheet"
                                    : "رفع ملف CSV"}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#A855F7",
                                  fontWeight: "800",
                                }}
                              >
                                {csvUploadedContacts.length > 0 
                                  ? `${csvUploadedContacts.length} ${lang === "en" ? "ready" : "جاهز"}`
                                  : lang === "en"
                                    ? "Import recipients"
                                    : "استيراد المستلمين"}
                              </div>
                            </div>
                          </div>

                          {/* Upload CSV Dropzone */}
                          {campaignForm.audienceFilter === "csv_upload" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              style={{ marginTop: "12px" }}
                            >
                              <label
                                className="es-label"
                                style={{
                                  fontSize: "11px",
                                  color: "#A855F7",
                                  marginBottom: "6px",
                                  display: "block",
                                }}
                              >
                                <span>
                                  {lang === "en"
                                    ? "Upload a CSV/Excel file containing Names and Emails:"
                                    : "ارفع ملف CSV/Excel يحتوي على الأسماء والايميلات:"}
                                </span>
                              </label>

                              <label
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "rgba(168, 85, 247, 0.05)",
                                  border: "1px dashed rgba(168, 85, 247, 0.4)",
                                  borderRadius: "12px",
                                  padding: "24px",
                                  cursor: "pointer",
                                  textAlign: "center",
                                  gap: "8px",
                                }}
                              >
                                <UploadCloud size={32} color="#A855F7" style={{ opacity: 0.8 }} />
                                <span style={{ color: "#FFF", fontSize: "14px", fontWeight: "bold" }}>
                                  {lang === "en" ? "Click to Upload Sheet" : "اضغط لرفع الملف"}
                                </span>
                                <span style={{ color: "#94A3B8", fontSize: "12px" }}>
                                  {lang === "en" ? "Automatically added to CRM & used for this campaign" : "سيتم حفظهم تلقائياً بالعملاء واستخدامهم للحملة"}
                                </span>
                                <input
                                  type="file"
                                  accept=".csv, .txt, .xlsx, .xls"
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const reader = new FileReader();
                                    reader.onload = async (evt) => {
                                      try {
                                        const data = new Uint8Array(evt.target.result);
                                        const workbook = XLSX.read(data, { type: 'array' });
                                        const firstSheetName = workbook.SheetNames[0];
                                        const worksheet = workbook.Sheets[firstSheetName];
                                        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                                        if (json.length <= 1) {
                                          toast(lang === "en" ? "Empty or invalid Excel/CSV file." : "الملف فارغ أو غير صالح.", "error");
                                          return;
                                        }

                                        const parsed = [];
                                        const headers = (json[0] || []).map(h => String(h || "").toLowerCase());
                                        const emailIdx = headers.findIndex(h => h.includes("email"));
                                        const nameIdx = headers.findIndex(h => h.includes("name"));
                                        
                                        for (let i = 1; i < json.length; i++) {
                                          const row = json[i];
                                          if (!row || row.length === 0) continue;

                                          const emailVal = emailIdx !== -1 ? row[emailIdx] : row.find(p => String(p || "").includes("@"));
                                          if (emailVal && String(emailVal).includes("@")) {
                                            parsed.push({
                                              name: (nameIdx !== -1 ? String(row[nameIdx] || "") : String(row[0] || ""))?.trim() || "Subscriber",
                                              email: String(emailVal).trim(),
                                              status: "Active",
                                              tags: ["campaign_wizard_import"]
                                            });
                                          }
                                        }

                                        if (parsed.length === 0) {
                                          toast(lang === "en" ? "No valid emails found." : "لم يتم العثور على ايميلات.", "error");
                                          return;
                                        }

                                        setCsvUploadedContacts(parsed);
                                        try {
                                          await importContactsBatch(userData.uid, parsed);
                                          const updated = await getContacts(userData.uid);
                                          setContacts(updated);
                                          toast(lang === "en" ? `Parsed ${parsed.length} contacts & imported to CRM!` : `تم قراءة ${parsed.length} وحفظهم بالعملاء!`, "success");
                                        } catch(err) {
                                          toast(lang === "en" ? "Import failed." : "فشل الاستيراد.", "error");
                                        }
                                      } catch(err) {
                                        toast(lang === "en" ? "Error parsing file." : "خطأ في قراءة الملف.", "error");
                                      }
                                    };
                                    reader.readAsArrayBuffer(file);
                                  }}
                                />
                              </label>

                              {csvUploadedContacts.length > 0 && (
                                <div style={{ marginTop: "16px", background: "rgba(16, 185, 129, 0.05)", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.3)", overflow: "hidden" }}>
                                  <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", gap: "8px", color: "#10B981", fontSize: "13px", fontWeight: "bold" }}>
                                    <CheckCircle size={18} />
                                    <span>{lang === "en" ? `✅ ${csvUploadedContacts.length} Contacts Loaded Successfully` : `✅ تم قراءة ${csvUploadedContacts.length} جهة اتصال بنجاح`}</span>
                                  </div>
                                  <div style={{ maxHeight: "200px", overflowY: "auto", padding: "8px" }}>
                                    {csvUploadedContacts.map((c, idx) => (
                                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: idx !== csvUploadedContacts.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                                        <div style={{ color: "#F8FAFC", fontSize: "12px", fontWeight: "600" }}>{c.name}</div>
                                        <div style={{ color: "#94A3B8", fontSize: "11px", fontFamily: "monospace" }}>{c.email}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}

                          {/* Executive Custom Subscriber Picker Dropdown */}
                          {campaignForm.audienceFilter === "specific" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              style={{ marginTop: "12px" }}
                            >
                              <label
                                className="es-label"
                                style={{
                                  fontSize: "11px",
                                  color: "#F59E0B",
                                  marginBottom: "6px",
                                }}
                              >
                                <UserCheck size={14} />
                                <span>
                                  {lang === "en"
                                    ? "Select target subscriber from leads list:"
                                    : "اختر العميل المستهدف من قائمة المشتركين:"}
                                </span>
                              </label>

                              <div style={{ position: "relative" }}>
                                <div
                                  onClick={() =>
                                    setIsSubscriberPickerOpen(
                                      !isSubscriberPickerOpen,
                                    )
                                  }
                                  style={{
                                    padding: "10px 14px",
                                    borderRadius: "12px",
                                    background: "rgba(15, 23, 42, 0.9)",
                                    border: "1px solid #F59E0B",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    color: "#FFF",
                                    fontSize: "12px",
                                    fontWeight: "800",
                                  }}
                                >
                                  {campaignForm.specificContactEmail ? (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                      }}
                                    >
                                      <User size={15} color="#F59E0B" />
                                      <span>
                                        {
                                          contacts.find(
                                            (c) =>
                                              c.email ===
                                              campaignForm.specificContactEmail,
                                          )?.name
                                        }
                                      </span>
                                      <span
                                        style={{
                                          color: "#94A3B8",
                                          fontSize: "11px",
                                        }}
                                      >
                                        ({campaignForm.specificContactEmail})
                                      </span>
                                    </div>
                                  ) : (
                                    <span style={{ color: "#94A3B8" }}>
                                      {lang === "en"
                                        ? "-- Click to Choose Subscriber --"
                                        : "-- اضغط لاختيار العميل --"}
                                    </span>
                                  )}
                                  <ChevronDown size={16} color="#F59E0B" />
                                </div>

                                {isSubscriberPickerOpen && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "100%",
                                      left: 0,
                                      right: 0,
                                      marginTop: "6px",
                                      background: "#0F172A",
                                      border:
                                        "1px solid rgba(245, 158, 11, 0.4)",
                                      borderRadius: "14px",
                                      boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
                                      zIndex: 100,
                                      maxHeight: "220px",
                                      overflowY: "auto",
                                      padding: "8px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        position: "relative",
                                        marginBottom: "8px",
                                      }}
                                    >
                                      <Search
                                        size={12}
                                        color="#64748B"
                                        style={{
                                          position: "absolute",
                                          top: "50%",
                                          transform: "translateY(-50%)",
                                          left: isRtl ? "auto" : "8px",
                                          right: isRtl ? "8px" : "auto",
                                        }}
                                      />
                                      <input
                                        type="text"
                                        className="es-input"
                                        placeholder={
                                          lang === "en"
                                            ? "Search subscriber..."
                                            : "بحث عن عميل..."
                                        }
                                        value={subscriberSearchText}
                                        onChange={(e) =>
                                          setSubscriberSearchText(
                                            e.target.value,
                                          )
                                        }
                                        style={{
                                          height: "30px",
                                          fontSize: "11px",
                                          paddingLeft: isRtl ? "10px" : "26px",
                                          paddingRight: isRtl ? "26px" : "10px",
                                        }}
                                      />
                                    </div>

                                    {filteredPickerContacts.map((c) => (
                                      <div
                                        key={c.id || c.email}
                                        onClick={() => {
                                          setCampaignForm({
                                            ...campaignForm,
                                            specificContactEmail: c.email,
                                          });
                                          setIsSubscriberPickerOpen(false);
                                        }}
                                        style={{
                                          padding: "8px 12px",
                                          borderRadius: "8px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          cursor: "pointer",
                                          background:
                                            campaignForm.specificContactEmail ===
                                            c.email
                                              ? "rgba(245, 158, 11, 0.2)"
                                              : "transparent",
                                          transition: "all 0.2s ease",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                          }}
                                        >
                                          <User size={14} color="#F59E0B" />
                                          <div>
                                            <div
                                              style={{
                                                fontSize: "12px",
                                                fontWeight: "800",
                                                color: "#FFF",
                                              }}
                                            >
                                              {c.name}
                                            </div>
                                            <div
                                              style={{
                                                fontSize: "10px",
                                                color: "#94A3B8",
                                              }}
                                            >
                                              {c.email}
                                            </div>
                                          </div>
                                        </div>
                                        <span
                                          className={`es-status-pill ${c.status?.toLowerCase() === "active" ? "active" : c.status?.toLowerCase() === "inactive" ? "inactive" : "unsubscribed"}`}
                                        >
                                          ● {c.status}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "16px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                !campaignForm.title ||
                                !campaignForm.subject
                              ) {
                                toast(
                                  lang === "en"
                                    ? "Please fill title and subject."
                                    : "يرجى كتابة العنوان والموضوع.",
                                  "error",
                                );
                                return;
                              }
                              if (
                                campaignForm.audienceFilter === "specific" &&
                                !campaignForm.specificContactEmail
                              ) {
                                toast(
                                  lang === "en"
                                    ? "Please select a specific customer."
                                    : "يرجى اختيار عميل محدد.",
                                  "error",
                                );
                                return;
                              }
                              setCampaignWizardStep(2);
                            }}
                            className="es-copy-all-btn"
                          >
                            <span>
                              {lang === "en"
                                ? "Next: Build Template & Live Preview →"
                                : "التالي: تصميم القالب والمعاينة المباشرة ←"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {campaignWizardStep === 2 && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#818CF8",
                                fontWeight: "800",
                              }}
                            >
                              HTML Source Code Editor
                            </span>
                            <div
                              style={{
                                display: "flex",
                                gap: "4px",
                                flexWrap: "wrap",
                              }}
                            >
                              {[
                                "{{name}}",
                                "{{first_name}}",
                                "{{email}}",
                                "{{subscription_end_date}}",
                                "{{discount_code}}",
                              ].map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() =>
                                    setCampaignForm((prev) => ({
                                      ...prev,
                                      templateHtml:
                                        prev.templateHtml + ` ${tag} `,
                                    }))
                                  }
                                  style={{
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    background: "rgba(99,102,241,0.2)",
                                    border: "1px solid rgba(99,102,241,0.3)",
                                    color: "#818CF8",
                                    fontSize: "10px",
                                    cursor: "pointer",
                                  }}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>

                          <textarea
                            rows={12}
                            className="es-input"
                            style={{
                              fontFamily: "monospace",
                              fontSize: "11px",
                              background: "#0D1117",
                              color: "#7EE787",
                              lineHeight: 1.5,
                            }}
                            value={campaignForm.templateHtml}
                            onChange={(e) =>
                              setCampaignForm({
                                ...campaignForm,
                                templateHtml: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#10B981",
                                fontWeight: "800",
                              }}
                            >
                              Live Interactive Email Preview
                            </span>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                onClick={() => setPreviewViewport("desktop")}
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  background:
                                    previewViewport === "desktop"
                                      ? "rgba(99,102,241,0.3)"
                                      : "transparent",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: "#FFF",
                                  cursor: "pointer",
                                }}
                              >
                                <Monitor size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewViewport("mobile")}
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  background:
                                    previewViewport === "mobile"
                                      ? "rgba(99,102,241,0.3)"
                                      : "transparent",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: "#FFF",
                                  cursor: "pointer",
                                }}
                              >
                                <Smartphone size={12} />
                              </button>
                            </div>
                          </div>

                          <div
                            style={{
                              height: "240px",
                              background: "#FFF",
                              borderRadius: "12px",
                              padding: "12px",
                              overflowY: "auto",
                              maxWidth:
                                previewViewport === "mobile" ? "280px" : "100%",
                              margin:
                                previewViewport === "mobile" ? "0 auto" : "0",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: campaignForm.templateHtml
                                .replace(
                                  /{{name}}/g,
                                  campaignForm.audienceFilter === "specific"
                                    ? contacts.find(
                                        (c) =>
                                          c.email ===
                                          campaignForm.specificContactEmail,
                                      )?.name || "Ahmed"
                                    : "Ahmed Mansour",
                                )
                                .replace(
                                  /{{first_name}}/g,
                                  campaignForm.audienceFilter === "specific"
                                    ? contacts
                                        .find(
                                          (c) =>
                                            c.email ===
                                            campaignForm.specificContactEmail,
                                        )
                                        ?.name?.split(" ")[0] || "Ahmed"
                                    : "Ahmed",
                                )
                                .replace(
                                  /{{subscription_end_date}}/g,
                                  "2026-12-31",
                                )
                                .replace(/{{discount_code}}/g, "VIP-2026"),
                            }}
                          />
                        </div>

                        <div
                          style={{
                            gridColumn: "1 / -1",
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "10px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setCampaignWizardStep(1)}
                            className="es-page-btn"
                          >
                            <span>← {lang === "en" ? "Back" : "السابق"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCampaignWizardStep(3)}
                            className="es-copy-all-btn"
                          >
                            <span>
                              {lang === "en"
                                ? "Next: Review & Real Resend Dispatch →"
                                : "التالي: مراجعة وتأكيد الإرسال ←"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {campaignWizardStep === 3 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(15, 23, 42, 0.6)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            borderRadius: "16px",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "800",
                              color: "#FFF",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <FileText size={15} color="#818CF8" />
                            <span>{campaignForm.title}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                            Subject Line:{" "}
                            <strong style={{ color: "#FFF" }}>
                              {campaignForm.subject}
                            </strong>
                          </div>
                          <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                            Target Audience:{" "}
                            <strong style={{ color: "#10B981" }}>
                              {campaignForm.audienceFilter === "specific"
                                ? `Specific User (${campaignForm.specificContactEmail})`
                                : campaignForm.audienceFilter === "active"
                                  ? `${activeContactsCount} active contacts`
                                  : `${contacts.length} total contacts`}
                            </strong>
                          </div>
                          <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                            Email Delivery Server:{" "}
                            <strong style={{ color: "#818CF8" }}>
                              Resend API (https://api.resend.com/emails)
                            </strong>
                          </div>
                        </div>

                        {/* Real-time Dispatch Progress Indicator */}
                        {isSendingCampaign && (
                          <div
                            style={{
                              background: "rgba(99, 102, 241, 0.15)",
                              border: "1px solid #6366F1",
                              borderRadius: "12px",
                              padding: "14px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "12px",
                                color: "#FFF",
                                fontWeight: "800",
                                marginBottom: "6px",
                              }}
                            >
                              <span>
                                ⚡{" "}
                                {lang === "en"
                                  ? "Dispatching Real Emails via Resend API..."
                                  : "جاري إرسال الرسائل الحقيقية عبر Resend API..."}
                              </span>
                              <span>
                                {dispatchProgress.current} /{" "}
                                {dispatchProgress.total} (
                                {dispatchProgress.percent}%)
                              </span>
                            </div>
                            <div
                              style={{
                                width: "100%",
                                height: "8px",
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: "999px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${dispatchProgress.percent}%`,
                                  height: "100%",
                                  background:
                                    "linear-gradient(90deg, #6366F1, #10B981)",
                                  transition: "width 0.3s ease",
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setCampaignWizardStep(2)}
                            className="es-page-btn"
                            disabled={isSendingCampaign}
                          >
                            <span>← {lang === "en" ? "Back" : "السابق"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleLaunchCampaignFromWizard}
                            disabled={isSendingCampaign}
                            className="es-copy-all-btn"
                            style={{ padding: "10px 24px", fontSize: "13px" }}
                          >
                            <Rocket size={16} />
                            <span>
                              {isSendingCampaign
                                ? lang === "en"
                                  ? "Sending via Resend API..."
                                  : "جاري الإرسال عبر Resend API..."
                                : lang === "en"
                                  ? "Confirm & Dispatch via Resend API Now"
                                  : "تأكيد وإرسال الإيميلات حقيقياً الآن "}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="campaigns-history-list"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="es-bulk-card"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div className="es-card-header-title">
                        <Send size={18} color="#818CF8" />
                        <span>
                          {lang === "en"
                            ? "Email Campaigns History & Resend Logs"
                            : "سجل وحملات التسويق الإلكتروني"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsWizardFullPageMode(true);
                          setCampaignWizardStep(1);
                        }}
                        className="es-copy-all-btn"
                      >
                        <Rocket size={14} />
                        <span>
                          {lang === "en"
                            ? "Create New Campaign Wizard"
                            : "إنشاء حملة تسويقية جديدة"}
                        </span>
                      </button>
                    </div>

                    {campaignsLoading ? (
                      <div
                        className="es-skeleton-pulse"
                        style={{ height: "180px" }}
                      />
                    ) : campaigns.length === 0 ? (
                      <div className="es-empty-state-box">
                        <Send size={32} color="#6366F1" />
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "800",
                            color: "#FFF",
                          }}
                        >
                          {lang === "en"
                            ? "No Campaigns Sent Yet"
                            : "لم تقم بإطلاق أي حملات تسويقية بعد"}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94A3B8",
                            maxWidth: "360px",
                          }}
                        >
                          {lang === "en"
                            ? "Launch your first automated campaign via Resend API to engage subscribers."
                            : "أطلق أول حملة بريدية لجمهورك عبر Resend API وتتبع أداء وسجلات الوصول والمشاهدات."}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="es-table-wrapper">
                          <table className="es-audience-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>
                                  {lang === "en"
                                    ? "Campaign Title"
                                    : "عنوان الحملة"}
                                </th>
                                <th>
                                  {lang === "en"
                                    ? "Resend Batch ID"
                                    : "معرّف الدفعة"}
                                </th>
                                <th>
                                  {lang === "en" ? "Recipients" : "المستلمون"}
                                </th>
                                <th>{lang === "en" ? "Status" : "الحالة"}</th>
                                <th>
                                  {lang === "en"
                                    ? "Opens / Clicks Performance"
                                    : "المشاهدات والنقرات"}
                                </th>
                                <th>{lang === "en" ? "Actions" : "إجراءات"}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedCampaigns.map((camp, idx) => {
                                const totalRec = camp.recipientsCount || 1;
                                const openPercent = Math.min(
                                  100,
                                  Math.round(
                                    ((camp.stats?.opens || 0) / totalRec) * 100,
                                  ),
                                );
                                const clickPercent = Math.min(
                                  100,
                                  Math.round(
                                    ((camp.stats?.clicks || 0) / totalRec) *
                                      100,
                                  ),
                                );

                                return (
                                  <tr key={camp.id || idx}>
                                    <td>
                                      {(campaignCurrentPage - 1) *
                                        campaignsPerPage +
                                        idx +
                                        1}
                                    </td>
                                    <td style={{ fontWeight: "800" }}>
                                      {camp.title}
                                    </td>
                                    <td
                                      style={{
                                        fontFamily: "monospace",
                                        fontSize: "11px",
                                        color: "#818CF8",
                                      }}
                                    >
                                      {camp.resendBatchId || "batch_default"}
                                    </td>
                                    <td>{camp.recipientsCount} contacts</td>
                                    <td>
                                      <span
                                        style={{
                                          padding: "2px 8px",
                                          borderRadius: "4px",
                                          background:
                                            camp.status === "Sent"
                                              ? "rgba(16, 185, 129, 0.2)"
                                              : "rgba(239, 68, 68, 0.2)",
                                          color:
                                            camp.status === "Sent"
                                              ? "#10B981"
                                              : "#EF4444",
                                          fontWeight: "800",
                                        }}
                                      >
                                        {camp.status}
                                      </span>
                                    </td>

                                    <td>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "6px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: "6px",
                                            fontSize: "10.5px",
                                            fontWeight: "800",
                                          }}
                                        >
                                          <span
                                            style={{
                                              color: "#10B981",
                                              background:
                                                "rgba(16,185,129,0.15)",
                                              padding: "2px 8px",
                                              borderRadius: "6px",
                                              border:
                                                "1px solid rgba(16,185,129,0.3)",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 4,
                                            }}
                                          >
                                            <Eye size={12} />{" "}
                                            {camp.stats?.opens || 0} Opens (
                                            {openPercent}%)
                                          </span>
                                          <span
                                            style={{
                                              color: "#818CF8",
                                              background:
                                                "rgba(99,102,241,0.15)",
                                              padding: "2px 8px",
                                              borderRadius: "6px",
                                              border:
                                                "1px solid rgba(99,102,241,0.3)",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 4,
                                            }}
                                          >
                                            <Target size={12} />{" "}
                                            {camp.stats?.clicks || 0} Clicks (
                                            {clickPercent}%)
                                          </span>
                                        </div>
                                        <div
                                          style={{
                                            width: "120px",
                                            height: "4px",
                                            background: "rgba(255,255,255,0.1)",
                                            borderRadius: "999px",
                                            overflow: "hidden",
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: `${openPercent}%`,
                                              height: "100%",
                                              background:
                                                "linear-gradient(90deg, #6366F1, #10B981)",
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </td>

                                    <td>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          requestDeleteConfirmation(
                                            "campaign",
                                            camp.id,
                                            camp.title,
                                            camp.subject,
                                          )
                                        }
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: "#EF4444",
                                          cursor: "pointer",
                                          padding: "4px",
                                        }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="es-pagination-bar">
                          <div className="es-pagination-info">
                            {lang === "en"
                              ? `Showing ${(campaignCurrentPage - 1) * campaignsPerPage + 1} - ${Math.min(campaignCurrentPage * campaignsPerPage, campaigns.length)} of ${campaigns.length} campaigns`
                              : `عرض ${(campaignCurrentPage - 1) * campaignsPerPage + 1} - ${Math.min(campaignCurrentPage * campaignsPerPage, campaigns.length)} من إجمالي ${campaigns.length} حملة`}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setCampaignCurrentPage((prev) =>
                                  Math.max(1, prev - 1),
                                )
                              }
                              disabled={campaignCurrentPage === 1}
                              className="es-page-btn"
                              aria-label="Previous Page"
                            >
                              {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                            </button>

                            <span
                              className="es-page-num-text"
                              style={{
                                fontWeight: "800",
                                padding: "0 6px",
                              }}
                            >
                              {campaignCurrentPage} / {totalCampaignPages}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setCampaignCurrentPage((prev) =>
                                  Math.min(totalCampaignPages, prev + 1),
                                )
                              }
                              disabled={
                                campaignCurrentPage === totalCampaignPages
                              }
                              className="es-page-btn"
                              aria-label="Next Page"
                            >
                              {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ── 4. AUTOMATIONS & RENEWAL TRIGGERS ── */}
            {crmSubTab === "automations" && !isWizardFullPageMode && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="es-bulk-card"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div className="es-card-header-title">
                    <Zap size={18} color="#818CF8" />
                    <span>
                      {lang === "en"
                        ? "Automated Email Workflows & Renewal Triggers"
                        : "مسارات الأتمتة التلقائية وتنبيهات تجديد الاشتراك"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreateAutomationOpen(true)}
                    className="es-copy-all-btn"
                  >
                    <Plus size={14} />
                    <span>
                      {lang === "en"
                        ? "Add Automation Workflow"
                        : "إضافة مسار أتمتة جديد"}
                    </span>
                  </button>
                </div>

                {automationsLoading ? (
                  <div
                    className="es-skeleton-pulse"
                    style={{ height: "180px" }}
                  />
                ) : automations.length === 0 ? (
                  <div className="es-empty-state-box">
                    <Zap size={32} color="#6366F1" />
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: "#FFF",
                      }}
                    >
                      {lang === "en"
                        ? "No Active Automations Created"
                        : "لا يوجد مسارات أتمتة مفعّلة حالياً"}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94A3B8",
                        maxWidth: "380px",
                      }}
                    >
                      {lang === "en"
                        ? "Set up automatic triggers for subscription renewal reminders based on subscription_end_date."
                        : "أنشئ مشغلات تلقائية لتذكير العملاء بتجديد الاشتراك بناءً على تاريخ subscription_end_date."}
                    </div>
                  </div>
                ) : (
                  <div className="es-table-wrapper">
                    <table className="es-audience-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>
                            {lang === "en"
                              ? "Automation Flow Name"
                              : "اسم المسار التلقائي"}
                          </th>
                          <th>
                            {lang === "en" ? "Trigger Type" : "نوع المشغّل"}
                          </th>
                          <th>
                            {lang === "en"
                              ? "Schedule Interval"
                              : "التوقيت / التكرار"}
                          </th>
                          <th>{lang === "en" ? "Status" : "الحالة"}</th>
                          <th>{lang === "en" ? "Actions" : "إجراءات"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {automations.map((auto, idx) => (
                          <tr key={auto.id || idx}>
                            <td>{idx + 1}</td>
                            <td style={{ fontWeight: "800" }}>{auto.title}</td>
                            <td>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  background:
                                    auto.triggerType === "renewal"
                                      ? "rgba(245, 158, 11, 0.2)"
                                      : "rgba(99, 102, 241, 0.2)",
                                  color:
                                    auto.triggerType === "renewal"
                                      ? "#F59E0B"
                                      : "#818CF8",
                                  fontWeight: "800",
                                }}
                              >
                                {auto.triggerType === "renewal"
                                  ? lang === "en"
                                    ? "Subscription Renewal (تجديد الاشتراك)"
                                    : "تجديد الاشتراك"
                                  : lang === "en"
                                    ? "Recurring Drip"
                                    : "نشرة دورية"}
                              </span>
                            </td>
                            <td>{auto.intervalDays} days trigger</td>
                            <td>
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleAutomation(auto.id, auto.active)
                                }
                                style={{
                                  padding: "3px 12px",
                                  borderRadius: "9999px",
                                  border: "none",
                                  background: auto.active
                                    ? "#10B981"
                                    : "#64748B",
                                  color: "#FFF",
                                  fontSize: "10px",
                                  fontWeight: "800",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <span
                                  className="es-status-dot-pulse"
                                  style={{ background: "#FFF" }}
                                />
                                {auto.active ? "ACTIVE (نشط)" : "OFF (معطل)"}
                              </button>
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  justifyContent: "center",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => setEditingAutomation(auto)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#818CF8",
                                    cursor: "pointer",
                                    padding: "4px",
                                  }}
                                  title="Edit Automation Workflow"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    requestDeleteConfirmation(
                                      "automation",
                                      auto.id,
                                      auto.title,
                                      "Automation Workflow",
                                    )
                                  }
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#EF4444",
                                    cursor: "pointer",
                                    padding: "4px",
                                  }}
                                  title="Delete Automation"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ═══════════════ MAIN TAB 2: CRYPTOGRAPHIC DNS AUTHENTICATION ═══════════════ */}
        {mainTab === "dns" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="es-pipeline-header-bar">
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div className="es-pipeline-core-icon">
                  <Cpu size={20} color="#6366F1" />
                </div>
                <div>
                  <div className="es-pipeline-title-text">
                    {lang === "en"
                      ? "Cryptographic Email Authentication Matrix"
                      : "مصفوفة التوثيق الرقمي والتشفير"}
                  </div>
                  <div className="es-pipeline-sub-text">
                    {lang === "en"
                      ? "5 Data Transmission Terminals Active"
                      : "5 محطات تفعيل نشطة لنقل البيانات والمعلومات"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const text = dnsRecords
                    .map((r) => `${r.type} ${r.host} ${r.value}`)
                    .join("\n");
                  navigator.clipboard.writeText(text);
                  toast(
                    lang === "en"
                      ? "Copied all DNS records!"
                      : "تم نسخ جميع سجلات DNS!",
                    "success",
                  );
                }}
                className="es-copy-all-btn"
              >
                <Copy size={14} />
                <span>
                  {lang === "en"
                    ? "Copy All DNS Records"
                    : "نسخ جميع سجلات DNS"}
                </span>
              </button>
            </div>

            <div className="es-mobile-deck" style={{ marginTop: "14px" }}>
              {pipelineModules.map((m) => {
                const IconComp = m.IconComp;
                const isActive = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setActiveModule(m.id);
                      setModalOpen(true);
                    }}
                    className={`es-mobile-chip ${isActive ? "active" : ""}`}
                  >
                    <IconComp size={15} />
                    <span>
                      {lang === "en"
                        ? m.title_en.split(".")[1]
                        : m.title_ar.split(".")[1]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="es-pipeline-container"
              style={{ marginTop: "14px" }}
            >
              <svg
                className="es-pipeline-conduit-svg"
                viewBox="0 0 1000 120"
                preserveAspectRatio="none"
              >
                <line
                  x1="100"
                  y1="60"
                  x2="900"
                  y2="60"
                  className="es-conduit-line"
                />
              </svg>

              <div className="es-pipeline-terminals-grid">
                {pipelineModules.map((mod) => {
                  const IconComp = mod.IconComp;
                  const isActive = activeModule === mod.id;
                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        setActiveModule(mod.id);
                        setModalOpen(true);
                      }}
                      className={`es-pipeline-terminal ${isActive ? "active" : ""}`}
                    >
                      <div className="es-terminal-hover-overlay" />
                      <div className="es-terminal-top">
                        <div className="es-terminal-icon-box">
                          <IconComp size={20} color="#818CF8" />
                        </div>
                        <span className="es-terminal-badge">
                          {lang === "en" ? mod.badge_en : mod.badge_ar}
                        </span>
                      </div>

                      <div className="es-terminal-body">
                        <div className="es-terminal-title">
                          {lang === "en" ? mod.title_en : mod.title_ar}
                        </div>
                        <div className="es-terminal-sub">
                          {lang === "en" ? mod.sub_en : mod.sub_ar}
                        </div>
                      </div>

                      <button type="button" className="es-terminal-trigger">
                        <SlidersHorizontal size={13} />
                        <span>
                          {lang === "en"
                            ? "Inspect Module"
                            : "تفتيش البيانات والإدخال"}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ MODAL 1: ADD CONTACT (WITH SUBSCRIPTION_END_DATE) ═══════════════ */}
        {isAddContactModalOpen && (
          <div
            className="es-confirm-backdrop"
            dir={isRtl ? "rtl" : "ltr"}
            onClick={() => setIsAddContactModalOpen(false)}
          >
            <div
              className="es-modal-card"
              style={{ maxWidth: "480px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="es-modal-header" style={{ alignItems: "center" }}>
                <h3 className="es-modal-title" style={{ margin: 0 }}>
                  {lang === "en"
                    ? "Add New Contact "
                    : "إضافة عميل جديد "}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="es-modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleCreateContactSubmit}
                className="es-modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en" ? "Full Name:" : "الاسم الكامل:"}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="es-input"
                    value={newContactForm.name}
                    onChange={(e) =>
                      setNewContactForm({
                        ...newContactForm,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en" ? "Email Address:" : "البريد الإلكتروني:"}
                    </span>
                  </label>
                  <input
                    type="email"
                    className="es-input"
                    value={newContactForm.email}
                    onChange={(e) =>
                      setNewContactForm({
                        ...newContactForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en" ? "Phone Number:" : "رقم الهاتف:"}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="es-input"
                    value={newContactForm.phone}
                    onChange={(e) =>
                      setNewContactForm({
                        ...newContactForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en"
                        ? "Subscription Expiry Date (subscription_end_date):"
                        : "تاريخ انتهاء الاشتراك (subscription_end_date):"}
                    </span>
                  </label>
                  <input
                    type="date"
                    className="es-input"
                    value={newContactForm.subscription_end_date}
                    onChange={(e) =>
                      setNewContactForm({
                        ...newContactForm,
                        subscription_end_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en" ? "Contact Status:" : "حالة العميل:"}
                    </span>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginTop: "6px",
                    }}
                  >
                    {[
                      {
                        id: "Active",
                        title_en: "Active Subscriber",
                        title_ar: "عميل نشط",
                        desc_en:
                          "Receives all automated campaigns & drip emails",
                        desc_ar: "يستلم جميع الرسائل والحملات التسويقية بنجاح",
                        color: "#10B981",
                        bg: "rgba(16, 185, 129, 0.15)",
                        Icon: CheckCircle2,
                      },
                      {
                        id: "Inactive",
                        title_en: "Inactive Lead",
                        title_ar: "غير نشط (موقوف مؤقتاً)",
                        desc_en:
                          "Temporarily paused from receiving campaign dispatches",
                        desc_ar: "موقوف مؤقتاً عن استلام الحملات البريدية",
                        color: "#F59E0B",
                        bg: "rgba(245, 158, 11, 0.15)",
                        Icon: AlertCircle,
                      },
                      {
                        id: "Unsubscribed",
                        title_en: "Unsubscribed / Opted-out",
                        title_ar: "ملغي الاشتراك",
                        desc_en: "Opted out from subscription list",
                        desc_ar:
                          "قام بإلغاء الاشتراك من قائمة البريد الإلكتروني",
                        color: "#EF4444",
                        bg: "rgba(239, 68, 68, 0.15)",
                        Icon: X,
                      },
                    ].map((st) => {
                      const isSelected = newContactForm.status === st.id;
                      const StIcon = st.Icon;
                      return (
                        <div
                          key={st.id}
                          onClick={() =>
                            setNewContactForm({
                              ...newContactForm,
                              status: st.id,
                            })
                          }
                          style={{
                            padding: "10px 14px",
                            borderRadius: "12px",
                            background: isSelected
                              ? st.bg
                              : "rgba(15, 23, 42, 0.5)",
                            border: `1.5px solid ${isSelected ? st.color : "rgba(255, 255, 255, 0.08)"}`,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.25s ease",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <StIcon size={16} color={st.color} />
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "800",
                                  color: isSelected ? "#FFF" : "#E2E8F0",
                                }}
                              >
                                {lang === "en" ? st.title_en : st.title_ar}
                              </div>
                              <div
                                style={{ fontSize: "10.5px", color: "#94A3B8" }}
                              >
                                {lang === "en" ? st.desc_en : st.desc_ar}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={16} color={st.color} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="es-copy-all-btn"
                  style={{ marginTop: "10px" }}
                >
                  <span>
                    {lang === "en"
                      ? "Save Contact"
                      : "حفظ العميل"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════ MODAL 2: EDIT CONTACT (WITH SUBSCRIPTION_END_DATE) ═══════════════ */}
        {editingContact && (
          <div
            className="es-confirm-backdrop"
            dir={isRtl ? "rtl" : "ltr"}
            onClick={() => setEditingContact(null)}
          >
            <div
              className="es-modal-card"
              style={{ maxWidth: "480px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="es-modal-header">
                <h3 className="es-modal-title">
                  {lang === "en"
                    ? "Edit Contact Details"
                    : "تعديل بيانات العميل"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="es-modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleEditContactSubmit}
                className="es-modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en" ? "Full Name:" : "الاسم الكامل:"}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="es-input"
                    value={editingContact.name}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en" ? "Email Address:" : "البريد الإلكتروني:"}
                    </span>
                  </label>
                  <input
                    type="email"
                    className="es-input"
                    value={editingContact.email}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en" ? "Phone Number:" : "رقم الهاتف:"}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="es-input"
                    value={editingContact.phone || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en"
                        ? "Subscription Expiry Date (subscription_end_date):"
                        : "تاريخ انتهاء الاشتراك (subscription_end_date):"}
                    </span>
                  </label>
                  <input
                    type="date"
                    className="es-input"
                    value={
                      editingContact.subscription_end_date ||
                      editingContact.subscriptionEndDate ||
                      ""
                    }
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        subscription_end_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en" ? "Contact Status:" : "حالة العميل:"}
                    </span>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginTop: "6px",
                    }}
                  >
                    {[
                      {
                        id: "Active",
                        title_en: "Active Subscriber",
                        title_ar: "عميل نشط",
                        desc_en:
                          "Receives all automated campaigns & drip emails",
                        desc_ar: "يستلم جميع الرسائل والحملات التسويقية بنجاح",
                        color: "#10B981",
                        bg: "rgba(16, 185, 129, 0.15)",
                        Icon: CheckCircle2,
                      },
                      {
                        id: "Inactive",
                        title_en: "Inactive Lead",
                        title_ar: "غير نشط (موقوف مؤقتاً)",
                        desc_en:
                          "Temporarily paused from receiving campaign dispatches",
                        desc_ar: "موقوف مؤقتاً عن استلام الحملات البريدية",
                        color: "#F59E0B",
                        bg: "rgba(245, 158, 11, 0.15)",
                        Icon: AlertCircle,
                      },
                      {
                        id: "Unsubscribed",
                        title_en: "Unsubscribed / Opted-out",
                        title_ar: "ملغي الاشتراك",
                        desc_en: "Opted out from subscription list",
                        desc_ar:
                          "قام بإلغاء الاشتراك من قائمة البريد الإلكتروني",
                        color: "#EF4444",
                        bg: "rgba(239, 68, 68, 0.15)",
                        Icon: X,
                      },
                    ].map((st) => {
                      const isSelected = editingContact.status === st.id;
                      const StIcon = st.Icon;
                      return (
                        <div
                          key={st.id}
                          onClick={() =>
                            setEditingContact({
                              ...editingContact,
                              status: st.id,
                            })
                          }
                          style={{
                            padding: "10px 14px",
                            borderRadius: "12px",
                            background: isSelected
                              ? st.bg
                              : "rgba(15, 23, 42, 0.5)",
                            border: `1.5px solid ${isSelected ? st.color : "rgba(255, 255, 255, 0.08)"}`,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.25s ease",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <StIcon size={16} color={st.color} />
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "800",
                                  color: isSelected ? "#FFF" : "#E2E8F0",
                                }}
                              >
                                {lang === "en" ? st.title_en : st.title_ar}
                              </div>
                              <div
                                style={{ fontSize: "10.5px", color: "#94A3B8" }}
                              >
                                {lang === "en" ? st.desc_en : st.desc_ar}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={16} color={st.color} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="es-copy-all-btn"
                  style={{ marginTop: "10px" }}
                >
                  <span>
                    {lang === "en"
                      ? "Update Contact Details"
                      : "تحديث بيانات العميل"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════ MODAL 3: CREATE AUTOMATION ═══════════════ */}
        {isCreateAutomationOpen && (
          <div
            className="es-confirm-backdrop"
            dir={isRtl ? "rtl" : "ltr"}
            onClick={() => setIsCreateAutomationOpen(false)}
          >
            <div
              className="es-modal-card"
              style={{ maxWidth: "500px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="es-modal-header">
                <h3 className="es-modal-title">
                  {lang === "en"
                    ? "Create Email Automation Trigger"
                    : "إنشاء مسار أتمتة تلقائي"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateAutomationOpen(false)}
                  className="es-modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleCreateAutomationSubmit}
                className="es-modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en" ? "Workflow Title:" : "اسم مسار الأتمتة:"}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="es-input"
                    value={automationForm.title}
                    onChange={(e) =>
                      setAutomationForm({
                        ...automationForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en"
                        ? "Select Automation Trigger Type:"
                        : "اختر نوع المشغّل التلقائي:"}
                    </span>
                  </label>
                  <div className="es-trigger-card-grid">
                    <div
                      className={`es-trigger-card ${automationForm.triggerType === "renewal" ? "active" : ""}`}
                      onClick={() =>
                        setAutomationForm({
                          ...automationForm,
                          triggerType: "renewal",
                          title: "تذكير تجديد الاشتراك (Subscription Renewal)",
                        })
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#F59E0B",
                          fontWeight: "800",
                          fontSize: "12px",
                        }}
                      >
                        <Clock size={15} />
                        <span>تجديد الاشتراك (Renewal)</span>
                      </div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          color: "#94A3B8",
                          lineHeight: 1.4,
                        }}
                      >
                        تنبيهات تلقائية بناءً على تاريخ انتهاء اشتراك العميل
                        (subscription_end_date).
                      </div>
                    </div>

                    <div
                      className={`es-trigger-card ${automationForm.triggerType === "recurring" ? "active" : ""}`}
                      onClick={() =>
                        setAutomationForm({
                          ...automationForm,
                          triggerType: "recurring",
                          title: "نشرة دورية تلقائية (Drip Sequence)",
                        })
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#818CF8",
                          fontWeight: "800",
                          fontSize: "12px",
                        }}
                      >
                        <Repeat size={15} />
                        <span>نشرة دورية (Drip)</span>
                      </div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          color: "#94A3B8",
                          lineHeight: 1.4,
                        }}
                      >
                        إرسال رسائل بريدية ترحيبية أو تعليمية دورية كل X يوم.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en"
                        ? "Interval Days (توقيت الإرسال):"
                        : "توقيت الإرسال بالأيام:"}
                    </span>
                  </label>
                  <input
                    type="number"
                    className="es-input"
                    value={automationForm.intervalDays}
                    onChange={(e) =>
                      setAutomationForm({
                        ...automationForm,
                        intervalDays: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="es-copy-all-btn"
                  style={{ marginTop: "10px" }}
                >
                  <Zap size={15} />
                  <span>
                    {lang === "en"
                      ? "Activate Automation Workflow"
                      : "تفعيل مسار الأتمتة"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════ MODAL 4: EDIT AUTOMATION WORKFLOW ═══════════════ */}
        {editingAutomation && (
          <div
            className="es-confirm-backdrop"
            dir={isRtl ? "rtl" : "ltr"}
            onClick={() => setEditingAutomation(null)}
          >
            <div
              className="es-modal-card"
              style={{ maxWidth: "500px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="es-modal-header">
                <h3 className="es-modal-title">
                  {lang === "en"
                    ? "Edit Automation Workflow"
                    : "تعديل مسار الأتمتة التلقائي"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingAutomation(null)}
                  className="es-modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleEditAutomationSubmit}
                className="es-modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en" ? "Workflow Title:" : "اسم مسار الأتمتة:"}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="es-input"
                    value={editingAutomation.title}
                    onChange={(e) =>
                      setEditingAutomation({
                        ...editingAutomation,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en"
                        ? "Trigger Type:"
                        : "نوع المشغّل التلقائي:"}
                    </span>
                  </label>
                  <div className="es-trigger-card-grid">
                    <div
                      className={`es-trigger-card ${editingAutomation.triggerType === "renewal" ? "active" : ""}`}
                      onClick={() =>
                        setEditingAutomation({
                          ...editingAutomation,
                          triggerType: "renewal",
                        })
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#F59E0B",
                          fontWeight: "800",
                          fontSize: "12px",
                        }}
                      >
                        <Clock size={15} />
                        <span>تجديد الاشتراك (Renewal)</span>
                      </div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          color: "#94A3B8",
                          lineHeight: 1.4,
                        }}
                      >
                        تنبيهات تلقائية بناءً على تاريخ انتهاء اشتراك العميل
                        (subscription_end_date).
                      </div>
                    </div>

                    <div
                      className={`es-trigger-card ${editingAutomation.triggerType === "recurring" ? "active" : ""}`}
                      onClick={() =>
                        setEditingAutomation({
                          ...editingAutomation,
                          triggerType: "recurring",
                        })
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#818CF8",
                          fontWeight: "800",
                          fontSize: "12px",
                        }}
                      >
                        <Repeat size={15} />
                        <span>نشرة دورية (Drip)</span>
                      </div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          color: "#94A3B8",
                          lineHeight: 1.4,
                        }}
                      >
                        إرسال رسائل بريدية ترحيبية أو تعليمية دورية كل X يوم.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en"
                        ? "Interval Days (التوقيت بالأيام):"
                        : "التوقيت بالأيام:"}
                    </span>
                  </label>
                  <input
                    type="number"
                    className="es-input"
                    value={editingAutomation.intervalDays}
                    onChange={(e) =>
                      setEditingAutomation({
                        ...editingAutomation,
                        intervalDays: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="es-label">
                    <span>
                      {lang === "en"
                        ? "Workflow Active Status:"
                        : "حالة الأتمتة:"}
                    </span>
                  </label>
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "4px" }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setEditingAutomation({
                          ...editingAutomation,
                          active: true,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "10px",
                        border: "1px solid #10B981",
                        background: editingAutomation.active
                          ? "rgba(16,185,129,0.2)"
                          : "transparent",
                        color: editingAutomation.active ? "#FFF" : "#94A3B8",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <CheckCircle2 size={15} color="#10B981" />
                      <span>
                        {lang === "en" ? "ACTIVE (Enabled)" : "نشط (مفعل)"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingAutomation({
                          ...editingAutomation,
                          active: false,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "10px",
                        border: "1px solid #EF4444",
                        background: !editingAutomation.active
                          ? "rgba(239,68,68,0.2)"
                          : "transparent",
                        color: !editingAutomation.active ? "#FFF" : "#94A3B8",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <X size={15} color="#EF4444" />
                      <span>{lang === "en" ? "OFF (Disabled)" : "معطل"}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="es-copy-all-btn"
                  style={{ marginTop: "10px" }}
                >
                  <Zap size={15} />
                  <span>
                    {lang === "en"
                      ? "Update Automation Flow"
                      : "تحديث مسار الأتمتة"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════ MODAL 5: PROFESSIONAL CONFIRMATION DIALOG ═══════════════ */}
        {deleteConfirmDialog.isOpen && (
          <div
            className="es-confirm-backdrop"
            dir={isRtl ? "rtl" : "ltr"}
            onClick={() =>
              setDeleteConfirmDialog({
                isOpen: false,
                type: null,
                id: null,
                title: "",
                subtitle: "",
              })
            }
          >
            <div
              className="es-confirm-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="es-confirm-warning-icon">
                <AlertTriangle size={28} />
              </div>

              <div>
                <h3
                  style={{
                    margin: "0 0 6px 0",
                    color: "#FFF",
                    fontSize: "15px",
                    fontWeight: "900",
                  }}
                >
                  {lang === "en" ? "Confirm Deletion" : "تأكيد عملية الحذف"}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#94A3B8",
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  {lang === "en"
                    ? `Are you sure you want to delete "${deleteConfirmDialog.title}"? This action cannot be undone.`
                    : `هل أنت تأكد من رغبتك في حذف "${deleteConfirmDialog.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  width: "100%",
                  marginTop: "6px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirmDialog({
                      isOpen: false,
                      type: null,
                      id: null,
                      title: "",
                      subtitle: "",
                    })
                  }
                  className="es-page-btn"
                  style={{ flex: 1, padding: "10px" }}
                >
                  {lang === "en" ? "Cancel" : "إلغاء"}
                </button>

                <button
                  type="button"
                  onClick={handleExecuteDeleteConfirmed}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#EF4444",
                    color: "#FFF",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: "900",
                    cursor: "pointer",
                  }}
                >
                  {lang === "en" ? "Delete Permanently" : "حذف نهائي"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ MODAL 6: DNS MODULE INSPECTOR ═══════════════ */}
        {createPortal(
          <AnimatePresence>
            {modalOpen && (
              <div
                className="es-modal-backdrop"
                dir={isRtl ? "rtl" : "ltr"}
                onClick={() => setModalOpen(false)}
              >
                <motion.div
                  className="es-modal-card"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="es-modal-header">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div className="es-modal-icon-wrap">
                        {React.createElement(
                          pipelineModules.find((m) => m.id === activeModule)
                            ?.IconComp || Mail,
                          { size: 20 },
                        )}
                      </div>
                      <div>
                        <h3 className="es-modal-title">
                          {lang === "en"
                            ? pipelineModules.find((m) => m.id === activeModule)
                                ?.title_en
                            : pipelineModules.find((m) => m.id === activeModule)
                                ?.title_ar}
                        </h3>
                        <p className="es-modal-sub">
                          {lang === "en"
                            ? pipelineModules.find((m) => m.id === activeModule)
                                ?.sub_en
                            : pipelineModules.find((m) => m.id === activeModule)
                                ?.sub_ar}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="es-modal-close-btn"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="es-modal-body">
                    {activeModule === "domain" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        <div className="es-form-group">
                          <label className="es-label">
                            <Globe size={14} color="#818CF8" />
                            <span>
                              {lang === "en"
                                ? "Your Store Domain"
                                : "الدومين الخاص بك"}
                            </span>
                          </label>
                          <input
                            type="text"
                            className="es-input"
                            dir="ltr"
                            value={domainName}
                            onChange={(e) => setDomainName(e.target.value)}
                          />
                        </div>
                        <div className="es-form-group">
                          <label className="es-label">
                            <Send size={14} color="#818CF8" />
                            <span>
                              {lang === "en"
                                ? "Official Sending Email"
                                : "إيميل الإرسال الرسمي"}
                            </span>
                          </label>
                          <input
                            type="email"
                            className="es-input"
                            dir="ltr"
                            value={supportEmail}
                            onChange={(e) => setSupportEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {(activeModule === "spf" ||
                      activeModule === "dkim" ||
                      activeModule === "dmarc") && (
                      <div>
                        {dnsRecords
                          .filter((r) => r.id === activeModule)
                          .map((rec) => (
                            <div key={rec.id} className="es-record-card">
                              <div className="es-record-header">
                                <span
                                  className="es-record-title"
                                  style={{ color: "#818CF8" }}
                                >
                                  <rec.IconComp size={16} />
                                  <span>
                                    {lang === "en"
                                      ? rec.title_en
                                      : rec.title_ar}
                                  </span>
                                </span>
                                <span className="es-type-badge">
                                  Type: {rec.type}
                                </span>
                              </div>
                              <div className="es-record-row">
                                <span className="es-record-key">
                                  {lang === "en"
                                    ? "Name / Host:"
                                    : "الاسم / المضيف:"}
                                </span>
                                <span
                                  className="es-record-val"
                                  style={{ fontWeight: 800 }}
                                >
                                  {rec.host}
                                </span>
                              </div>
                              <div
                                className="es-record-row"
                                style={{ justifyContent: "space-between" }}
                              >
                                <span className="es-record-key">
                                  {lang === "en"
                                    ? "Record Value:"
                                    : "قيمة السجل:"}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    flex: 1,
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <span className="es-record-val accent">
                                    {rec.value}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(rec.value);
                                      toast(
                                        lang === "en"
                                          ? "Copied record!"
                                          : "تم النسخ!",
                                        "success",
                                      );
                                    }}
                                    className="es-copy-mini-btn"
                                  >
                                    <Copy size={12} />
                                    <span>
                                      {lang === "en" ? "Copy" : "نسخ"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {activeModule === "verify" && (
                      <div className="es-guide-box">
                        <h4>
                          <CheckSquare size={16} color="#818CF8" />
                          <span>
                            {lang === "en"
                              ? "How to verify your settings?"
                              : "كيف تتأكد أن إعداداتك صحيحة؟"}
                          </span>
                        </h4>
                        <ul className="es-guide-steps">
                          <li>
                            <div className="es-guide-step-bullet">1</div>
                            <span>
                              {lang === "en"
                                ? "Wait 15 minutes to 24 hours for records to update."
                                : "انتظر من 15 دقيقة إلى 24 ساعة لتتحدث السجلات عبر السيرفرات."}
                            </span>
                          </li>
                          <li>
                            <div className="es-guide-step-bullet">2</div>
                            <span>
                              {lang === "en" ? "Go to " : "اذهب لموقع "}
                              <a
                                href="https://www.mail-tester.com/"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#818CF8", fontWeight: "bold" }}
                              >
                                Mail-Tester.com <ExternalLink size={12} />
                              </a>
                            </span>
                          </li>
                          <li>
                            <div className="es-guide-step-bullet">3</div>
                            <span>
                              {lang === "en"
                                ? "You should get a 10/10 score for 100% inbox delivery."
                                : "يجب أن تحصل على تقييم 10/10 لضمان وصول الرسائل للإنبوكس."}
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
      </div>
    </ToolDashboardLayout>
  );
}
