export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      voice_bots: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          system_prompt: string;
          voice_id: string;
          model: string;
          temperature: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          system_prompt: string;
          voice_id?: string;
          model?: string;
          temperature?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          system_prompt?: string;
          voice_id?: string;
          model?: string;
          temperature?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "voice_bots_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      conversations: {
        Row: {
          id: string;
          bot_id: string;
          user_id: string;
          started_at: string;
          ended_at: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          bot_id: string;
          user_id: string;
          started_at?: string;
          ended_at?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          bot_id?: string;
          user_id?: string;
          started_at?: string;
          ended_at?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_bot_id_fkey";
            columns: ["bot_id"];
            referencedRelation: "voice_bots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type VoiceBot = Database['public']['Tables']['voice_bots']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];

export type NewVoiceBot = Database['public']['Tables']['voice_bots']['Insert'];
export type UpdateVoiceBot = Database['public']['Tables']['voice_bots']['Update'];
export type NewConversation = Database['public']['Tables']['conversations']['Insert'];
export type NewMessage = Database['public']['Tables']['messages']['Insert'];

// Voice options
export const VOICE_OPTIONS = [
  { id: 'aura-asteria-en', name: 'Asteria', gender: 'Female', accent: 'American' },
  { id: 'aura-luna-en', name: 'Luna', gender: 'Female', accent: 'American' },
  { id: 'aura-stella-en', name: 'Stella', gender: 'Female', accent: 'American' },
  { id: 'aura-athena-en', name: 'Athena', gender: 'Female', accent: 'British' },
  { id: 'aura-hera-en', name: 'Hera', gender: 'Female', accent: 'American' },
  { id: 'aura-orion-en', name: 'Orion', gender: 'Male', accent: 'American' },
  { id: 'aura-arcas-en', name: 'Arcas', gender: 'Male', accent: 'American' },
  { id: 'aura-perseus-en', name: 'Perseus', gender: 'Male', accent: 'American' },
  { id: 'aura-angus-en', name: 'Angus', gender: 'Male', accent: 'Irish' },
  { id: 'aura-orpheus-en', name: 'Orpheus', gender: 'Male', accent: 'American' },
  { id: 'aura-helios-en', name: 'Helios', gender: 'Male', accent: 'British' },
  { id: 'aura-zeus-en', name: 'Zeus', gender: 'Male', accent: 'American' },
] as const;

export const MODEL_OPTIONS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast & efficient' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: 'Latest model' },
] as const;
