import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, Bot, Calendar, Clock } from "lucide-react";
import { Conversation, VoiceBot, Message } from "@/types/database";
import { formatDate, formatTime } from "@/lib/utils/date";

interface ConversationWithRelations extends Conversation {
    voice_bots: Pick<VoiceBot, "id" | "name"> | null;
    messages: Pick<Message, "id">[];
}

export default async function ConversationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: conversations } = await supabase
        .from("conversations")
        .select(`
      *,
      voice_bots ( id, name ),
      messages ( id )
    `)
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

    // Group conversations by date
    const groupedConversations: Record<string, ConversationWithRelations[]> = {};
    (conversations as ConversationWithRelations[] | null)?.forEach((conv) => {
        const date = new Date(conv.started_at).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        if (!groupedConversations[date]) {
            groupedConversations[date] = [];
        }
        groupedConversations[date].push(conv);
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
                <p className="text-muted-foreground mt-1">
                    View and review your past conversations
                </p>
            </div>

            {/* Conversations List */}
            {Object.keys(groupedConversations).length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(groupedConversations).map(([date, convs]) => (
                        <div key={date}>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <h2 className="text-sm font-medium text-muted-foreground">
                                    {date}
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {convs.map((conv) => (
                                    <Link key={conv.id} href={`/conversations/${conv.id}`}>
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-lg bg-primary/10">
                                                        <MessageSquare className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <Bot className="w-4 h-4 text-muted-foreground" />
                                                            <p className="font-medium truncate">
                                                                {conv.voice_bots?.name || "Unknown Bot"}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(conv.started_at).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                            <span>
                                                                {conv.messages?.length || 0} messages
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={conv.status === "active" ? "default" : "secondary"}
                                                    >
                                                        {conv.status}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="p-4 rounded-full bg-primary/10 mb-4">
                            <MessageSquare className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm">
                            Start a conversation with one of your voice bots to see it here
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
