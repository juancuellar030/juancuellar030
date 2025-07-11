// This is your new file: /api/check-story.js

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// --- IMPORTANT ---
// This uses a secure Environment Variable. You must set this in your hosting provider's settings (e.g., Vercel, Netlify).
// DO NOT write your actual token here.
const token = process.env.GITHUB_TOKEN; 

const endpoint = "https://models.github.ai/inference";
const model = "xai/grok-3-mini";

// This is the main function that runs when your frontend calls '/api/check-story'
export default async function handler(request, response) {
    try {
        // Get the student's story from the request sent by the frontend
        const { storyText } = request.body;

        const client = ModelClient(
            endpoint,
            new AzureKeyCredential(token),
        );

        // This is our "prompt engineering" - telling the AI how to behave
        const systemPrompt = `You are a friendly and encouraging English teacher for a 10-year-old student. 
        A student has written the following story. Your task is to:
        1. Check for spelling and grammar mistakes.
        2. Give one simple, positive suggestion for how to make the story more exciting or detailed.
        3. Keep your entire feedback under 50 words.
        Start your feedback with a positive comment like "Great job!" or "Nice story!".`;

        const aiResponse = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: storyText } // Here we use the student's text
                ],
                temperature: 0.7, // A good balance between creative and predictable
                top_p: 1,
                model: model
            }
        });

        if (isUnexpected(aiResponse)) {
            // If the AI model returns an error, we throw it
            throw new Error(aiResponse.body.error?.message || "The AI model returned an unexpected response.");
        }

        const feedback = aiResponse.body.choices[0].message.content;

        // Send the AI's feedback back to the frontend
        response.status(200).json({ feedback: feedback });

    } catch (error) {
        // Send a generic error message back to the frontend if something fails
        response.status(500).json({ error: "An error occurred while getting feedback from the AI." });
    }
}
