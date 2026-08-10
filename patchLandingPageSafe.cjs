const fs = require('fs');

const liveAiFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/services/liveAiService.js';
let content = fs.readFileSync(liveAiFile, 'utf8');

const startStr = "const systemPrompt = `You are an elite Principal Frontend Engineer and Lead Conversion Designer specializing in modern, high-converting Tailwind CSS landing pages.";
const endStr = "- Return ONLY the executable raw HTML code block without introductory or concluding conversational prose.`;";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const oldPrompt = content.substring(startIndex, endIndex + endStr.length);
  
  const newPrompt = `const systemPrompt = \`You are an elite Principal Copywriter and Conversion Designer specializing in high-converting landing pages.

Generate compelling landing page copy in JSON format based on the user's inputs.
\${languageInstruction}

Return MUST be valid JSON strictly matching this structure:
{
  "hero": [
    "Headline: Main attention-grabbing hook",
    "Sub-headline: Supporting value proposition",
    "Primary CTA: Action-oriented button text"
  ],
  "problem": [
    "Identify the pain point",
    "Agitate the problem",
    "Introduce the gap in the market"
  ],
  "offer": [
    "Introduce your product as the solution",
    "Key Benefit 1",
    "Key Benefit 2",
    "Key Benefit 3"
  ],
  "proof": [
    "Testimonial quote or stat",
    "Authority marker (e.g. As seen on...)",
    "Risk reversal / Guarantee"
  ],
  "cta": [
    "Final strong call to action",
    "Secondary CTA or FAQ highlight"
  ]
}\`;`;

  content = content.replace(oldPrompt, newPrompt);
  fs.writeFileSync(liveAiFile, content);
  console.log("Successfully replaced the system prompt for landing page content!");
} else {
  console.log("Failed to find the bounds.", { startIndex, endIndex });
}
