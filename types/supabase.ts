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
      users: {
        Row: {
          id: string
          email: string | null
          last_seen_at: string | null
          total_conversations: number | null
          total_searches: number | null
          created_at: string | null
          updated_at: string | null
          avatar_url: string | null
          message_count: number | null
          token_usage: number | null
          subscription_tier: string | null
          subscription_status: string | null
        }
        Insert: {
          id: string
          email?: string | null
          last_seen_at?: string | null
          total_conversations?: number | null
          total_searches?: number | null
          created_at?: string | null
          updated_at?: string | null
          avatar_url?: string | null
          message_count?: number | null
          token_usage?: number | null
          subscription_tier?: string | null
          subscription_status?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          last_seen_at?: string | null
          total_conversations?: number | null
          total_searches?: number | null
          created_at?: string | null
          updated_at?: string | null
          avatar_url?: string | null
          message_count?: number | null
          token_usage?: number | null
          subscription_tier?: string | null
          subscription_status?: string | null
        }
      }
      search_sessions: {
        Row: {
          session_id: string
          clerk_id: string | null
          search_params: Json
          results: Json | null
          ai_insights: Json | null
          status: string
          total_results: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          session_id?: string
          clerk_id?: string | null
          search_params: Json
          results?: Json | null
          ai_insights?: Json | null
          status?: string
          total_results?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          session_id?: string
          clerk_id?: string | null
          search_params?: Json
          results?: Json | null
          ai_insights?: Json | null
          status?: string
          total_results?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
