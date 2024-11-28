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
        }
      }
      profiles: {
        Row: {
          id: string
          avatar_url: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id: string
          avatar_url?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          avatar_url?: string | null
          updated_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
