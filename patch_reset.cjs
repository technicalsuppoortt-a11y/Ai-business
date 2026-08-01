const fs = require('fs');
const path = 'src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /setIsGeneratingQa\(false\);\s*saveResult\(null\);\s*\};/;
const newResetBlock = \`setIsGeneratingQa(false);
      
      setTrendingHashtags([
        {
          tag: "#ترند_توضيحي",
          category: "hot",
          label: "نار نار",
          growth: "+340%",
        },
        {
          tag: "#ترند_صاعد",
          category: "rising",
          label: "صاعد بقوة",
          growth: "+180%",
        },
      ]);
      setTrendingAudios([
        {
          title: "Cyber Pulse Ambient Beat",
          creator: "Trend Beats",
          uses: "45.2K",
        },
      ]);
      
      saveResult(null);
    };\`;

if (regex.test(content)) {
    content = content.replace(regex, newResetBlock);
    fs.writeFileSync(path, content);
    console.log("Successfully replaced handleResetSession bounds.");
} else {
    console.log("Regex did not match.");
}
