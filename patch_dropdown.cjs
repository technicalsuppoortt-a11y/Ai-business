const fs = require('fs');

const path = 'src/pages/Tools/components/AnalysisIdentity.jsx';
let code = fs.readFileSync(path, 'utf8');

const dropdownTarget = `                  <CustomDropdown
                    value={selectedStyle || ""}
                    onChange={(v) => setSelectedStyle(v)}
                    options={styleOptions}`;

const dropdownReplacement = `                  <CustomDropdown
                    value={selectedStyle || ""}
                    onChange={(v) => {
                      setSelectedStyle(v);
                      setSelectedCatalogs([]);
                    }}
                    options={styleOptions}`;

code = code.replace(dropdownTarget, dropdownReplacement);

fs.writeFileSync(path, code);
console.log('Successfully patched CustomDropdown logic!');
