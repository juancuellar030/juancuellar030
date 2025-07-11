// This is the new, upgraded code for: /api/check-story.js

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "xai/grok-3-mini";

// This is the main function that runs when your frontend calls '/.netlify/functions/check-story'
export default async function handler(request) {
    try {
        const { storyText } = await request.json();

        const client = ModelClient(endpoint, new AzureKeyCredential(token));

        const systemPrompt = `You are an expert Cambridge English examiner providing feedback on a story written by a 10-year-old student for the A2 Flyers test.
        
        First, evaluate the student's story based on the following official scoring rubric:
        - Score 5: Describes a progression of events AND is based on all three pictures AND is easy to understand.
        - Score 4: Describes a progression of events AND is based on all three pictures BUT requires some effort to understand.
        - Score 3: Describes a progression of events AND addresses at least one picture OR addresses all three pictures but is very difficult to understand.
        - Score 2: Includes at least one comprehensible phrase related to the pictures.
        - Score 1: Includes some discernible English words.
        - Score 0: Question unattempted or totally incomprehensible.

        Second, provide brief, helpful, and encouraging feedback (under 50 words) for the student. The feedback should start with a positive comment, then mention one spelling/grammar correction, and one idea to make the story more exciting.

        Your response MUST be a valid JSON object with exactly two keys:
        1. "score": an integer from 0 to 5.
        2. "feedback": a string containing your helpful feedback.
        
        Example response format: {"score": 4, "feedback": "Great start! Remember 'firefighter' is one word. Try describing how the children felt to make it more exciting."}`;

        const aiResponse = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: storyText }
                ],
                temperature: 0.5, // Lower temperature for more consistent scoring
                top_p: 1,
                model: model,
                // Tell the model we want a JSON response
                response_format: { type: "json_object" } 
            }
        });

        if (isUnexpected(aiResponse)) {
            throw new Error(aiResponse.body.error?.message || "The AI model returned an unexpected response.");
        }

        const feedbackJson = aiResponse.body.choices[0].message.content;

        return new Response(feedbackJson, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ score: 0, feedback: `An error occurred: ${error.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
