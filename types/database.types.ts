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
          type: 'bank' | 'cash' | 'credit_card' | 'loan' | 'savings' | 'investment' | 'equity' | 'other'
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
          type: 'bank' | 'cash' | 'credit_card' | 'loan' | 'savings' | 'investment' | 'equity' | 'other'
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
          type?: 'bank' | 'cash' | 'credit_card' | 'loan' | 'savings' | 'investment' | 'equity' | 'other'
          institution?: string | null
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          workspace_id: string
          parent_id: string | null
          name: string
          icon: string | null
          color: string | null
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          parent_id?: string | null
          name: string
          icon?: string | null
          color?: string | null
          is_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          parent_id?: string | null
          name?: string
          icon?: string | null
          color?: string | null
          is_system?: boolean
          created_at?: string
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
          category_id: string | null
          amount: number
          currency: string
          direction: 'debit' | 'credit'
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          account_id: string
          category_id?: string | null
          amount: number
          currency?: string
          direction: 'debit' | 'credit'
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          account_id?: string
          category_id?: string | null
          amount?: number
          currency?: string
          direction?: 'debit' | 'credit'
          created_at?: string
        }
      }
      loan_amortizations: {
        Row: {
          id: string
          loan_account_id: string
          ledger_transaction_id: string
          operation_type: string
          principal_paid: number
          interest_paid: number
          interest_category_id: string | null
          commission_paid: number
          commission_category_id: string | null
          total_paid: number
          remaining_principal: number
          created_at: string
        }
        Insert: {
          id?: string
          loan_account_id: string
          ledger_transaction_id: string
          operation_type: string
          principal_paid: number
          interest_paid: number
          interest_category_id?: string | null
          commission_paid?: number
          commission_category_id?: string | null
          total_paid: number
          remaining_principal: number
          created_at?: string
        }
        Update: {
          id?: string
          loan_account_id?: string
          ledger_transaction_id?: string
          operation_type?: string
          principal_paid?: number
          interest_paid?: number
          interest_category_id?: string | null
          commission_paid?: number
          commission_category_id?: string | null
          total_paid?: number
          remaining_principal?: number
          created_at?: string
        }
      }
    }
    Enums: {
      workspace_type: 'personal' | 'family' | 'team'
      workspace_role: 'owner' | 'admin' | 'editor' | 'viewer'
      account_type: 'bank' | 'cash' | 'credit_card' | 'loan' | 'savings' | 'investment' | 'equity' | 'other'
      transaction_type: 'income' | 'expense' | 'transfer' | 'card_payment' | 'loan_payment' | 'adjustment'
      transaction_status: 'pending' | 'confirmed' | 'cancelled'
      entry_direction: 'debit' | 'credit'
      recurrence_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    }
    Functions: {
      get_user_workspace_role: {
        Args: { target_workspace_id: string }
        Returns: 'owner' | 'admin' | 'editor' | 'viewer'
      }
      fn_create_financial_transaction: {
        Args: {
          p_workspace_id: string
          p_type: 'income' | 'expense' | 'transfer' | 'card_payment' | 'loan_payment' | 'adjustment'
          p_description: string
          p_transaction_date: string
          p_merchant: string | null
          p_entries: Json
        }
        Returns: string
      }
      fn_register_loan_payment: {
        Args: {
          p_workspace_id: string
          p_loan_account_id: string
          p_source_account_id: string
          p_equity_account_id: string
          p_principal_paid: number
          p_interest_paid: number
          p_commission_paid: number
          p_interest_category_id: string
          p_commission_category_id: string | null
          p_transaction_date: string
          p_description: string
        }
        Returns: string
      }
    }
  }
}
