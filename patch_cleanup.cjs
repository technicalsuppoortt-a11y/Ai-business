const fs = require('fs');
const path = 'src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove conflicting savedIdeas hook
const badHook = `  // Load saved ideas from Firebase user tool results on mount
  useEffect(() => {
    if (state.toolResults?.["social-media-ideas"]?.savedIdeas) {
      setSavedIdeas(state.toolResults["social-media-ideas"].savedIdeas);
    }
  }, [state.toolResults]);`;
  
if (content.includes(badHook)) {
    content = content.replace(badHook, "  // Removed old savedIdeas loader to allow useToolCache to handle it.");
}

// 2. Fix Tool 6 Bounds
const targetBounds = `                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                      marginTop: "20px",
                    }}
                  >`;
                  
const replaceBounds = `                  <div
                    className="pcc-custom-scroll ai-output-scroll"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                      marginTop: "20px",
                      maxHeight: "500px",
                      overflowY: "auto",
                      paddingRight: "5px"
                    }}
                  >`;

if (content.includes(targetBounds)) {
    content = content.replace(targetBounds, replaceBounds);
}

fs.writeFileSync(path, content);
console.log("Fixed hook and Tool 6 bounds.");
