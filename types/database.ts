export interface SearchSession {
  id: string;
  clerk_id: string;
  filters: Record<string, any>;
  query: string;
  results_count: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      search_sessions: {
        Row: SearchSession;
        Insert: Omit<SearchSession, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SearchSession, 'id'>>;
      };
    };
  };
}
