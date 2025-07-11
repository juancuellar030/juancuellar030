// This is the corrected code for: /api/check-story.js

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// This securely uses the Environment Variable you set in Netlify
const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "xai/grok-3-mini";

// The handler now only needs the 'request' object
export default async function handler(request) {
    try {
        // Get the student's story from the request body
        const { storyText } = await request.json();

        const client = ModelClient(
            endpoint,
            new AzureKeyCredential(token),
        );

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
                    { role: "user", content: storyText }
                ],
                temperature: 0.7,
                top_p: 1,
                model: model
            }
        });

        if (isUnexpected(aiResponse)) {
            throw new Error(aiResponse.body.error?.message || "The AI model returned an unexpected response.");
        }

        const feedback = aiResponse.body.choices[0].message.content;

        // --- THIS IS THE CORRECTED SUCCESS RESPONSE ---
        // We create a new Response object, stringify the JSON, and set the status and headers.
        return new Response(JSON.stringify({ feedback: feedback }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        // --- THIS IS THE CORRECTED ERROR RESPONSE ---
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
