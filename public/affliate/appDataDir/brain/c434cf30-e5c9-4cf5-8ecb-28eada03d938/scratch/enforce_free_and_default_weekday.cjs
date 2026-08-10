const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

// 1. Update state initialization for weekdayAvailability
const oldStateInit = `  const [weekdayAvailability, setWeekdayAvailability] = useState<WeekdayAvailability[]>([]);`.split('\n').map(l => l.trimEnd()).join(nl);
const newStateInit = `  const [weekdayAvailability, setWeekdayAvailability] = useState<WeekdayAvailability[]>([
    {
      id: 1,
      day: "Mon - Fri",
      start: "09:00",
      end: "17:00",
    }
  ]);`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldStateInit)) {
  content = content.replace(oldStateInit, newStateInit);
  console.log('Updated weekdayAvailability initial state.');
} else {
  console.log('Could not find weekdayAvailability initial state to update.');
}

// 2. Update reset state function (line 1233)
const oldReset = `    setWeekdayAvailability([]);`.split('\n').map(l => l.trimEnd()).join(nl);
const newReset = `    setWeekdayAvailability([
      {
        id: Date.now() + Math.random(),
        day: "Mon - Fri",
        start: "09:00",
        end: "17:00",
      }
    ]);`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldReset)) {
  content = content.replace(oldReset, newReset);
  console.log('Updated weekdayAvailability reset state.');
}

// 3. Disable weekday delete button if there's only 1 left
const oldDeleteBtn = `                              <button
                                type="button"
                                onClick={() => {
                                  setWeekdayAvailability(
                                    weekdayAvailability.filter((_, i) => i !== idx)
                                  );
                                }}
                                className="text-red-450 hover:text-red-650 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                                title={translateText("حذف", "Delete")}
                              >`.split('\n').map(l => l.trimEnd()).join(nl);

const newDeleteBtn = `                              <button
                                type="button"
                                disabled={weekdayAvailability.length <= 1}
                                onClick={() => {
                                  setWeekdayAvailability(
                                    weekdayAvailability.filter((_, i) => i !== idx)
                                  );
                                }}
                                className="text-red-450 hover:text-red-650 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                                title={translateText("حذف", "Delete")}
                              >`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldDeleteBtn)) {
  content = content.replace(oldDeleteBtn, newDeleteBtn);
  console.log('Disabled weekday delete button for single element.');
} else {
  // Let's do normalized replacement for the delete button
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = oldDeleteBtn.replace(/\r\n/g, '\n');
  if (normContent.includes(normTarget)) {
    const startIdx = normContent.indexOf(normTarget);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    const lines = content.split(/\r?\n/);
    lines.splice(startLineIdx, blockLinesCount, ...newDeleteBtn.split('\n').map(l => l.trimEnd()));
    content = lines.join(nl);
    console.log('Disabled weekday delete button for single element (normalized approach).');
  } else {
    console.log('Could not find old delete button block to replace!');
  }
}

// 4. Force free: true and price: 0 in saveCalendar payload
const oldSavePayload = `      availability: calendarAvailability,
      startIncrement:
        calendarStartIncrement === "use-duration" ? "use-duration" : Number(calendarStartIncrement),
      minNotice: Number(calendarMinimumNotice),
      notifications: calendarNotifications,
      afterBooking: {
        ...calendarAfterBooking,
        confirmationBody: confirmationBody,
      },
      questions: calendarQuestions.filter((question) => question.label.trim() !== ""),
      active: true,
      url: \`\${BASE_BOOKING_URL}/\${slug}\`,
      image: calendarImage,
      imageRound: calendarImageRound,
      mediaType: calendarMediaType,
      titleOverride: calendarTitleOverride,
      locationOptions: locationOptions,
      durationOptions: durationOptions,
      customDuration: customDurationInput,
      currency: calendarCurrency,
      priceType: calendarPriceType,`.split('\n').map(l => l.trimEnd()).join(nl);

const newSavePayload = `      availability: calendarAvailability.map(item => ({ ...item, enabled: false })),
      free: true,
      price: 0,
      startIncrement:
        calendarStartIncrement === "use-duration" ? "use-duration" : Number(calendarStartIncrement),
      minNotice: Number(calendarMinimumNotice),
      notifications: calendarNotifications,
      afterBooking: {
        ...calendarAfterBooking,
        confirmationBody: confirmationBody,
      },
      questions: calendarQuestions.filter((question) => question.label.trim() !== ""),
      active: true,
      url: \`\${BASE_BOOKING_URL}/\${slug}\`,
      image: calendarImage,
      imageRound: calendarImageRound,
      mediaType: calendarMediaType,
      titleOverride: calendarTitleOverride,
      locationOptions: locationOptions,
      durationOptions: durationOptions,
      customDuration: customDurationInput,
      currency: calendarCurrency,
      priceType: calendarPriceType,`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldSavePayload)) {
  content = content.replace(oldSavePayload, newSavePayload);
  console.log('Forced free and disabled default availability in save payload.');
} else {
  // Try normalized replacement
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = oldSavePayload.replace(/\r\n/g, '\n');
  if (normContent.includes(normTarget)) {
    const startIdx = normContent.indexOf(normTarget);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    const lines = content.split(/\r?\n/);
    lines.splice(startLineIdx, blockLinesCount, ...newSavePayload.split('\n').map(l => l.trimEnd()));
    content = lines.join(nl);
    console.log('Forced free and disabled default availability in save payload (normalized approach).');
  } else {
    console.log('Could not find old save payload block to replace!');
  }
}

// 5. Hide pricing section in the JSX
const oldPricingSection = `                      {/* Pricing */}
                      <div className="flex flex-wrap items-end gap-4 mt-4" ref={priceRef}>
                        <div className="flex-1 min-w-[200px]">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                            {translateText("السعر", "Price")}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={calendarIsFree ? 0 : calendarPrice}
                              onChange={(e) => setCalendarPrice(Number(e.target.value))}
                              disabled={calendarIsFree}
                              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
                              min="0"
                              step="0.01"
                            />
                            <CustomSelect
                              value={calendarCurrency}
                              onChange={(val) => setCalendarCurrency(val as string)}
                              options={currencyOptions}
                              className="w-28"
                            />
                          </div>
                        </div>

                        {!calendarIsFree && (
                          <div className="w-40">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                              {translateText("نوع السعر", "Price Type")}
                            </label>
                            <CustomSelect
                              value={calendarPriceType}
                              onChange={(val) =>
                                setCalendarPriceType(val as "fixed" | "hourly" | "per_attendee")
                              }
                              options={[
                                { value: "fixed", label: translateText("ثابت", "Fixed") },
                                { value: "hourly", label: translateText("بالساعة", "Hourly") },
                                {
                                  value: "per_attendee",
                                  label: translateText("لكل حضور", "Per Attendee"),
                                },
                              ]}
                              className="w-full"
                            />
                          </div>
                        )}

                        <div className="flex-shrink-0">
                          <ToggleSwitch
                            checked={calendarIsFree}
                            onChange={setCalendarIsFree}
                            label={translateText("مجاني", "Free")}
                            className="border-0 py-0"
                          />
                        </div>
                      </div>`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldPricingSection)) {
  content = content.replace(oldPricingSection, '');
  console.log('Removed Pricing Section from UI.');
} else {
  // Try normalized replacement
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = oldPricingSection.replace(/\r\n/g, '\n');
  if (normContent.includes(normTarget)) {
    const startIdx = normContent.indexOf(normTarget);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    const lines = content.split(/\r?\n/);
    lines.splice(startLineIdx, blockLinesCount);
    content = lines.join(nl);
    console.log('Removed Pricing Section from UI (normalized approach).');
  } else {
    console.log('Could not find Pricing Section block to remove!');
  }
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
