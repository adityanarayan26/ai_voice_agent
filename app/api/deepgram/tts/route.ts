import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { text, voice } = await request.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Deepgram API key not configured" },
                { status: 500 }
            );
        }

        const voiceModel = voice || "aura-asteria-en";

        // Call Deepgram TTS API
        const response = await fetch(
            `https://api.deepgram.com/v1/speak?model=${voiceModel}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Token ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("Deepgram TTS error:", error);
            return NextResponse.json(
                { error: "Text-to-speech failed" },
                { status: response.status }
            );
        }

        // Get audio as ArrayBuffer
        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/mp3",
            },
        });
    } catch (error) {
        console.error("TTS error:", error);
        return NextResponse.json(
            { error: "Failed to generate speech" },
            { status: 500 }
        );
    }
}
