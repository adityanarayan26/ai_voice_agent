import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { audio } = await request.json();

        if (!audio) {
            return NextResponse.json({ error: "No audio provided" }, { status: 400 });
        }

        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Deepgram API key not configured" },
                { status: 500 }
            );
        }

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audio, "base64");

        // Call Deepgram STT API
        const response = await fetch(
            "https://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true",
            {
                method: "POST",
                headers: {
                    Authorization: `Token ${apiKey}`,
                    "Content-Type": "audio/webm",
                },
                body: audioBuffer,
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("Deepgram STT error:", error);
            return NextResponse.json(
                { error: "Speech recognition failed" },
                { status: response.status }
            );
        }

        const result = await response.json();
        const transcript =
            result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

        return NextResponse.json({ transcript });
    } catch (error) {
        console.error("STT error:", error);
        return NextResponse.json(
            { error: "Failed to process audio" },
            { status: 500 }
        );
    }
}
