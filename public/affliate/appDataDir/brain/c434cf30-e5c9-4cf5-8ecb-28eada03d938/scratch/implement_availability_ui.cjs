const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

// 1. Insert formatTo12Hour, timeOptions15 and TimePickerInput component before // ---------- Main Component ----------
const targetPositionStr = `// ---------- Main Component ----------`;

const timePickerCode = `const formatTo12Hour = (time24: string) => {
  if (!time24) return "";
  const [hourStr, minStr] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return \`\${displayHour}:\${minStr} \${ampm}\`;
};

const timeOptions15: { value: string; label: string }[] = [];
for (let hour = 0; hour < 24; hour++) {
  for (let min of ["00", "15", "30", "45"]) {
    const hh = String(hour).padStart(2, "0");
    const val = \`\${hh}:\${min}\`;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const label = \`\${displayHour}:\${min} \${ampm}\`;
    timeOptions15.push({ value: val, label });
  }
}

interface TimePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
}

function TimePickerInput({ value, onChange, disabled = false, className = "" }: TimePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center" });
    }
  }, [isOpen]);

  const displayLabel = formatTo12Hour(value) || value;

  return (
    <div ref={containerRef} className={\`relative \${className}\`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-700 dark:text-slate-200 text-center font-bold hover:border-purple-300 dark:hover:border-purple-700 disabled:opacity-50 transition cursor-pointer"
      >
        {displayLabel}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-32 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto p-1 py-1.5">
          {timeOptions15.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                ref={isSelected ? activeRef : undefined}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={\`w-full text-center px-2 py-1 text-[10px] font-bold rounded-lg transition-all \${
                  isSelected
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                }\`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

`;

if (!content.includes('function TimePickerInput')) {
  content = content.replace(targetPositionStr, timePickerCode.split('\n').join(nl) + targetPositionStr);
  console.log('Inserted TimePickerInput component.');
} else {
  console.log('TimePickerInput already exists.');
}

// 2. Insert helper functions inside the BookingSection component
const insideComponentStr = `const { state, updateState, fmtMoney } = useAppState();`;
const helperFunctionsCode = `  const getCurrentPreset = () => {
    const enabledDays = calendarAvailability.filter((d) => d.enabled).map((d) => d.day);
    if (enabledDays.length === 7) return "Every day";
    if (
      enabledDays.length === 5 &&
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].every((d) => enabledDays.includes(d))
    ) {
      return "Mon - Fri";
    }
    if (
      enabledDays.length === 2 &&
      ["Saturday", "Sunday"].every((d) => enabledDays.includes(d))
    ) {
      return "Sat - Sun";
    }
    if (enabledDays.length === 1) {
      return enabledDays[0];
    }
    return "";
  };

  const applyDayPreset = (preset: string) => {
    setCalendarAvailability((prev) => {
      return prev.map((dayItem) => {
        let enabled = false;
        if (preset === "Every day") {
          enabled = true;
        } else if (preset === "Mon - Fri") {
          enabled = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(dayItem.day);
        } else if (preset === "Sat - Sun") {
          enabled = ["Saturday", "Sunday"].includes(dayItem.day);
        } else {
          enabled = dayItem.day === preset;
        }
        return { ...dayItem, enabled };
      });
    });
  };

  const presetOptions = [
    { value: "Every day", label: translateText("كل يوم", "Every day") },
    { value: "Mon - Fri", label: translateText("من الإثنين إلى الجمعة", "Mon - Fri") },
    { value: "Sat - Sun", label: translateText("السبت والأحد", "Sat - Sun") },
    { value: "Monday", label: translateText("الإثنين", "Monday") },
    { value: "Tuesday", label: translateText("الثلاثاء", "Tuesday") },
    { value: "Wednesday", label: translateText("الأربعاء", "Wednesday") },
    { value: "Thursday", label: translateText("الخميس", "Thursday") },
    { value: "Friday", label: translateText("الجمعة", "Friday") },
    { value: "Saturday", label: translateText("السبت", "Saturday") },
    { value: "Sunday", label: translateText("الأحد", "Sunday") },
  ];`;

if (!content.includes('const getCurrentPreset =')) {
  content = content.replace(insideComponentStr, insideComponentStr + nl + helperFunctionsCode.split('\n').join(nl));
  console.log('Inserted helper functions inside component.');
} else {
  console.log('Helper functions already exist.');
}

// 3. Replace the Availability Accordion content
// We construct the old accordion content block exactly as seen in our file read:
const oldAccordionContent = `                  {openAccordionSection === "availability" && (
                    <div className="px-4 pb-4 space-y-4">
                      {dayOrder.map((day) => {
                        const availability = calendarAvailability.find((item) => item.day === day);
                        return (
                          <div key={day} className="flex items-center gap-3">
                            <label className="flex items-center gap-2 w-24">
                              <input
                                type="checkbox"
                                checked={availability?.enabled || false}
                                onChange={(event) => {
                                  setCalendarAvailability((previous) =>
                                    previous.map((item) =>
                                      item.day === day
                                        ? { ...item, enabled: event.target.checked }
                                        : item,
                                    ),
                                  );
                                }}
                                className="rounded"
                              />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {dayLabels[day as keyof typeof dayLabels]}
                              </span>
                            </label>
                            <CustomSelect
                              value={availability?.start || "10:00"}
                              onChange={(val) => {
                                setCalendarAvailability((previous) =>
                                  previous.map((item) =>
                                    item.day === day ? { ...item, start: val as string } : item,
                                  ),
                                );
                              }}
                              options={timeOptions}
                              disabled={!availability?.enabled}
                              className="w-32"
                            />
                            <span className="text-slate-400 text-sm">—</span>
                            <CustomSelect
                              value={availability?.end || "18:00"}
                              onChange={(val) => {
                                setCalendarAvailability((previous) =>
                                  previous.map((item) =>
                                    item.day === day ? { ...item, end: val as string } : item,
                                  ),
                                );
                              }}
                              options={timeOptions}
                              disabled={!availability?.enabled}
                              className="w-32"
                            />
                          </div>
                        );
                      })}

                      {/* Additional Weekday Hours */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                          {translateText(
                            "ساعات عمل إضافية لأيام الأسبوع",
                            "Additional Weekday Hours",
                          )}
                        </h4>
                        {additionalWeekdayAvailability.map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex flex-wrap items-center gap-2 mb-2 bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800"
                          >
                            <CustomSelect
                              value={item.day}
                              onChange={(val) => {
                                const updated = [...additionalWeekdayAvailability];
                                updated[idx].day = val as string;
                                setAdditionalWeekdayAvailability(updated);
                              }}
                              options={dayOrder.map((d) => ({
                                value: d,
                                label: dayLabels[d as keyof typeof dayLabels],
                              }))}
                              className="w-40"
                            />
                            <div className="flex items-center gap-2">
                              <CustomSelect
                                value={item.start}
                                onChange={(val) => {
                                  const updated = [...additionalWeekdayAvailability];
                                  updated[idx].start = val as string;
                                  setAdditionalWeekdayAvailability(updated);
                                }}
                                options={timeOptions}
                                className="w-32"
                              />
                              <span className="text-slate-400">—</span>
                              <CustomSelect
                                value={item.end}
                                onChange={(val) => {
                                  const updated = [...additionalWeekdayAvailability];
                                  updated[idx].end = val as string;
                                  setAdditionalWeekdayAvailability(updated);
                                }}
                                options={timeOptions}
                                className="w-32"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setAdditionalWeekdayAvailability(
                                  additionalWeekdayAvailability.filter((_, i) => i !== idx),
                                )
                              }
                              className="text-red-450 hover:text-red-650 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition ml-auto"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setAdditionalWeekdayAvailability([
                              ...additionalWeekdayAvailability,
                              {
                                id: Date.now() + Math.random(),
                                day: "Sunday",
                                start: "09:00",
                                end: "17:00",
                              },
                            ]);
                          }}
                          className="w-full py-2 border border-dashed border-slate-350 dark:border-slate-800 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition mt-1"
                        >
                          + {translateText("إضافة ساعات لأيام الأسبوع", "Add weekday hours")}
                        </button>
                      </div>

                      {/* Specific Date overrides */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                          {translateText("أوقات عمل لتاريخ محدد", "Specific Date Hours")}
                        </h4>
                        {specificDateAvailability.map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex flex-wrap items-center gap-2 mb-2 bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800"
                          >
                            <DatePicker
                              value={item.date}
                              onChange={(val) => {
                                const updated = [...specificDateAvailability];
                                updated[idx].date = val;
                                setSpecificDateAvailability(updated);
                              }}
                              placeholder={translateText("اختر التاريخ", "Select Date")}
                              className="w-44"
                            />
                            <div className="flex items-center gap-2">
                              <CustomSelect
                                value={item.start}
                                onChange={(val) => {
                                  const updated = [...specificDateAvailability];
                                  updated[idx].start = val as string;
                                  setSpecificDateAvailability(updated);
                                }}
                                options={timeOptions}
                                className="w-32"
                              />
                              <span className="text-slate-400">—</span>
                              <CustomSelect
                                value={item.end}
                                onChange={(val) => {
                                  const updated = [...specificDateAvailability];
                                  updated[idx].end = val as string;
                                  setSpecificDateAvailability(updated);
                                }}
                                options={timeOptions}
                                className="w-32"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setSpecificDateAvailability(
                                  specificDateAvailability.filter((_, i) => i !== idx),
                                )
                              }
                              className="text-red-450 hover:text-red-650 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition ml-auto"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            const dateStr = tomorrow.toISOString().split("T")[0];
                            setSpecificDateAvailability([
                              ...specificDateAvailability,
                              {
                                id: Date.now() + Math.random(),
                                date: dateStr,
                                start: "09:00",
                                end: "17:00",
                              },
                            ]);
                          }}
                          className="w-full py-2 border border-dashed border-slate-350 dark:border-slate-800 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition mt-1"
                        >
                          + {translateText("إضافة أوقات لتاريخ محدد", "Add specific date hours")}
                        </button>
                      </div>`;

const newAccordionContent = `                  {openAccordionSection === "availability" && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* 1. Day Availability Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350">
                          {translateText("أيام العمل المتاحة", "Day Availability")}
                        </label>
                        <CustomSelect
                          value={getCurrentPreset()}
                          onChange={(val) => applyDayPreset(val as string)}
                          options={presetOptions}
                          className="w-full"
                        />
                      </div>

                      {/* 2. Weekday Rows */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-750 dark:text-slate-300 mb-3 uppercase tracking-wide">
                          {translateText("ساعات العمل لأيام الأسبوع", "Weekday Hours")}
                        </h4>
                        <div className="space-y-2.5">
                          {weekdayAvailability.map((item, idx) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/30 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800"
                            >
                              <CustomSelect
                                value={item.day}
                                onChange={(val) => {
                                  const updated = [...weekdayAvailability];
                                  updated[idx].day = val as string;
                                  setWeekdayAvailability(updated);
                                }}
                                options={presetOptions}
                                className="w-40"
                              />
                              <div className="flex items-center gap-2">
                                <TimePickerInput
                                  value={item.start}
                                  onChange={(val) => {
                                    const updated = [...weekdayAvailability];
                                    updated[idx].start = val;
                                    setWeekdayAvailability(updated);
                                  }}
                                />
                                <span className="text-slate-400 text-sm">—</span>
                                <TimePickerInput
                                  value={item.end}
                                  onChange={(val) => {
                                    const updated = [...weekdayAvailability];
                                    updated[idx].end = val;
                                    setWeekdayAvailability(updated);
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setWeekdayAvailability(
                                    weekdayAvailability.filter((_, i) => i !== idx)
                                  );
                                }}
                                className="text-red-450 hover:text-red-650 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition ml-auto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setWeekdayAvailability([
                              ...weekdayAvailability,
                              {
                                id: Date.now() + Math.random(),
                                day: "Every day",
                                start: "09:00",
                                end: "17:00",
                              },
                            ]);
                          }}
                          className="w-full py-2.5 border border-dashed border-slate-350 dark:border-slate-800 rounded-xl text-xs font-bold text-purple-650 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition mt-3 flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          {translateText("إضافة ساعات لأيام الأسبوع", "Add weekday hours")}
                        </button>
                      </div>

                      {/* 3. Specific Date Rows */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-750 dark:text-slate-300 mb-3 uppercase tracking-wide">
                          {translateText("أوقات عمل لتاريخ محدد", "Specific Date Hours")}
                        </h4>
                        <div className="space-y-2.5">
                          {specificDateAvailability.map((item, idx) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/30 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800"
                            >
                              <DatePicker
                                value={item.date}
                                mode="both"
                                onChange={(val) => {
                                  const updated = [...specificDateAvailability];
                                  updated[idx].date = val;
                                  setSpecificDateAvailability(updated);
                                }}
                                placeholder={translateText("اختر التاريخ", "Select Date")}
                                className="w-48"
                              />
                              <div className="flex items-center gap-2">
                                <TimePickerInput
                                  value={item.start}
                                  onChange={(val) => {
                                    const updated = [...specificDateAvailability];
                                    updated[idx].start = val;
                                    setSpecificDateAvailability(updated);
                                  }}
                                />
                                <span className="text-slate-400 text-sm">—</span>
                                <TimePickerInput
                                  value={item.end}
                                  onChange={(val) => {
                                    const updated = [...specificDateAvailability];
                                    updated[idx].end = val;
                                    setSpecificDateAvailability(updated);
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSpecificDateAvailability(
                                    specificDateAvailability.filter((_, i) => i !== idx)
                                  );
                                }}
                                className="text-red-450 hover:text-red-650 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition ml-auto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            const dateStr = tomorrow.toISOString().split("T")[0];
                            setSpecificDateAvailability([
                              ...specificDateAvailability,
                              {
                                id: Date.now() + Math.random(),
                                date: dateStr,
                                start: "09:00",
                                end: "17:00",
                              },
                            ]);
                          }}
                          className="w-full py-2.5 border border-dashed border-slate-350 dark:border-slate-800 rounded-xl text-xs font-bold text-purple-650 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition mt-3 flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          {translateText("إضافة تاريخ محدد", "Add specific date")}
                        </button>
                      </div>`;

const targetBlock = oldAccordionContent.split('\n').map(l => l.trimEnd()).join(nl);
const replacementBlock = newAccordionContent.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(targetBlock)) {
  content = content.replace(targetBlock, replacementBlock);
  console.log('Replaced availability accordion content block successfully.');
} else {
  // Let's try normalized line replacements
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = oldAccordionContent.split('\n').map(l => l.trimEnd()).join('\n');
  if (normContent.includes(normTarget)) {
    const startIdx = normContent.indexOf(normTarget);
    const lines = content.split(/\r?\n/);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    lines.splice(startLineIdx, blockLinesCount, ...newAccordionContent.split('\n').map(l => l.trimEnd()));
    content = lines.join(nl);
    console.log('Replaced availability accordion content block successfully (normalized approach).');
  } else {
    console.log('Target availability accordion content block NOT found!');
  }
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
