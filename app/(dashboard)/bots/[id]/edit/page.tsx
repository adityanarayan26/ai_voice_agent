"use client";

import { useState, useEffect } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { VOICE_OPTIONS, MODEL_OPTIONS, VoiceBot, UpdateVoiceBot } from "@/types/database";
import { Loader2, ArrowLeft, Bot, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface EditBotPageProps {
    params: Promise<{ id: string }>;
}

export default function EditBotPage({ params }: EditBotPageProps) {
    const { id } = use(params);
    const [bot, setBot] = useState<VoiceBot | null>(null);
    const [name, setName] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [voiceId, setVoiceId] = useState("aura-asteria-en");
    const [model, setModel] = useState("gemini-1.5-flash");
    const [temperature, setTemperature] = useState([0.7]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchBot = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please log in");
                router.push("/login");
                return;
            }
            const { data, error } = await supabase
                .from("voice_bots")
                .select("*")
                .eq("id", id)
                .eq("user_id", user.id)
                .single();

            if (error || !data) {
                toast.error("Bot not found");
                router.push("/bots");
                return;
            }

            const botData = data as VoiceBot;
            setBot(botData);
            setName(botData.name);
            setSystemPrompt(botData.system_prompt);
            setVoiceId(botData.voice_id);
            setModel(botData.model);
            setTemperature([botData.temperature]);
            setIsFetching(false);
        };

        fetchBot();
    }, [id, router, supabase]);

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
            const { error } = await supabase
                .from("voice_bots")
                .update({
                    name: name.trim(),
                    system_prompt: systemPrompt.trim(),
                    voice_id: voiceId,
                    model,
                    temperature: temperature[0],
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Bot updated successfully!");
            router.push(`/bots/${id}`);
        } catch {
            toast.error("Failed to update bot");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from("voice_bots")
                .delete()
                .eq("id", id);

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Bot deleted successfully");
            router.push("/bots");
        } catch {
            toast.error("Failed to delete bot");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const selectedVoice = VOICE_OPTIONS.find((v) => v.id === voiceId);
    const selectedModel = MODEL_OPTIONS.find((m) => m.id === model);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/bots/${id}`}>
                        <Button variant="ghost" size="icon" className="cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Voice Bot</h1>
                        <p className="text-muted-foreground">Update your bot configuration</p>
                    </div>
                </div>

                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="cursor-pointer gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Voice Bot</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete &quot;{bot?.name}&quot;? This action cannot
                                be undone. All conversations associated with this bot will also be
                                deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="cursor-pointer"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Delete Bot"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                                placeholder="You are a helpful customer support agent..."
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                disabled={isLoading}
                                rows={5}
                            />
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
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href={`/bots/${id}`} className="flex-1">
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
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
