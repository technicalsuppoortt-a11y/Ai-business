const fs = require('fs');
const file = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Map costKey explicitly in all dispatchLiveAiAnalysis calls
content = content.replace(/dispatchLiveAiAnalysis\(\{\s*uid:\s*(userData\?\.uid\s*\|\|\s*state\?\.user\?\.uid),\s*toolId:\s*"([^"]+)",/g, (match, uidStr, toolIdStr) => {
    return `dispatchLiveAiAnalysis({ uid: ${uidStr},\n          toolId: "${toolIdStr}",\n          costKey: "costSocialMedia",`;
});

// 2. Rename isNewlyGenerated to isLiveGenerating
content = content.replace(/const \[isNewlyGenerated, setIsNewlyGenerated\] = useState\(false\);/g, 'const [isLiveGenerating, setIsLiveGenerating] = useState(false);');
content = content.replace(/setIsNewlyGenerated/g, 'setIsLiveGenerating');
content = content.replace(/isNewlyGenerated/g, 'isLiveGenerating');

// 3. Add the useEffect BELOW activeSubTool declaration
// Find the activeSubTool declaration
const targetDecl = 'const [activeSubTool, setActiveSubTool] = useState("script-writer");';
const replacementDecl = `const [activeSubTool, setActiveSubTool] = useState("script-writer");

  // Issue 1 Fix: Ensure it is false on mount, unmount, and whenever tab/tool changes
  useEffect(() => {
    setIsLiveGenerating(false);
    return () => {
      setIsLiveGenerating(false);
    };
  }, [activeTab, activeSubTool, toolId]);`;
content = content.replace(targetDecl, replacementDecl);

// 4. Update TypewriterText rendering to strictly conditional rendering
// This targets the specific lines in the file reliably using a replacer
const varsToReplace = ['resultArchitect', 'scriptResult', 'captionResult', 'repurposeResult', 'qaResult'];

for (const varName of varsToReplace) {
  const regex = new RegExp(`<TypewriterText text=\\{${varName}\\} speed=\\{10\\} bypass=\\{\\!isLiveGenerating\\} \\/>`, 'g');
  const replacement = `isLiveGenerating ? (
                          <TypewriterText text={${varName}} speed={10} bypass={false} />
                        ) : (
                          <span style={{ whiteSpace: "pre-wrap" }}>{${varName}}</span>
                        )`;
  content = content.replace(regex, replacement);
}

fs.writeFileSync(file, content);
console.log('Done mapping and fixing SocialMedia.jsx');
