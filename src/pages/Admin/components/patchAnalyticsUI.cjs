const fs = require('fs');
const file = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Admin/components/AiSettingsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update AreaChart for "Token Usage Trend Chart"
const oldAreaChartContainer = `                {/* Trend Chart */}
                <div style={{ border: '1px solid var(--line2)', borderRadius: '16px', padding: '20px', background: 'var(--bg2)' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '20px' }}>
                    {isRTL ? 'استهلاك الكلمات عبر الزمن' : 'Token Consumption Trend'}
                  </h5>
                  <div style={{ height: '250px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardMetrics.trendData}>
                        <defs>
                          <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--orange)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                        <XAxis dataKey="date" stroke="var(--text3)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value > 1000 ? \`\${(value/1000).toFixed(0)}k\` : value} />
                        <RechartsTooltip 
                          contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                          itemStyle={{ color: 'var(--orange)', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="tokens" stroke="var(--orange)" fillOpacity={1} fill="url(#colorTokens)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>`;

const newAreaChartContainer = `                {/* Trend Chart */}
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
                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value > 1000 ? \`\${(value/1000).toFixed(0)}k\` : value} tickMargin={10} />
                        <RechartsTooltip 
                          contentStyle={{ background: '#1E1B4B', border: '1px solid #4C1D95', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                          itemStyle={{ color: '#C4B5FD', fontWeight: 'bold' }}
                          labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="tokens" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>`;

content = content.replace(oldAreaChartContainer, newAreaChartContainer);


// 2. Update BarChart for "Most Costly Tools Chart"
const oldBarChartContainer = `                {/* Tool Distribution Chart */}
                <div style={{ border: '1px solid var(--line2)', borderRadius: '16px', padding: '20px', background: 'var(--bg2)' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '20px' }}>
                    {isRTL ? 'الأدوات الأعلى تكلفة' : 'Highest Cost Tools'}
                  </h5>
                  <div style={{ height: '250px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardMetrics.rankedTools.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="var(--text3)" fontSize={12} tickFormatter={(value) => \`\${value.toFixed(2)}\`} />
                        <YAxis dataKey="name" type="category" stroke="var(--text3)" fontSize={12} width={100} tickLine={false} axisLine={false} />
                        <RechartsTooltip 
                          formatter={(value) => \`\${Number(value).toFixed(4)}\`}
                          contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                        />
                        <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                          {dashboardMetrics.rankedTools.slice(0, 5).map((entry, index) => (
                            <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>`;

const newBarChartContainer = `                {/* Tool Distribution Chart */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5" style={{ minWidth: 0 }}>
                  <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: '#E5E7EB', marginBottom: '20px' }}>
                    {isRTL ? 'الأدوات الأعلى تكلفة' : 'Highest Cost Tools'}
                  </h5>
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardMetrics.rankedTools.slice(0, 5)} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => \`$\${value.toFixed(4)}\`} tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} width={120} tickLine={false} axisLine={false} tickMargin={10} />
                        <RechartsTooltip 
                          formatter={(value) => \`$\${Number(value).toFixed(4)}\`}
                          contentStyle={{ background: '#1E1B4B', border: '1px solid #4C1D95', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                          itemStyle={{ color: '#06B6D4', fontWeight: 'bold' }}
                          cursor={{ fill: '#374151', opacity: 0.2 }}
                        />
                        <Bar dataKey="cost" radius={[0, 6, 6, 0]} barSize={24} fill="#06B6D4">
                          {dashboardMetrics.rankedTools.slice(0, 5).map((entry, index) => (
                            <Cell key={\`cell-\${index}\`} fill={index % 2 === 0 ? "#6366F1" : "#06B6D4"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>`;

content = content.replace(oldBarChartContainer, newBarChartContainer);


// 3. Update User Activity Aggregation Table
const oldUserTable = `              {/* USER ACTIVITY TABLE */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h5 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>
                    {isRTL ? 'تحليل استهلاك ونشاط جميع المستخدمين' : 'User Activity Analysis'}
                  </h5>
                </div>
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--line2)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--line2)' }}>
                        <th style={{ padding: '12px', color: 'var(--text2)' }}>{isRTL ? 'المستخدم' : 'User'}</th>
                        <th style={{ padding: '12px', color: 'var(--text2)', textAlign: 'center' }}>{isRTL ? 'الطلبات' : 'Requests'}</th>
                        <th style={{ padding: '12px', color: 'var(--text2)', textAlign: 'center' }}>{isRTL ? 'النقاط' : 'Credits'}</th>
                        <th style={{ padding: '12px', color: 'var(--text2)', textAlign: 'center' }}>{isRTL ? 'التكلفة ($)' : 'Cost ($)'}</th>
                        <th style={{ padding: '12px', color: 'var(--text2)' }}>{isRTL ? 'أكثر أداة استخداماً' : 'Most Used Tool'}</th>
                        <th style={{ padding: '12px', color: 'var(--text2)', textAlign: 'center' }}>{isRTL ? 'إجراء' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardMetrics.rankedUsers.slice(0, 20).map((user, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>{user.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{user.email}</div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{user.requests}</td>
                          <td style={{ padding: '12px', textAlign: 'center', color: 'var(--orange)', fontWeight: 'bold' }}>{user.credits} CR</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>\${(user.cost || 0).toFixed(4)}</td>
                          <td style={{ padding: '12px', color: 'var(--text3)' }}>{user.mostUsedTool}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button 
                              onClick={() => toast(isRTL ? 'ميزة شحن الرصيد ستتوفر قريباً' : 'Charge credits coming soon', 'info')}
                              style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--orange)', color: '#fff', fontSize: '11px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                              {isRTL ? 'شحن رصيد' : 'Charge'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>`;

const newUserTable = `              {/* USER ACTIVITY TABLE */}
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
                          <td style={{ padding: '16px', textAlign: 'center', color: '#10B981', fontWeight: 'bold' }}>\${(user.cost || 0).toFixed(4)}</td>
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
              </div>`;

content = content.replace(oldUserTable, newUserTable);


// Ensure Tailwind class "hover:bg-slate-800/50" and "hover:bg-indigo-500/10" will work by relying on Tailwind CSS if present, 
// otherwise the inline styles fallback is decent.

fs.writeFileSync(file, content);
console.log('Done refactoring Analytics Dashboard UI');
