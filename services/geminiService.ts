import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_IMAGE, MODEL_TEXT } from "../constants";

// Helper to check for API key selection for Pro models
export const ensureApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      return true;
    }
    return hasKey;
  }
  return !!process.env.API_KEY;
};

// Generate background image for menu
export const generateMenuBackground = async (description: string): Promise<string> => {
  await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `A high quality, professional, artistic background texture for a restaurant menu. Theme: ${description}. Soft lighting, suitable for overlaying text. No text in the image itself. High resolution, elegant.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4", // Portrait for menu
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Background generation failed:", error);
    throw error;
  }
};

// Generate full theme including colors, fonts, and background
export const generateFullTheme = async (description: string, colors: string, fonts: string): Promise<{
  backgroundImage: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  backgroundColor: string;
}> => {
  await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Analyze constraints and generate config using Text Model
  const analysisPrompt = `
    You are a professional menu designer. 
    User Preferences:
    - Theme/Vibe: "${description}"
    - Preferred Colors: "${colors}"
    - Preferred Fonts: "${fonts}"

    Task:
    1. Create a visual description for a background image that matches these preferences. 
       This description will be passed to an image generation model. 
       Include color palette details in the description.
    2. Select the best matching text color (hex code) that ensures high readability on the described background.
    3. Select a fallback background color (hex code).
    4. Select the best font pairing from the available options:
       - Heading Font: 'font-serif' (Classic/Elegant) or 'font-sans' (Modern/Clean).
       - Body Font: 'font-serif' or 'font-sans'.

    Return JSON:
    {
      "visualDescription": "string",
      "textColor": "#hex",
      "backgroundColor": "#hex",
      "headingFont": "string",
      "bodyFont": "string"
    }
  `;

  let themeConfig;
  try {
     const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visualDescription: { type: Type.STRING },
            textColor: { type: Type.STRING },
            backgroundColor: { type: Type.STRING },
            headingFont: { type: Type.STRING },
            bodyFont: { type: Type.STRING }
          }
        }
      }
    });
    themeConfig = JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Theme analysis failed:", error);
    // Fallback config
    themeConfig = {
      visualDescription: description + " " + colors,
      textColor: "#1e293b",
      backgroundColor: "#ffffff",
      headingFont: "font-serif",
      bodyFont: "font-sans"
    };
  }

  // 2. Generate Background Image using the enhanced visual description
  let bgImage = "";
  try {
    bgImage = await generateMenuBackground(themeConfig.visualDescription);
  } catch (e) {
    console.error("Background image generation failed in full theme flow", e);
    // Use fallback color if image fails
  }

  return {
    backgroundImage: bgImage,
    textColor: themeConfig.textColor,
    backgroundColor: themeConfig.backgroundColor,
    headingFont: themeConfig.headingFont,
    bodyFont: themeConfig.bodyFont
  };
};

// Enhance dish descriptions
export const enhanceDishDescription = async (dishName: string, currentDesc: string, ingredients?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const ingredientContext = ingredients ? `Key ingredients are: ${ingredients}.` : '';
  const prompt = `Write a mouth-watering, appetizing, short description (max 25 words) for a restaurant dish named "${dishName}". ${ingredientContext} Current draft: "${currentDesc}". Make it sound expensive and delicious. Focus on flavor and texture.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
    });
    return response.text?.trim() || currentDesc;
  } catch (error) {
    console.error("Text enhancement failed:", error);
    return currentDesc;
  }
};

// Generate a full menu structure from a restaurant name/vibe
export const generateMenuSuggestions = async (restaurantName: string, cuisine: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Generate a menu for a restaurant named "${restaurantName}" serving ${cuisine} cuisine. 
  Create 2 sections (e.g., Starters, Mains) with 2 dishes each.
  Return JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        price: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Menu suggestion failed:", error);
    throw error;
  }
};