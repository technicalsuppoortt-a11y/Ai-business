const fs = require('fs');
const file = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace state definition
content = content.replace(/const \[isNewlyGenerated, setIsNewlyGenerated\] = useState\(false\);/g, 'const [isLiveGenerating, setIsLiveGenerating] = useState(false);');

// Replace setter calls
content = content.replace(/setIsNewlyGenerated/g, 'setIsLiveGenerating');

// Replace variable usage
content = content.replace(/isNewlyGenerated \?/g, 'isLiveGenerating ?');
content = content.replace(/!isNewlyGenerated/g, '!isLiveGenerating');
content = content.replace(/isNewlyGenerated/g, 'isLiveGenerating');

// Update useEffect dependencies to include toolId
content = content.replace(/\[activeTab, activeSubTool\]\);/g, '[activeTab, activeSubTool, toolId]);');

fs.writeFileSync(file, content);
console.log('Done!');
