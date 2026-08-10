const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

// 1. Add PlusCircle to imports
if (content.includes('Trash2,') && !content.includes('PlusCircle,')) {
  content = content.replace('Trash2,', 'Trash2, PlusCircle,');
  console.log('Added PlusCircle to imports.');
}

// 2. Add handleDuplicateWeekday and handleDuplicateSpecificDate inside the component
const insertTarget = `  const applyDayPreset = (preset: string) => {
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
  };`;

const duplicateHelpers = `  const handleDuplicateWeekday = (item: WeekdayAvailability) => {
    setWeekdayAvailability([
      ...weekdayAvailability,
      {
        id: Date.now() + Math.random(),
        day: item.day,
        start: item.start,
        end: item.end,
      }
    ]);
  };

  const handleDuplicateSpecificDate = (item: any) => {
    setSpecificDateAvailability([
      ...specificDateAvailability,
      {
        id: Date.now() + Math.random(),
        date: item.date,
        start: item.start,
        end: item.end,
      }
    ]);
  };`;

if (!content.includes('handleDuplicateWeekday')) {
  content = content.replace(insertTarget, insertTarget + nl + duplicateHelpers.split('\n').join(nl));
  console.log('Inserted duplicate helper functions.');
}

// 3. Replace the Accordion availability rendering block
const oldAccordionBlock = `                  {openAccordionSection === "availability" && (
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
                      </div>`.split('\n').map(l => l.trimEnd()).join(nl);

const newAccordionBlock = `                  {openAccordionSection === "availability" && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Weekday Hours */}
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
                              className="w-36"
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
                            <div className="flex items-center gap-1.5 ml-auto">
                              <button
                                type="button"
                                onClick={() => handleDuplicateWeekday(item)}
                                className="text-slate-400 hover:text-slate-650 p-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition"
                                title={translateText("نسخ مكرر", "Duplicate")}
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setWeekdayAvailability(
                                    weekdayAvailability.filter((_, i) => i !== idx)
                                  );
                                }}
                                className="text-red-450 hover:text-red-650 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                                title={translateText("حذف", "Delete")}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Specific Date Hours */}
                      {specificDateAvailability.length > 0 && (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase tracking-wide">
                            {translateText("أوقات عمل لتاريخ محدد", "Specific Date Hours")}
                          </h4>
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
                              <div className="flex items-center gap-1.5 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateSpecificDate(item)}
                                  className="text-slate-400 hover:text-slate-650 p-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition"
                                  title={translateText("نسخ مكرر", "Duplicate")}
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSpecificDateAvailability(
                                      specificDateAvailability.filter((_, i) => i !== idx)
                                    );
                                  }}
                                  className="text-red-450 hover:text-red-650 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                                  title={translateText("حذف", "Delete")}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Buttons Row */}
                      <div className="flex flex-wrap items-center gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setWeekdayAvailability([
                              ...weekdayAvailability,
                              {
                                id: Date.now() + Math.random(),
                                day: "Mon - Fri",
                                start: "09:00",
                                end: "17:00",
                              },
                            ]);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                        >
                          <PlusCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          {translateText("إضافة ساعات لأيام الأسبوع", "Add weekday")}
                        </button>
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
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                        >
                          <PlusCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          {translateText("إضافة تاريخ محدد", "Add specific date")}
                        </button>
                      </div>`;

const targetBlock = oldAccordionBlock;
const replacementBlock = newAccordionBlock.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(targetBlock)) {
  content = content.replace(targetBlock, replacementBlock);
  console.log('Replaced old accordion block.');
} else {
  // Try normalized replacement
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = oldAccordionBlock.replace(/\r\n/g, '\n');
  if (normContent.includes(normTarget)) {
    const startIdx = normContent.indexOf(normTarget);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    const lines = content.split(/\r?\n/);
    lines.splice(startLineIdx, blockLinesCount, ...newAccordionBlock.split('\n').map(l => l.trimEnd()));
    content = lines.join(nl);
    console.log('Replaced old accordion block (normalized approach).');
  } else {
    console.log('Could not find old accordion block to replace!');
  }
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
