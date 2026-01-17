import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Bot, User, Clock, MessageSquare } from "lucide-react";
import { Conversation, VoiceBot, Message } from "@/types/database";
import { formatDateTime, formatTime } from "@/lib/utils/date";

interface ConversationWithBot extends Conversation {
    voice_bots: Pick<VoiceBot, "id" | "name" | "system_prompt"> | null;
}

interface ConversationPageProps {
    params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: conversation, error } = await supabase
        .from("conversations")
        .select(`
      *,
      voice_bots ( id, name, system_prompt )
    `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error || !conversation) {
        notFound();
    }

    const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

    const typedConversation = conversation as ConversationWithBot;
    const typedMessages = messages as Message[] | null;
    const bot = typedConversation.voice_bots;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/conversations">
                        <Button variant="ghost" size="icon" className="cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">Conversation</h1>
                            <Badge variant={typedConversation.status === "active" ? "default" : "secondary"}>
                                {typedConversation.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            with {bot?.name || "Unknown Bot"}
                        </p>
                    </div>
                </div>
                {bot && (
                    <Link href={`/bots/${bot.id}`}>
                        <Button variant={typedConversation.status === "active" ? "default" : "outline"} className="cursor-pointer gap-2">
                            {typedConversation.status === "active" ? (
                                <>
                                    <MessageSquare className="w-4 h-4" />
                                    Resume Conversation
                                </>
                            ) : (
                                <>
                                    <Bot className="w-4 h-4" />
                                    View Bot
                                </>
                            )}
                        </Button>
                    </Link>
                )}
            </div>

            {/* Conversation Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Session Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Started</p>
                            <p className="font-medium">
                                {formatDateTime(typedConversation.started_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Ended</p>
                            <p className="font-medium">
                                {typedConversation.ended_at
                                    ? formatDateTime(typedConversation.ended_at)
                                    : "Ongoing"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Messages</p>
                            <p className="font-medium">{typedMessages?.length || 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Messages */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Messages
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {typedMessages && typedMessages.length > 0 ? (
                        <div className="space-y-4">
                            {typedMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {message.role === "assistant" && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <p
                                            className={`text-xs mt-2 ${message.role === "user"
                                                ? "text-primary-foreground/70"
                                                : "text-muted-foreground"
                                                }`}
                                        >
                                            {formatTime(message.created_at)}
                                        </p>
                                    </div>
                                    {message.role === "user" && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No messages in this conversation
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
