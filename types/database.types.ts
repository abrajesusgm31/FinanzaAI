export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          type: 'personal' | 'family' | 'team'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: 'personal' | 'family' | 'team'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'personal' | 'family' | 'team'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          joined_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          workspace_id: string
          name: string
          type: 'bank' | 'cash' | 'credit_card' | 'loan' | 'savings' | 'investment' | 'other'
          institution: string | null
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          type: 'bank' | 'cash' | 'credit_card' | 'loan' | 'savings' | 'investment' | 'other'
          institution?: string | null
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          type?: 'bank' | 'cash' | 'credit_card' | 'loan' | 'savings' | 'investment' | 'other'
          institution?: string | null
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ledger_transactions: {
        Row: {
          id: string
          workspace_id: string
          type: 'income' | 'expense' | 'transfer' | 'card_payment' | 'loan_payment' | 'adjustment'
          status: 'pending' | 'confirmed' | 'cancelled'
          transaction_date: string
          description: string
          merchant: string | null
          category_id: string | null
          import_session_id: string | null
          is_recurring_generated: boolean
          created_by: string
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          type: 'income' | 'expense' | 'transfer' | 'card_payment' | 'loan_payment' | 'adjustment'
          status?: 'pending' | 'confirmed' | 'cancelled'
          transaction_date?: string
          description: string
          merchant?: string | null
          category_id?: string | null
          import_session_id?: string | null
          is_recurring_generated?: boolean
          created_by: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          type?: 'income' | 'expense' | 'transfer' | 'card_payment' | 'loan_payment' | 'adjustment'
          status?: 'pending' | 'confirmed' | 'cancelled'
          transaction_date?: string
          description?: string
          merchant?: string | null
          category_id?: string | null
          import_session_id?: string | null
          is_recurring_generated?: boolean
          created_by?: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ledger_entries: {
        Row: {
          id: string
          transaction_id: string
          account_id: string
          amount: number
          currency: string
          direction: 'debit' | 'credit'
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          account_id: string
          amount: number
          currency?: string
          direction: 'debit' | 'credit'
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          account_id?: string
          amount?: number
          currency?: string
          direction?: 'debit' | 'credit'
          created_at?: string
        }
      }
    }
    Functions: {
      fn_create_financial_transaction: {
        Args: {
          p_workspace_id: string
          p_type: string
          p_description: string
          p_transaction_date: string
          p_category_id: string | null
          p_merchant: string | null
          p_entries: Json
        }
        Returns: string
      }
    }
  }
}
