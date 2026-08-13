/**
 * Gemini AI Service for GigSniper Tools
 */

const API_MODEL = 'gemini-2.0-flash';

/**
 * Call Gemini API with a prompt
 */
export async function callGemini(prompt, apiKey) {
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please add it in settings.');
  }

  const currentLanguage = localStorage.getItem('app_language') || 'ar';
  const langInstruction = currentLanguage === 'en' 
    ? '\n\n[CRITICAL INSTRUCTION: You MUST generate the final response entirely in English.]' 
    : '\n\n[CRITICAL INSTRUCTION: You MUST generate the final response entirely in Arabic.]';
    
  const finalPrompt = prompt + langInstruction;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'API Error');
    }

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('Gemini Service Error:', error);
    throw error;
  }
}

/**
 * Specifically for Proposal Sniper: Analyze job and generate proposal
 */
export async function analyzeJobAndGenerateProposal(jobDescription, { tone, language, context }) {
  const { user, niche, subNiche, exactTitle, skills } = context;
  
  const title = exactTitle || subNiche || niche || 'Professional Freelancer';
  const skillsText = skills.length > 0 
    ? skills.map(s => s.name).join(', ') 
    : 'expert execution and high-quality delivery';
  
  const tones = {
    expert: language?.startsWith('ar') ? 'خبير محترف' : 'Professional Expert',
    friendly: language?.startsWith('ar') ? 'ودودة مباشرة' : 'Friendly and Direct',
    corporate: language?.startsWith('ar') ? 'رسمي واحترافي' : 'Formal and Corporate',
    creative: language?.startsWith('ar') ? 'مبدع وخارج الصندوق' : 'Creative and Out-of-the-box',
  };

  let langInstruction = 'in English';
  if (language === 'ar-EG') {
    langInstruction = 'You MUST write the ENTIRE output using natural, 100% Egyptian conversational dialect (باللهجة المصرية العامية الدارجة تماماً). Do not use any Standard Arabic (الفصحى) sentences. Replace formal words with common Egyptian business phrasing (e.g., use: ظبط، عشان، كدة، دلوقتي، هيخليك، اللينك، الزبون، التارجت، عايز، أوي). Make it sound like an expert Egyptian marketer talking directly to a client.';
  } else if (language === 'ar-GCC' || language === 'ar-KW') {
    langInstruction = 'You MUST write the ENTIRE output using natural, 100% Khaleeji Gulf dialect (باللهجة الخليجية العامية الدارجة تماماً). Do not use any Standard Arabic (الفصحى) sentences. Replace formal words with common Gulf business phrasing (e.g., use: عدل، عشان، تبي، هالخطوة، وايد، الحين، حق، شلون، كذا، الزبائن). Make it sound like an expert Gulf marketer talking directly to a client.';
  } else if (language?.startsWith('ar')) {
    langInstruction = 'in Modern Standard Arabic (العربية الفصحى البسيطة والاحترافية)';
  }

  const prompt = `
    You are an expert freelancer specializing in ${title}. 
    Write a job proposal (bid) with a ${tones[tone] || tones.expert} tone for the following job description:
    
    ${langInstruction}
    
    ---
    ${jobDescription}
    ---
    
    Your Skills: ${skillsText}
    Your Name: ${user.name || 'Freelancer'}
    
    Instructions:
    1. Start with a strong Hook that shows you understand the client's problem.
    2. Prove your expertise briefly.
    3. Mention one surprising value or unique insight about their project.
    4. End with a clear Call to Action (e.g., asking for a 15-min call).
    5. Keep it under 250 words.
    6. DO NOT use generic placeholders like [Insert Name Here] if you have the name.
  `;

  const proposal = await callGemini(prompt, context.apiKey);

  // Analysis part (Client X-Ray)
  // We can do another call or just extract info if we wanted, but for now let's mock the analysis metadata
  // In a more advanced version, we'd ask Gemini to return JSON with {analysis: [], proposal: ""}
  
  const analysisPrompt = `
    Analyze this job description and extract 4 key points for a freelancer:
    1. Budget level (Low/Med/High)
    2. Urgency
    3. Technical difficulty
    4. Client's main pain point
    
    Return ONLY a JSON array of 4 objects like this: [{"icon": "💰", "label": "Budget", "value": "High"}, ...]
    
    Job Description:
    ${jobDescription}
  `;
  
  let analysisRaw = '[]';
  try {
    analysisRaw = await callGemini(analysisPrompt, context.apiKey);
    // Clean up markdown if any
    analysisRaw = analysisRaw.replace(/```json|```/g, '').trim();
  } catch (e) {
    console.error('Analysis failed', e);
  }

  let analysis = [];
  try {
    analysis = JSON.parse(analysisRaw);
  } catch {
    analysis = [
      { icon: '💰', label: 'الميزانية', value: 'تقديرية' },
      { icon: '⏰', label: 'السرعة', value: 'مطلوبة' },
      { icon: '🧩', label: 'الصعوبة', value: 'متوسطة' },
      { icon: '🎯', label: 'الهدف', value: 'حل المشكلة' },
    ];
  }

  return {
    proposal,
    analysis
  };
}
