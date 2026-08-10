const fs = require('fs');

const datePickerCode = `import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "../context/StateContext";

interface DatePickerProps {
  value: string; // ISO date string "YYYY-MM-DD" or range "YYYY-MM-DD_to_YYYY-MM-DD" or empty
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  mode?: "single" | "range" | "both";
}

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const DAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_AR = ["أح", "ثن", "ثل", "أر", "خم", "جم", "سب"];

export default function DatePicker({
  value,
  onChange,
  placeholder,
  label,
  className = "",
  mode = "single",
}: DatePickerProps) {
  const { state } = useAppState();
  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0 });

  // Range-specific states
  const [rangeMode, setRangeMode] = useState(mode === "range" || (mode === "both" && value.includes("_to_")));
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // Update fixed positioning coordinates
  useEffect(() => {
    const updateCoords = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = 360; // Slightly larger to accommodate range tabs
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let top = rect.bottom + 6;
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          top = rect.top - dropdownHeight - 6;
        }

        setCoords({
          top: top,
          left: rect.left,
          right: window.innerWidth - rect.right,
        });
      }
    };
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  // Sync state with value prop
  useEffect(() => {
    if (value) {
      if (value.includes("_to_")) {
        const [start, end] = value.split("_to_");
        setTempStartDate(start);
        setTempEndDate(end);
        if (mode === "both") setRangeMode(true);
      } else {
        setTempStartDate(value);
        setTempEndDate("");
        if (mode === "both") setRangeMode(false);
      }
    } else {
      setTempStartDate("");
      setTempEndDate("");
    }
  }, [value, mode]);

  // Parse initial date or default to today
  const initialDateStr = value ? (value.includes("_to_") ? value.split("_to_")[0] : value) : "";
  const initialDate = initialDateStr ? new Date(initialDateStr) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDaySelect = (dayNum: number) => {
    const selected = new Date(currentYear, currentMonth, dayNum);
    const offset = selected.getTimezoneOffset();
    const formatted = new Date(selected.getTime() - offset * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (rangeMode) {
      if (!tempStartDate || (tempStartDate && tempEndDate)) {
        setTempStartDate(formatted);
        setTempEndDate("");
      } else {
        if (formatted >= tempStartDate) {
          setTempEndDate(formatted);
          onChange(\`\${tempStartDate}_to_\${formatted}\`);
          setIsOpen(false);
        } else {
          setTempStartDate(formatted);
          setTempEndDate("");
        }
      }
    } else {
      setTempStartDate(formatted);
      setTempEndDate("");
      onChange(formatted);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setTempStartDate("");
    setTempEndDate("");
  };

  const days = daysInMonth(currentYear, currentMonth);
  const startOffset = startDayOfMonth(currentYear, currentMonth);

  const calendarGrid = [];
  for (let i = 0; i < startOffset; i++) {
    calendarGrid.push(null);
  }
  for (let d = 1; d <= days; d++) {
    calendarGrid.push(d);
  }

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    if (isRtl) {
      return \`\${d.getDate()} \${MONTHS_AR[d.getMonth()]} \${d.getFullYear()}\`;
    } else {
      return \`\${d.getDate()} \${MONTHS_EN[d.getMonth()]} \${d.getFullYear()}\`;
    }
  };

  // Formatting display value
  const getDisplayValue = () => {
    if (!value) return placeholder || t("اختر التاريخ", "Select date");
    if (value.includes("_to_")) {
      const [start, end] = value.split("_to_");
      return \`\${formatDateDisplay(start)} \${t("إلى", "to")} \${formatDateDisplay(end)}\`;
    }
    return formatDateDisplay(value);
  };

  const months = isRtl ? MONTHS_AR : MONTHS_EN;
  const weekdays = isRtl ? DAYS_AR : DAYS_EN;

  return (
    <div ref={containerRef} className={\`relative flex flex-col \${className}\`} dir={isRtl ? "rtl" : "ltr"}>
      {label && (
        <span className="text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5 block">
          {label}
        </span>
      )}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-550/5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-700 focus:ring-2 focus:ring-purple-500/50"
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <span className={\`truncate font-medium \${!value ? "text-slate-400" : ""}\`}>
            {getDisplayValue()}
          </span>
        </div>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[999999] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 w-72"
              style={{
                top: \`\${coords.top}px\`,
                ...(isRtl ? { right: \`\${coords.right}px\` } : { left: \`\${coords.left}px\` }),
              }}
            >
              {/* mode === "both" Tabs Selector */}
              {mode === "both" && (
                <div className="flex gap-2 mb-3 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setRangeMode(false);
                      setTempEndDate("");
                      if (tempStartDate && tempEndDate) {
                        // Keep start date as single selection
                        onChange(tempStartDate);
                      }
                    }}
                    className={\`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg transition \${
                      !rangeMode
                        ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }\`}
                  >
                    {t("يوم محدد", "Single Date")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRangeMode(true);
                      if (tempStartDate && !tempEndDate) {
                        // Start range selection with current start date
                        setTempEndDate("");
                      }
                    }}
                    className={\`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg transition \${
                      rangeMode
                        ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }\`}
                  >
                    {t("فترة من - إلى", "Date Range")}
                  </button>
                </div>
              )}

              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-3" dir="ltr">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-750 dark:hover:text-slate-300 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  <select
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 border-0 outline-none cursor-pointer focus:ring-0 py-0.5 px-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                  >
                    {months.map((name, index) => (
                      <option key={index} value={index} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs">
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 border-0 outline-none cursor-pointer focus:ring-0 py-0.5 px-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                  >
                    {Array.from({ length: 41 }, (_, i) => {
                      const startYear = new Date().getFullYear() - 20;
                      return startYear + i;
                    }).map((y) => (
                      <option key={y} value={y} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-750 dark:hover:text-slate-300 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {weekdays.map((day, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase py-1"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarGrid.map((day, idx) => {
                  if (day === null) {
                    return <div key={\`empty-\${idx}\`} className="h-8 w-8" />;
                  }

                  const selectedDate = new Date(currentYear, currentMonth, day);
                  const offset = selectedDate.getTimezoneOffset();
                  const dayDateStr = new Date(selectedDate.getTime() - offset * 60 * 1000)
                    .toISOString()
                    .split("T")[0];

                  let isSelected = false;
                  let isInRange = false;
                  let isRangeStart = false;
                  let isRangeEnd = false;

                  if (rangeMode) {
                    if (tempStartDate && tempEndDate) {
                      isRangeStart = dayDateStr === tempStartDate;
                      isRangeEnd = dayDateStr === tempEndDate;
                      isInRange = dayDateStr > tempStartDate && dayDateStr < tempEndDate;
                      isSelected = isRangeStart || isRangeEnd;
                    } else if (tempStartDate) {
                      isSelected = dayDateStr === tempStartDate;
                      isRangeStart = isSelected;
                    }
                  } else {
                    isSelected = tempStartDate ? dayDateStr === tempStartDate : false;
                  }

                  const isToday =
                    new Date().getFullYear() === currentYear &&
                    new Date().getMonth() === currentMonth &&
                    new Date().getDate() === day;

                  return (
                    <button
                      key={\`day-\${day}\`}
                      type="button"
                      onClick={() => handleDaySelect(day)}
                      className={\`h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all \${
                        isRangeStart
                          ? "bg-purple-600 text-white rounded-l-lg rounded-r-none shadow-md"
                          : isRangeEnd
                            ? "bg-purple-600 text-white rounded-r-lg rounded-l-none shadow-md"
                            : isInRange
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-none"
                              : isSelected
                                ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                                : isToday
                                  ? "bg-purple-550/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                      }\`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Reset/Clear Button */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setTempStartDate("");
                    setTempEndDate("");
                    setIsOpen(false);
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition"
                >
                  {t("إعادة تعيين", "Reset")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
`;

fs.writeFileSync('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\components\\DatePicker.tsx', datePickerCode, 'utf8');
console.log('Successfully upgraded DatePicker.tsx');
