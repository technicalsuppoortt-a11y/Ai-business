const fs = require('fs');
const file = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(file, 'utf8');

// The goal is to inject costKey: "costSocialMedia", into all dispatchLiveAiAnalysis calls inside SocialMedia.jsx
// It usually looks like this:
// res = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
//       toolId: "something",

content = content.replace(/dispatchLiveAiAnalysis\(\{\s*uid:[^,]+,\s*toolId:\s*"[^"]+",/g, (match) => {
    if (match.includes('costKey')) return match;
    return match + '\n          costKey: "costSocialMedia",';
});

fs.writeFileSync(file, content);
console.log('Done mapping costKeys!');
