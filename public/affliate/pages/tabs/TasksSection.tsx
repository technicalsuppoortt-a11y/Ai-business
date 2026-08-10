import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAppState } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Filter,
  Tag,
  Activity,
  Search,
  ClipboardList,
  ChevronDown,
  X,
  Check,
  FileSearch,
} from "lucide-react";
import { toast } from "sonner";
import DatePicker from "../../components/DatePicker";

// ---------- Custom Select Component ----------
interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const isRtl = document.documentElement.dir === "rtl";

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = Math.min(240, options.length * 40 + 20);
      const showUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      setCoords({
        top: showUpward ? rect.top - dropdownHeight - 4 : rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const handleToggle = () => {
    updateCoords();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", updateCoords, true);
    }
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portalDropdown = document.getElementById("portal-dropdown-menu-task");
        if (portalDropdown && portalDropdown.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-650 focus:ring-2 focus:ring-indigo-500/50"
        style={{ textAlign: isRtl ? "right" : "left" }}
      >
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="flex-1 truncate">{selectedOption?.label || placeholder || "اختر"}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[99998] bg-transparent cursor-default"
              onClick={() => setIsOpen(false)}
            />
            <div
              id="portal-dropdown-menu-task"
              className="fixed z-[99999] mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-y-auto py-1"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
                maxHeight: "240px",
              }}
            >
              <ul className="py-1.5 custom-scroll">
                {options.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition flex items-center gap-2 ${
                      option.value === value
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                    style={{ textAlign: isRtl ? "right" : "left" }}
                  >
                    {option.icon && <span className="text-slate-400">{option.icon}</span>}
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.value === value && (
                      <Check className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

interface TasksSectionProps {
  searchQuery?: string;
}

export default function TasksSection({ searchQuery: propSearchQuery = "" }: TasksSectionProps) {
  const { state, updateState } = useAppState();
  const { users, userProfile } = useAuth();
  const isAdmin = userProfile?.role === "admin";

  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const searchQuery = propSearchQuery || localSearchQuery;
  const setSearchQuery = setLocalSearchQuery;

  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "In_Progress" | "Under_Review" | "Completed">(
    "all",
  );
  const [partnerFilter, setPartnerFilter] = useState<string>("all");

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const partners = useMemo(() => {
    return (users || []).filter((u: any) => u.role !== "admin");
  }, [users]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState<"Pending" | "In_Progress" | "Under_Review" | "Completed">("Pending");
  const [dueDate, setDueDate] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");

  // Table Revision Popup Modal state
  const [inlineRevisionModal, setInlineRevisionModal] = useState<{
    task: any;
    targetStatus: "Pending" | "In_Progress" | "Under_Review" | "Completed";
  } | null>(null);
  const [inlineRevisionNote, setInlineRevisionNote] = useState("");

  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  // Safe list of tasks
  const tasks = state.tasks || [];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    if (statusFilter !== "all") {
      list = list.filter((task) => task.status === statusFilter);
    }

    if (partnerFilter !== "all") {
      list = list.filter((task) => task.assignedTo === partnerFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (task) =>
          (task.title || "").toLowerCase().includes(q) ||
          (task.description || "").toLowerCase().includes(q),
      );
    }

    // Sort by createdAt descending
    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [tasks, searchQuery, statusFilter, partnerFilter]);

  // Status stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const inProgress = tasks.filter((t) => t.status === "In_Progress").length;
    const underReview = tasks.filter((t) => t.status === "Under_Review").length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    return { total, pending, inProgress, underReview, completed };
  }, [tasks]);

  const getPartnerName = (userId: string) => {
    const p = partners.find((part) => part.uid === userId);
    if (p) return p.name;
    const u = users.find((user) => user.uid === userId);
    return u ? u.name : userId || t("غير معين", "Unassigned");
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setAssignedTo(partners[0]?.uid || "");
    setStatus("Pending");
    setDueDate(new Date().toLocaleDateString("en-CA"));
    setRejectionNote("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: any) => {
    setEditingTask(task);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setAssignedTo(task.assignedTo || "");
    setStatus(task.status || "Pending");
    setDueDate(task.dueDate || "");
    setRejectionNote(task.rejectionNote || "");
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t("الرجاء إدخال عنوان المهمة", "Please enter task title"));
      return;
    }

    try {
      if (editingTask) {
        // Edit mode
        const updated: any = {
          ...editingTask,
          title: title.trim(),
          description: description.trim(),
          assignedTo,
          status,
          dueDate,
        };
        if (rejectionNote.trim()) {
          updated.rejectionNote = rejectionNote.trim();
        } else {
          delete updated.rejectionNote;
        }

        await updateState((draft) => {
          if (!draft.tasks) draft.tasks = [];
          const idx = draft.tasks.findIndex((tk) => tk.id === editingTask.id);
          if (idx !== -1) {
            draft.tasks[idx] = updated;
          }
        });
        toast.success(t("تم تحديث المهمة بنجاح", "Task updated successfully"));
      } else {
        // Create mode - Initial status must strictly be set to "Pending"
        const newId = `task-${Date.now()}`;
        const newTask: any = {
          id: newId,
          title: title.trim(),
          description: description.trim(),
          assignedTo,
          status: "Pending" as const,
          dueDate,
          createdAt: new Date().toISOString(),
        };
        if (rejectionNote.trim()) {
          newTask.rejectionNote = rejectionNote.trim();
        }

        await updateState((draft) => {
          if (!draft.tasks) draft.tasks = [];
          draft.tasks.push(newTask);
        });
        toast.success(t("تم إضافة المهمة بنجاح", "Task created successfully"));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(t("حدث خطأ أثناء حفظ المهمة", "Error saving task"));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setDeleteConfirmId(taskId);
  };

  const confirmDeleteTask = async () => {
    if (!deleteConfirmId) return;
    try {
      await updateState((draft) => {
        draft.tasks = (draft.tasks || []).filter((tk) => tk.id !== deleteConfirmId);
      });
      toast.success(t("تم حذف المهمة بنجاح", "Task deleted successfully"));
    } catch (err) {
      console.error(err);
      toast.error(t("حدث خطأ أثناء الحذف", "Error deleting task"));
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const getStatusBadge = (taskStatus: string) => {
    const configs: Record<string, { label: string; className: string; icon: any }> = {
      Pending: {
        label: t("معلق", "Pending"),
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: Clock,
      },
      In_Progress: {
        label: t("قيد التنفيذ", "In Progress"),
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        icon: Activity,
      },
      Under_Review: {
        label: t("تحت المراجعة", "Under Review"),
        className:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
        icon: FileSearch,
      },
      Completed: {
        label: t("مكتمل", "Completed"),
        className:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: CheckCircle,
      },
    };

    const cfg = configs[taskStatus] || configs.Pending;
    const Icon = cfg.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.className}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {cfg.label}
      </span>
    );
  };

  const isPastDue = (dueDateStr: string, taskStatus: string) => {
    if (taskStatus === "Completed" || !dueDateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    return due < today;
  };

  return (
    <div className="space-y-6 pb-12" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-indigo-500" />
            <span>{t("إدارة المهام", "Tasks Management")}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("إنشاء وتعديل وإسناد المهام للشركاء", "Create, edit, and assign tasks to partners")}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t("إضافة مهمة جديدة", "Add New Task")}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            label: t("إجمالي المهام", "Total Tasks"),
            value: stats.total,
            icon: ClipboardList,
            color: "text-slate-500 dark:text-slate-300",
            bg: "bg-slate-100/50 dark:bg-slate-900 border-slate-200 dark:border-slate-850",
          },
          {
            label: t("معلقة", "Pending"),
            value: stats.pending,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
          },
          {
            label: t("قيد التنفيذ", "In Progress"),
            value: stats.inProgress,
            icon: Activity,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          },
          {
            label: t("تحت المراجعة", "Under Review"),
            value: stats.underReview,
            icon: FileSearch,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
          },
          {
            label: t("مكتملة", "Completed"),
            value: stats.completed,
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`border ${stat.bg} rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300`}
          >
            <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-950 ${stat.color} shadow-sm`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("ابحث بالاسم أو التفاصيل...", "Search by title or description...")}
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Status Filter */}
        <CustomSelect
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          options={[
            { value: "all", label: t("كل الحالات", "All Statuses") },
            {
              value: "Pending",
              label: t("معلق", "Pending"),
              icon: <Clock className="w-4 h-4 text-amber-500" />,
            },
            {
              value: "In_Progress",
              label: t("قيد التنفيذ", "In Progress"),
              icon: <Activity className="w-4 h-4 text-blue-500" />,
            },
            {
              value: "Under_Review",
              label: t("تحت المراجعة", "Under Review"),
              icon: <FileSearch className="w-4 h-4 text-purple-500" />,
            },
            {
              value: "Completed",
              label: t("مكتمل", "Completed"),
              icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
            },
          ]}
          icon={<Activity className="w-4 h-4 text-slate-400" />}
          className="min-w-[160px]"
        />

        {/* Partner Filter */}
        <CustomSelect
          value={partnerFilter}
          onChange={(val) => setPartnerFilter(val)}
          options={[
            { value: "all", label: t("كل الشركاء", "All Partners") },
            ...partners.map((partner: any) => ({
              value: partner.uid,
              label: partner.name,
              icon: <User className="w-4 h-4 text-indigo-500" />,
            })),
          ]}
          icon={<User className="w-4 h-4 text-slate-400" />}
          className="min-w-[180px]"
        />
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/80 dark:to-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("المهمة", "Task")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("مسندة إلى", "Assigned To")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("تاريخ الاستحقاق", "Due Date")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("الحالة", "Status")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("الإجراءات", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ClipboardList className="w-10 h-10 text-slate-350" />
                      <span className="text-sm font-medium">
                        {t("لا توجد مهام مطابقة", "No matching tasks found")}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0  dark:hover:bg-slate-850/20 transition duration-200"
                  >
                    <td className="px-4 py-4">
                      <div className="font-bold text-sm text-slate-850 dark:text-white">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-slate-450 dark:text-slate-400 mt-1 line-clamp-2 max-w-md">
                          {task.description}
                        </div>
                      )}
                      {task.rejectionNote && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50 max-w-md">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          <span><strong className="font-bold">{t("ملاحظة المراجعة: ", "Revision Note: ")}</strong>{task.rejectionNote}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {getPartnerName(task.assignedTo)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                          isPastDue(task.dueDate, task.status)
                            ? "text-red-650 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-900"
                            : "text-slate-750 dark:text-slate-300"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {task.dueDate || "—"}
                        {isPastDue(task.dueDate, task.status) && (
                          <span className="text-[10px] uppercase font-black tracking-widest">
                            {t("متأخرة", "OVERDUE")}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {isAdmin ? (
                        <CustomSelect
                          value={task.status}
                          onChange={async (newStatus) => {
                            const isReversion =
                              (task.status === "Completed" && newStatus !== "Completed") ||
                              (task.status === "Under_Review" && (newStatus === "Pending" || newStatus === "In_Progress"));

                            if (isReversion) {
                              setInlineRevisionModal({ task, targetStatus: newStatus as any });
                              setInlineRevisionNote(task.rejectionNote || "");
                              return;
                            }

                            try {
                              await updateState((draft) => {
                                if (!draft.tasks) draft.tasks = [];
                                const item = draft.tasks.find((tk) => tk.id === task.id);
                                if (item) {
                                  item.status = newStatus as any;
                                  if (newStatus === "Completed") {
                                    delete item.rejectionNote;
                                  }
                                }
                              });
                              toast.success(t("تم تحديث حالة المهمة بنجاح", "Task status updated successfully"));
                            } catch (err) {
                              console.error(err);
                              toast.error(t("فشل تحديث حالة المهمة", "Error updating task status"));
                            }
                          }}
                          options={[
                            {
                              value: "Pending",
                              label: t("معلق ⏳", "Pending ⏳"),
                              icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
                            },
                            {
                              value: "In_Progress",
                              label: t("قيد التنفيذ ⚙️", "In Progress ⚙️"),
                              icon: <Activity className="w-3.5 h-3.5 text-blue-500" />,
                            },
                            {
                              value: "Under_Review",
                              label: t("تحت المراجعة 🔍", "Under Review 🔍"),
                              icon: <FileSearch className="w-3.5 h-3.5 text-purple-500" />,
                            },
                            {
                              value: "Completed",
                              label: t("مكتمل ✅", "Completed ✅"),
                              icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
                            },
                          ]}
                          className="min-w-[145px]"
                        />
                      ) : (
                        getStatusBadge(task.status)
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-650 hover:text-blue-700 dark:hover:bg-indigo-950/30 transition cursor-pointer "
                          title={t("تعديل", "Edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer hover:text-red-700"
                          title={t("حذف", "Delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Modal (Add/Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-850 relative z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-500" />
                  <span>
                    {editingTask
                      ? t("تعديل المهمة", "Edit Task")
                      : t("إضافة مهمة جديدة", "Add New Task")}
                  </span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveTask} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {t("العنوان", "Title")}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder={t("أدخل عنوان المهمة...", "Enter task title...")}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {t("الوصف", "Description")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder={t("أدخل تفاصيل المهمة...", "Enter task details...")}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  />
                </div>

                {/* Assign to Partner */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {t("إسناد إلى الشريك", "Assign to Partner")}
                  </label>
                  <CustomSelect
                    value={assignedTo}
                    onChange={(val) => setAssignedTo(val)}
                    options={partners.map((partner: any) => ({
                      value: partner.uid,
                      label: partner.name,
                      icon: <User className="w-4 h-4 text-indigo-500" />,
                    }))}
                    icon={<User className="w-4 h-4 text-slate-400" />}
                  />
                </div>

                {/* Grid for Status and Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {t("الحالة", "Status")}
                    </label>
                    <CustomSelect
                      value={status}
                      onChange={(val) => setStatus(val as any)}
                      options={[
                        {
                          value: "Pending",
                          label: t("معلق ⏳", "Pending ⏳"),
                          icon: <Clock className="w-4 h-4 text-amber-500" />,
                        },
                        {
                          value: "In_Progress",
                          label: t("قيد التنفيذ ⚙️", "In Progress ⚙️"),
                          icon: <Activity className="w-4 h-4 text-blue-500" />,
                        },
                        {
                          value: "Under_Review",
                          label: t("تحت المراجعة 🔍", "Under Review 🔍"),
                          icon: <FileSearch className="w-4 h-4 text-purple-500" />,
                        },
                        ...(isAdmin
                          ? [
                              {
                                value: "Completed",
                                label: t("مكتمل ✅", "Completed ✅"),
                                icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
                              },
                            ]
                          : []),
                      ]}
                      icon={<Activity className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {t("تاريخ الاستحقاق", "Due Date")}
                    </label>
                    <DatePicker
                      value={dueDate}
                      onChange={(val) => setDueDate(val)}
                      className="w-full font-semibold"
                    />
                  </div>
                </div>

                {/* Rejection / Revision Note Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t("ملاحظات التعديل / المراجعة (اختياري)", "Revision / Rejection Notes (Optional)")}</span>
                  </label>
                  <textarea
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    rows={2}
                    placeholder={t("أدخل أي ملاحظات للشريك في حال إرجاع المهمة...", "Enter notes for partner when sending back task...")}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition"
                  >
                    {editingTask ? t("تحديث", "Update") : t("حفظ", "Save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-850 relative z-10 overflow-hidden p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-base font-bold text-slate-850 dark:text-white mb-2">
                  {t("حذف المهمة", "Delete Task")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  {t(
                    "هل أنت متأكد من حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء.",
                    "Are you sure you want to delete this task? This action cannot be undone.",
                  )}
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 px-4 py-2 text-xs font-semibold text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-200 dark:border-slate-800"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteTask}
                    className="flex-1 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition"
                  >
                    {t("حذف", "Delete")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Revision Notes Popup Modal for Table Status Reversions */}
      <AnimatePresence>
        {inlineRevisionModal && (
          <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInlineRevisionModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-850 relative z-10 overflow-hidden p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span>{t("ملاحظات التعديل / المراجعة (اختياري)", "Revision / Rejection Notes (Optional)")}</span>
                </h3>
                <button
                  onClick={() => setInlineRevisionModal(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t(
                    `أنت تقوم بإرجاع المهمة "${inlineRevisionModal.task.title}" إلى حالة (${inlineRevisionModal.targetStatus === "Pending" ? "معلق ⏳" : inlineRevisionModal.targetStatus === "In_Progress" ? "قيد التنفيذ ⚙️" : "تحت المراجعة 🔍"}). يمكنك إضافة ملاحظات للشريك:`,
                    `You are returning task "${inlineRevisionModal.task.title}" back to status (${inlineRevisionModal.targetStatus}). Optional notes for partner:`
                  )}
                </p>
                <textarea
                  value={inlineRevisionNote}
                  onChange={(e) => setInlineRevisionNote(e.target.value)}
                  rows={3}
                  placeholder={t("أدخل سبب التعديل أو الملاحظات المطلوبة...", "Enter revision notes or feedback...")}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setInlineRevisionModal(null)}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                  {t("إلغاء", "Cancel")}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateState((draft) => {
                        if (!draft.tasks) draft.tasks = [];
                        const item = draft.tasks.find((tk) => tk.id === inlineRevisionModal.task.id);
                        if (item) {
                          item.status = inlineRevisionModal.targetStatus as any;
                          if (inlineRevisionNote.trim()) {
                            item.rejectionNote = inlineRevisionNote.trim();
                          } else {
                            delete item.rejectionNote;
                          }
                        }
                      });
                      toast.success(t("تم تحديث حالة المهمة بنجاح", "Task status updated successfully"));
                    } catch (err) {
                      console.error(err);
                      toast.error(t("فشل تحديث حالة المهمة", "Error updating task status"));
                    } finally {
                      setInlineRevisionModal(null);
                    }
                  }}
                  className="flex-1 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  {t("تحديث الحالة", "Update Status")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
