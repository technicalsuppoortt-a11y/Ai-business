const fs = require('fs');
const path = 'src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /if \(cached\.weeklyPostsCount !== undefined\) setWeeklyPostsCount\(cached\.weeklyPostsCount\);\s*\}\s*\}\s*\}, \[isLoadedFromCloud, cached\]\);/;

const newHydrationBlock = `if (cached.weeklyPostsCount !== undefined) setWeeklyPostsCount(cached.weeklyPostsCount);
          
          if (cached.nicheField !== undefined) setNicheField(cached.nicheField);
          if (cached.savedIdeas !== undefined) setSavedIdeas(cached.savedIdeas);
          if (cached.trendingHashtags !== undefined) setTrendingHashtags(cached.trendingHashtags);
          if (cached.trendingAudios !== undefined) setTrendingAudios(cached.trendingAudios);
          if (cached.selectedViralVideo !== undefined) setSelectedViralVideo(cached.selectedViralVideo);
        }
      }
    }, [isLoadedFromCloud, cached]);`;

if (regex.test(content)) {
    content = content.replace(regex, newHydrationBlock);
    fs.writeFileSync(path, content);
    console.log("Successfully replaced hydration block.");
} else {
    console.log("Regex did not match.");
}
