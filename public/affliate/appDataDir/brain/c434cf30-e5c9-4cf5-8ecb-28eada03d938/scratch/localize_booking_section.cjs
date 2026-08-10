const fs = require('fs');

const filePath = 'd:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/tabs/BookingSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const translationMap = {
  "Location": ["الموقع", "Location"],
  "Duration & Price": ["المدة والسعر", "Duration & Price"],
  "Duration": ["المدة", "Duration"],
  "Price": ["السعر", "Price"],
  "Group / Class": ["مجموعة / صف", "Group / Class"],
  "Availability": ["المواعيد المتاحة", "Availability"],
  "Break Intervals": ["فترات الراحة", "Break Intervals"],
  "Add break": ["إضافة فترة راحة", "Add break"],
  "Start time increments": ["زيادة وقت البدء", "Start time increments"],
  "Buffer": ["وقت فاصل", "Buffer"],
  "Min. booking notice": ["الحد الأدنى للإشعار بالحجز", "Min. booking notice"],
  "Max. advance booking": ["الحد الأقصى للحجز المسبق", "Max. advance booking"],
  "Advanced Configuration": ["الإعدادات المتقدمة", "Advanced Configuration"],
  "Time zone display": ["عرض المنطقة الزمنية", "Time zone display"],
  "Show time zone": ["إظهار المنطقة الزمنية", "Show time zone"],
  "Start Date": ["تاريخ البدء", "Start Date"],
  "End Date": ["تاريخ الانتهاء", "End Date"],
  "Look busy": ["تبدو مشغولاً", "Look busy"],
  "Edit": ["تعديل", "Edit"],
  "Gray out busy slots": ["تظليل الفترات المزدحمة", "Gray out busy slots"],
  "Booking limits": ["حدود الحجز", "Booking limits"],
  "Cancel": ["إلغاء", "Cancel"],
  "Add booking limit": ["إضافة حد للحجز", "Add booking limit"],
  "Limit": ["الحد", "Limit"],
  "Scope": ["المجال", "Scope"],
  "Period": ["الفترة", "Period"],
  "Add": ["إضافة", "Add"],
  "Booking Form": ["نموذج الحجز", "Booking Form"],
  "REQUIRED": ["إجباري", "REQUIRED"],
  "OPTIONAL": ["اختياري", "OPTIONAL"],
  "Add question": ["إضافة سؤال", "Add question"],
  "Add block of text": ["إضافة نص", "Add block of text"],
  "Notifications": ["الإشعارات", "Notifications"],
  "Send confirmation email": ["إرسال بريد تأكيد", "Send confirmation email"],
  "Number of email reminders": ["عدد رسائل التذكير", "Number of email reminders"],
  "After Booking": ["بعد الحجز", "After Booking"],
  "Redirect URL": ["رابط إعادة التوجيه", "Redirect URL"],
  "Auto-fill visitor data": ["ملء بيانات الزائر تلقائياً", "Auto-fill visitor data"],
  "Webhook": ["ويب هوك", "Webhook"],
  "Webhook URL": ["رابط ويب هوك", "Webhook URL"],
  "Confirmation page": ["صفحة التأكيد", "Confirmation page"],
  "Customize": ["تخصيص", "Customize"],
  "Answer Type": ["نوع الإجابة", "Answer Type"],
  "Label": ["العنوان", "Label"],
  "First Name Label": ["عنوان الاسم الأول", "First Name Label"],
  "Last Name Label": ["عنوان اسم العائلة", "Last Name Label"],
  "Requirement": ["المتطلبات", "Requirement"],
  "Save": ["حفظ", "Save"],
  "Email": ["البريد الإلكتروني", "Email"],
  "Edit guests question": ["تعديل سؤال الضيوف", "Edit guests question"],
  "Label (Add a guest)": ["العنوان (إضافة ضيف)", "Label (Add a guest)"],
  "Show counter": ["إظهار العداد", "Show counter"],
  "Label (Guests details)": ["العنوان (تفاصيل الضيوف)", "Label (Guests details)"],
  "Edit question": ["تعديل السؤال", "Edit question"],
  "New question": ["سؤال جديد", "New question"],
  "Type your question": ["اكتب سؤالك", "Type your question"],
  "Answer type": ["نوع الإجابة", "Answer type"],
  "Answers": ["الإجابات", "Answers"],
  "Type answer...": ["اكتب الإجابة...", "Type answer..."],
  "Update": ["تحديث", "Update"],
  "Label (optional)": ["العنوان (اختياري)", "Label (optional)"],
  "e.g. Important Note": ["مثال: ملاحظة هامة", "e.g. Important Note"],
  "Text": ["النص", "Text"],
  "Confirmation Page": ["صفحة التأكيد", "Confirmation Page"],
  "Body Text": ["نص الرسالة", "Body Text"],
  "Variables": ["المتغيرات", "Variables"],
  "Restore Default": ["استعادة الافتراضي", "Restore Default"],
  "Preview": ["معاينة", "Preview"],
  "Apply": ["تطبيق", "Apply"],
  "Look Busy": ["تبدو مشغولاً", "Look Busy"],
  "Min %": ["الحد الأدنى %", "Min %"],
  "Max %": ["الحد الأقصى %", "Max %"]
};

// Regex to match translateText("...", "...") or translateText('...', '...')
// allowing for arbitrary whitespace inside the call
const translateRegex = /translateText\s*\(\s*(['"`])(.*?)\1\s*,\s*(['"`])(.*?)\3\s*\)/g;

let matchCount = 0;
let replacedCount = 0;

const newContent = content.replace(translateRegex, (match, quote1, arg1, quote2, arg2) => {
  matchCount++;
  if (arg1 === arg2) {
    const key = arg1.trim();
    if (translationMap[key]) {
      const [arabic, english] = translationMap[key];
      replacedCount++;
      return `translateText("${arabic}", "${english}")`;
    }
  }
  return match;
});

console.log(`Found ${matchCount} translateText calls.`);
console.log(`Replaced ${replacedCount} identical calls with Arabic translations.`);

if (replacedCount > 0) {
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Saved translations to BookingSection.tsx successfully.');
}
