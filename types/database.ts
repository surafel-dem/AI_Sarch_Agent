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
    }
  }
}
