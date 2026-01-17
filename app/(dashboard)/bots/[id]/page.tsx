import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Settings, Mic, MessageSquare } from "lucide-react";
import { VOICE_OPTIONS, MODEL_OPTIONS } from "@/types/database";
import VoiceConversation from "@/components/voice/VoiceConversation";
import { formatDate } from "@/lib/utils/date";

interface BotPageProps {
    params: Promise<{ id: string }>;
}

export default async function BotPage({ params }: BotPageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        notFound();
    }

    const { data: bot, error } = await supabase
        .from("voice_bots")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error || !bot) {
        notFound();
    }

    const selectedVoice = VOICE_OPTIONS.find((v) => v.id === bot.voice_id);
    const selectedModel = MODEL_OPTIONS.find((m) => m.id === bot.model);

    // Get conversation count
    const { count: conversationCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("bot_id", bot.id);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/bots">
                        <Button variant="ghost" size="icon" className="cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{bot.name}</h1>
                        <p className="text-muted-foreground text-sm">
                            Created {formatDate(bot.created_at)}
                        </p>
                    </div>
                </div>
                <Link href={`/bots/${bot.id}/edit`}>
                    <Button variant="outline" className="cursor-pointer gap-2">
                        <Settings className="w-4 h-4" />
                        Edit Bot
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Bot Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Voice</p>
                                <Badge variant="secondary">
                                    {selectedVoice?.name} ({selectedVoice?.accent})
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Model</p>
                                <Badge variant="secondary">{selectedModel?.name}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Temperature</p>
                                <Badge variant="secondary">{bot.temperature}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Conversations</p>
                                <Badge variant="secondary">{conversationCount || 0}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">System Prompt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{bot.system_prompt}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Voice Conversation */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Mic className="w-5 h-5" />
                                Voice Conversation
                            </CardTitle>
                            <Link href={`/conversations?bot=${bot.id}`}>
                                <Button variant="ghost" size="sm" className="cursor-pointer gap-1">
                                    <MessageSquare className="w-4 h-4" />
                                    View History
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <VoiceConversation bot={bot} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
