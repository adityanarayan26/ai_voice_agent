"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { VOICE_OPTIONS, MODEL_OPTIONS } from "@/types/database";
import { Loader2, ArrowLeft, Bot, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewBotPage() {
    const [name, setName] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [voiceId, setVoiceId] = useState("aura-asteria-en");
    const [model, setModel] = useState("gemini-1.5-flash");
    const [temperature, setTemperature] = useState([0.7]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter a bot name");
            return;
        }

        if (!systemPrompt.trim()) {
            toast.error("Please enter a system prompt");
            return;
        }

        setIsLoading(true);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in");
                return;
            }

            const { data, error } = await supabase
                .from("voice_bots")
                .insert({
                    user_id: user.id,
                    name: name.trim(),
                    system_prompt: systemPrompt.trim(),
                    voice_id: voiceId,
                    model,
                    temperature: temperature[0],
                })
                .select()
                .single();

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Voice bot created successfully!");
            router.push(`/bots/${data.id}`);
        } catch {
            toast.error("Failed to create bot");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedVoice = VOICE_OPTIONS.find((v) => v.id === voiceId);
    const selectedModel = MODEL_OPTIONS.find((m) => m.id === model);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/bots">
                    <Button variant="ghost" size="icon" className="cursor-pointer">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Create Voice Bot</h1>
                    <p className="text-muted-foreground">
                        Configure your new voice AI agent
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Bot Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Customer Support Agent"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="systemPrompt">System Prompt</Label>
                            <Textarea
                                id="systemPrompt"
                                placeholder="You are a helpful customer support agent. Be friendly, professional, and concise in your responses..."
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                disabled={isLoading}
                                rows={5}
                            />
                            <p className="text-xs text-muted-foreground">
                                Define how your bot should behave and respond to users.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Voice Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Voice & Model Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Voice</Label>
                            <Select value={voiceId} onValueChange={setVoiceId}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {VOICE_OPTIONS.map((voice) => (
                                        <SelectItem key={voice.id} value={voice.id}>
                                            {voice.name} ({voice.gender}, {voice.accent})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedVoice && (
                                <p className="text-xs text-muted-foreground">
                                    {selectedVoice.gender} voice with {selectedVoice.accent} accent
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>AI Model</Label>
                            <Select value={model} onValueChange={setModel}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MODEL_OPTIONS.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name} - {m.description}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedModel && (
                                <p className="text-xs text-muted-foreground">
                                    {selectedModel.description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Temperature</Label>
                                <span className="text-sm font-medium">{temperature[0]}</span>
                            </div>
                            <Slider
                                value={temperature}
                                onValueChange={setTemperature}
                                min={0}
                                max={1}
                                step={0.1}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Lower values make responses more focused, higher values make them
                                more creative.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/bots" className="flex-1">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full cursor-pointer"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        className="flex-1 cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Bot"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
