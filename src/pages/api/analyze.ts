import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { image, apiKey } = data; // image is base64 string

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image is required' }), { status: 400 });
    }

    const key = apiKey || import.meta.env.GEMINI_API_KEY;
    if (!key) {
      return new Response(JSON.stringify({ error: 'API Key is missing' }), { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(key);
    // Use gemini-1.5-flash for speed and cost efficiency
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - date: The date of the transaction (YYYY-MM-DD format). If not found, use today's date.
      - name: The name of the store or vendor. Simplify if too long.
      - currency: The currency symbol or code (e.g., ¥, $, JPY).
      - amount: The total amount paid. Remove commas.

      Example output:
      {
        "date": "2023-10-27",
        "name": "SevenEleven",
        "currency": "¥",
        "amount": "1200"
      }
      
      Only return the JSON object, no markdown code blocks.
    `;

    // Remove header from base64 if present (e.g., "data:image/jpeg;base64,")
    const match = image.match(/^data:(.+);base64,(.+)$/);
    const mimeType = match ? match[1] : "image/jpeg"; // Default to jpeg if no header
    const base64Data = match ? match[2] : image;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up if model includes markdown code blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const json = JSON.parse(cleanText);

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Error analyzing receipt:", error);
    return new Response(JSON.stringify({ error: 'Failed to analyze receipt', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
