const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const target = /\{booking\.time\}\s*<\/div>\s*<\/div>\s*<\/div>/;
const replacement = `{booking.time}
                                              </div>
                                            </div>
                                          </div>

                                          {(() => {
                                            const calObj = calendars.find((c) => c.id === booking.calendarId);
                                            const bookingSlugUrl = \`\${BASE_BOOKING_URL}/\${calObj?.slug || ""}\`;
                                            return (
                                              <div className="mt-3 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {translateText("رابط الحجز (Slug URL)", "Booking Slug URL")}
                                                  </div>
                                                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-350 mt-0.5 truncate font-mono">
                                                    {bookingSlugUrl}
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(bookingSlugUrl);
                                                    toast.success(translateText("تم نسخ رابط الحجز", "Booking link copied"));
                                                  }}
                                                  className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                                                  title={translateText("نسخ الرابط", "Copy Link")}
                                                >
                                                  <Copy className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            );
                                          })()}`;

if (target.test(content)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Slug URL inserted successfully!');
} else {
  console.log('Target for Slug URL NOT found!');
}
