const fs = require('fs');

const liveAiFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/services/liveAiService.js';
let content = fs.readFileSync(liveAiFile, 'utf8');

const targetRegex = /case 'landing-page-content': \{[\s\S]*?const responseText = await callOpenAiApiWithCredits\(\{ uid, systemPrompt, userPrompt, jsonMode: true, costKey \}\);\n      return JSON.parse\(responseText\);\n    \}/g;

const newBlock = `case 'landing-page-content': {
      const { productName, audience, objective, awareness, pricePoint, emotion } = inputs;
      const systemPrompt = \`You are an elite Principal Copywriter and Conversion Designer specializing in high-converting landing pages.

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
}\`;
      const userPrompt = \`Generate landing page copy for:
Product Name: \${productName || brandNameStr}
Target Audience: \${audience || nicheStr}
Objective: \${objective || 'direct_sales'}
Awareness Level: \${awareness || 'problem_aware'}
Price Point: \${pricePoint || 'low_ticket'}
Emotional Trigger: \${emotion || 'urgency'}\`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true, costKey });
      return JSON.parse(responseText);
    }`;

if (content.match(targetRegex)) {
  content = content.replace(targetRegex, newBlock);
  fs.writeFileSync(liveAiFile, content);
  console.log("Successfully fixed landing-page-content prompt in liveAiService.js");
} else {
  console.log("Failed to match the landing-page-content case block.");
}
