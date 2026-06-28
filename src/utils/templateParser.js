/**
 * templateParser.js
 * ========================================================
 * Utility function to parse dynamic template strings containing
 * variables in the format {{variableName}}.
 * It replaces the placeholders with actual data provided in the context.
 * ========================================================
 */

/**
 * Parses a template string and injects context variables.
 * @param {string} templateString - The template string (e.g. "Welcome to {{brandName}}")
 * @param {object} contextData - An object containing the data (e.g. { brandName: "GigSniper" })
 * @returns {string} - The parsed string
 */
export const parseTemplate = (templateString, contextData = {}) => {
  if (!templateString || typeof templateString !== 'string') {
    return '';
  }

  let parsed = templateString;

  // Replace each {{key}} with its corresponding value from contextData
  Object.keys(contextData).forEach(key => {
    // Create a regular expression to match {{key}} globally
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    
    // Get the value; if undefined or null, fallback to empty string (or you could keep the placeholder)
    let value = contextData[key];
    if (value === undefined || value === null) {
      value = ''; 
    }
    
    parsed = parsed.replace(regex, value);
  });

  return parsed;
};
