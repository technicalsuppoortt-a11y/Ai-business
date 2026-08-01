const fs = require('fs');

const path = 'src/pages/Tools/components/AnalysisIdentity.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove the broken setTimeout in handleAnalyzeColors's finally block
const finallyBlockTarget = `      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzingColors(false);
        // EXPLICIT SAVE FOR VISUAL IDENTITY
        setTimeout(() => {
          saveResult({ ...cached, colorAnalysis: apiResponse, primaryColor: newPrimary, secondaryColor: newSecondary, accentColor: newAccent, headingFont: newFont, bodyTextColor: newBodyColor, heroBgColor: newHeroBg, buttonBgColor: newPrimary, cardBgColor: newCardBg, cardBorderColor: newAccent });
        }, 100);
      }`;
const finallyBlockReplacement = `      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzingColors(false);
      }`;

code = code.replace(finallyBlockTarget, finallyBlockReplacement);

// 2. Inject saveResult for Live Mode in handleAnalyzeColors
const liveTarget = `          if (liveData) {
            setIsNewlyGeneratedColors(true);
              setColorAnalysis({
              psychology_ar:`;
const liveReplacement = `          if (liveData) {
            setIsNewlyGeneratedColors(true);
            const liveColorAnalysis = {
              psychology_ar:`;
const liveEndTarget = `              dos_and_donts_en: Array.isArray(liveData.usage_tips)
                ? liveData.usage_tips.join("\\n")
                : liveData.usage_tips || "",
            });
          }
        } else {`;
const liveEndReplacement = `              dos_and_donts_en: Array.isArray(liveData.usage_tips)
                ? liveData.usage_tips.join("\\n")
                : liveData.usage_tips || "",
            };
            setColorAnalysis(liveColorAnalysis);
            saveResult({ ...cached, colorAnalysis: liveColorAnalysis, primaryColor, secondaryColor, accentColor, logoPreview, mockupView, brandArchetype, headingFont, headingColor, bodyTextColor, buttonBgColor, buttonTextColor, buttonBorderColor, buttonRadius, buttonHoverBg, heroBgColor, cardBgColor, cardBorderColor, customCssCode, appliedCssCode });
          }
        } else {`;

code = code.replace(liveTarget, liveReplacement);
code = code.replace(liveEndTarget, liveEndReplacement);

// 3. Inject saveResult for Fast Mode (Database Result)
const dbResultTarget = `          if (dbResult) {
            setColorAnalysis(dbResult);
              setIsNewlyGeneratedColors(true);
          } else {`;
const dbResultReplacement = `          if (dbResult) {
            setColorAnalysis(dbResult);
            setIsNewlyGeneratedColors(true);
            saveResult({ ...cached, colorAnalysis: dbResult, primaryColor, secondaryColor, accentColor, logoPreview, mockupView, brandArchetype, headingFont, headingColor, bodyTextColor, buttonBgColor, buttonTextColor, buttonBorderColor, buttonRadius, buttonHoverBg, heroBgColor, cardBgColor, cardBorderColor, customCssCode, appliedCssCode });
          } else {`;

code = code.replace(dbResultTarget, dbResultReplacement);

// 4. Inject saveResult for Fast Mode (Fallback Result)
const fallbackTarget = `          } else {
            setColorAnalysis({
              psychology_ar:`;
const fallbackReplacement = `          } else {
            const fallbackColorAnalysis = {
              psychology_ar:`;
const fallbackEndTarget = `              dos_and_donts_en:
                "Do: Use the primary color for Call-to-Action buttons.\\nDon't: Avoid low-contrast text on primary background.",
            });
          }
        }`;
const fallbackEndReplacement = `              dos_and_donts_en:
                "Do: Use the primary color for Call-to-Action buttons.\\nDon't: Avoid low-contrast text on primary background.",
            };
            setColorAnalysis(fallbackColorAnalysis);
            saveResult({ ...cached, colorAnalysis: fallbackColorAnalysis, primaryColor, secondaryColor, accentColor, logoPreview, mockupView, brandArchetype, headingFont, headingColor, bodyTextColor, buttonBgColor, buttonTextColor, buttonBorderColor, buttonRadius, buttonHoverBg, heroBgColor, cardBgColor, cardBorderColor, customCssCode, appliedCssCode });
          }
        }`;

code = code.replace(fallbackTarget, fallbackReplacement);
code = code.replace(fallbackEndTarget, fallbackEndReplacement);

// 5. Inject saveResult into handlePresetSelect
const presetTarget = `      dispatch({ type: "SET_FIELD", field: "accentColor", value: preset.accent });
      setColorAnalysis(null);
      toast(`;
const presetReplacement = `      dispatch({ type: "SET_FIELD", field: "accentColor", value: preset.accent });
      setColorAnalysis(null);
      saveResult({ ...cached, colorAnalysis: null, primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent, buttonBgColor: preset.accent || preset.primary, buttonBorderColor: preset.primary });
      toast(`;

code = code.replace(presetTarget, presetReplacement);

fs.writeFileSync(path, code);
console.log('Successfully patched AnalysisIdentity.jsx for immediate saveResult in Visual Identity Studio!');
