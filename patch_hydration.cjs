const fs = require('fs');
const path = 'src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetHydrationBlock = `          if (cached.energyScore !== undefined) setEnergyScore(cached.energyScore);
          if (cached.selectedMood !== undefined) setSelectedMood(cached.selectedMood);
          if (cached.weeklyPostsCount !== undefined) setWeeklyPostsCount(cached.weeklyPostsCount);
        }
      }
    }, [isLoadedFromCloud, cached]);`;

const newHydrationBlock = `          if (cached.energyScore !== undefined) setEnergyScore(cached.energyScore);
          if (cached.selectedMood !== undefined) setSelectedMood(cached.selectedMood);
          if (cached.weeklyPostsCount !== undefined) setWeeklyPostsCount(cached.weeklyPostsCount);
          
          if (cached.nicheField !== undefined) setNicheField(cached.nicheField);
          if (cached.savedIdeas !== undefined) setSavedIdeas(cached.savedIdeas);
          if (cached.trendingHashtags !== undefined) setTrendingHashtags(cached.trendingHashtags);
          if (cached.trendingAudios !== undefined) setTrendingAudios(cached.trendingAudios);
          if (cached.selectedViralVideo !== undefined) setSelectedViralVideo(cached.selectedViralVideo);
        }
      }
    }, [isLoadedFromCloud, cached]);`;

if (content.includes(targetHydrationBlock)) {
    content = content.replace(targetHydrationBlock, newHydrationBlock);
    fs.writeFileSync(path, content);
    console.log("Successfully patched hydration block.");
} else {
    console.log("Failed to match hydration block!");
}
