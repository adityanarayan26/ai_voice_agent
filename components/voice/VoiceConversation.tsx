"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { VoiceBot } from "@/types/database";
import {
    Mic,
    MicOff,
    Square,
    Loader2,
    Volume2,
    User,
    Bot,
} from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface VoiceConversationProps {
    bot: VoiceBot;
}

export default function VoiceConversation({ bot }: VoiceConversationProps) {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [transcript, setTranscript] = useState("");
    const [status, setStatus] = useState<"idle" | "listening" | "processing" | "speaking">("idle");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // Resume active conversation on mount
    useEffect(() => {
        const loadActiveConversation = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check for existing active conversation
            const { data: existingConv } = await supabase
                .from("conversations")
                .select("id")
                .eq("bot_id", bot.id)
                .eq("user_id", user.id)
                .eq("status", "active")
                .order("started_at", { ascending: false })
                .limit(1)
                .single();

            if (existingConv) {
                setConversationId(existingConv.id);
                // Load messages for this conversation
                const { data: msgs } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("conversation_id", existingConv.id)
                    .order("created_at", { ascending: true });

                if (msgs) {
                    setMessages(msgs.map(m => ({
                        role: m.role as "user" | "assistant",
                        content: m.content,
                        timestamp: new Date(m.created_at)
                    })));
                }
            }
        };

        loadActiveConversation();
    }, [bot.id]);

    // Start a new conversation
    const startConversation = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please log in to start a conversation");
                return null;
            }

            // Double check if we already have an ID (should catch race conditions)
            if (conversationId) return conversationId;

            // Check for existing active conversation in DB (in case useEffect hasn't loaded it yet)
            const { data: existingConv } = await supabase
                .from("conversations")
                .select("id")
                .eq("bot_id", bot.id)
                .eq("user_id", user.id)
                .eq("status", "active")
                .limit(1)
                .single();

            if (existingConv) {
                setConversationId(existingConv.id);
                return existingConv.id;
            }

            const { data, error } = await supabase
                .from("conversations")
                .insert({
                    bot_id: bot.id,
                    user_id: user.id,
                    status: "active",
                })
                .select()
                .single();

            if (error) throw error;
            setConversationId(data.id);
            return data.id;
        } catch (error) {
            console.error("Failed to start conversation:", error);
            toast.error("Failed to start conversation");
            return null;
        }
    };

    // Save message to database
    const saveMessage = async (convId: string, role: "user" | "assistant", content: string) => {
        try {
            await supabase.from("messages").insert({
                conversation_id: convId,
                role,
                content,
            });
        } catch (error) {
            console.error("Failed to save message:", error);
        }
    };

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                stream.getTracks().forEach(track => track.stop());
                await processAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsListening(true);
            setStatus("listening");
            setTranscript("");
        } catch (error) {
            console.error("Failed to start recording:", error);
            toast.error("Failed to access microphone. Please allow microphone access.");
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    // Process audio through Deepgram STT -> Gemini -> Deepgram TTS
    const processAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setStatus("processing");

        let convId = conversationId;
        if (!convId) {
            convId = await startConversation();
            if (!convId) {
                setIsProcessing(false);
                setStatus("idle");
                return;
            }
        }

        try {
            // Convert blob to base64
            const reader = new FileReader();
            const base64Audio = await new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    resolve(base64.split(",")[1]); // Remove data URL prefix
                };
                reader.readAsDataURL(audioBlob);
            });

            // Step 1: Speech to Text
            const sttResponse = await fetch("/api/deepgram/stt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio: base64Audio }),
            });

            if (!sttResponse.ok) throw new Error("STT failed");
            const { transcript: userText } = await sttResponse.json();

            if (!userText || userText.trim() === "") {
                toast.error("Could not understand audio. Please try again.");
                setIsProcessing(false);
                setStatus("idle");
                return;
            }

            setTranscript(userText);

            // Add user message
            const userMessage: Message = {
                role: "user",
                content: userText,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, userMessage]);
            await saveMessage(convId, "user", userText);

            // Step 2: Get LLM response
            const llmResponse = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userText,
                    systemPrompt: bot.system_prompt,
                    model: bot.model,
                    temperature: bot.temperature,
                    history: messages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            if (!llmResponse.ok) throw new Error("LLM failed");
            const { response: aiText } = await llmResponse.json();

            // Add assistant message
            const assistantMessage: Message = {
                role: "assistant",
                content: aiText,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            await saveMessage(convId, "assistant", aiText);

            // Step 3: Text to Speech
            setIsSpeaking(true);
            setStatus("speaking");

            const ttsResponse = await fetch("/api/deepgram/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: aiText,
                    voice: bot.voice_id,
                }),
            });

            if (!ttsResponse.ok) throw new Error("TTS failed");
            const audioArrayBuffer = await ttsResponse.arrayBuffer();
            const audioUrl = URL.createObjectURL(new Blob([audioArrayBuffer], { type: "audio/mp3" }));

            // Play audio
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.onended = () => {
                    setIsSpeaking(false);
                    setStatus("idle");
                    URL.revokeObjectURL(audioUrl);
                };
                await audioRef.current.play();
            }
        } catch (error) {
            console.error("Processing error:", error);
            toast.error("Failed to process your message. Please try again.");
            setIsSpeaking(false);
        } finally {
            setIsProcessing(false);
            if (!isSpeaking) setStatus("idle");
        }
    };

    // End conversation
    const endConversation = async () => {
        // Stop recording if active
        if (isListening) {
            stopRecording();
        }

        // Stop audio playback immediately
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsSpeaking(false);
        }

        if (conversationId) {
            await supabase
                .from("conversations")
                .update({ status: "ended", ended_at: new Date().toISOString() })
                .eq("id", conversationId);
        }
        setConversationId(null);
        setMessages([]);
        setTranscript("");
        setStatus("idle");
        toast.success("Conversation ended");
    };

    // Toggle recording
    const toggleRecording = useCallback(() => {
        if (isListening) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isListening]);

    const getStatusText = () => {
        switch (status) {
            case "listening":
                return "Listening...";
            case "processing":
                return "Processing...";
            case "speaking":
                return "Speaking...";
            default:
                return "Click to speak";
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case "listening":
                return "bg-red-500";
            case "processing":
                return "bg-yellow-500";
            case "speaking":
                return "bg-blue-500";
            default:
                return "bg-muted";
        }
    };

    return (
        <div className="flex flex-col h-[500px]">
            {/* Hidden audio element */}
            <audio ref={audioRef} className="hidden" />

            {/* Status bar */}
            <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${status !== "idle" ? "animate-pulse" : ""}`} />
                <span className="text-sm text-muted-foreground">{getStatusText()}</span>
                {status === "speaking" && <Volume2 className="w-4 h-4 text-blue-500 animate-pulse" />}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Mic className="w-12 h-12 mb-4 opacity-20" />
                        <p>Start speaking to begin a conversation</p>
                        <p className="text-sm">Click the microphone button below</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {message.role === "assistant" && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-50 mt-1">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                            {message.role === "user" && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Live transcript */}
            {transcript && status !== "idle" && (
                <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm">
                    <p className="text-muted-foreground text-xs mb-1">You said:</p>
                    <p>{transcript}</p>
                </div>
            )}

            <Separator className="mb-4" />

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <Button
                    size="lg"
                    variant={isListening ? "destructive" : "default"}
                    className={`w-16 h-16 rounded-full cursor-pointer ${isListening ? "animate-pulse" : ""}`}
                    onClick={toggleRecording}
                    disabled={isProcessing || isSpeaking}
                >
                    {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isListening ? (
                        <MicOff className="w-6 h-6" />
                    ) : (
                        <Mic className="w-6 h-6" />
                    )}
                </Button>

                {messages.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={endConversation}
                        className="cursor-pointer"
                    >
                        <Square className="w-4 h-4 mr-2" />
                        End
                    </Button>
                )}
            </div>
        </div>
    );
}
