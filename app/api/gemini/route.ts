import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    try {
        const { message, systemPrompt, model, temperature, history } = await request.json();

        if (!message) {
            return NextResponse.json({ error: "No message provided" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Use gemini-2.5-flash (available on your API key)
        const modelName = "gemini-2.5-flash";

        const generativeModel = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt || "You are a helpful voice assistant. Keep responses concise and conversational.",
        });

        // Build conversation history for context
        const historyContext = history
            ?.map((msg: { role: string; content: string }) =>
                `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
            )
            .join("\n") || "";

        const fullPrompt = historyContext
            ? `Previous conversation:\n${historyContext}\n\nUser: ${message}\n\nRespond naturally and conversationally. Keep your response concise (1-3 sentences) since this is a voice conversation.`
            : `User: ${message}\n\nRespond naturally and conversationally. Keep your response concise (1-3 sentences) since this is a voice conversation.`;

        const result = await generativeModel.generateContent({
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            generationConfig: {
                temperature: temperature ?? 0.7,
                maxOutputTokens: 256, // Keep responses short for voice
            },
        });

        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Gemini error:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}
