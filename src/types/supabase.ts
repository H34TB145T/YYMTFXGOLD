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
          username: string
          email: string
          password: string
          full_name: string
          phone: string | null
          role: string
          is_verified: boolean
          balance: number
          usdt_balance: number
          margin_balance: number
          wallet_address: string | null
          created_at: string
          updated_at: string
          last_login: string | null
          login_attempts: number
          last_failed_login: string | null
          two_factor_enabled: boolean
        }
        Insert: {
          id?: string
          username: string
          email: string
          password: string
          full_name: string
          phone?: string | null
          role?: string
          is_verified?: boolean
          balance?: number
          usdt_balance?: number
          margin_balance?: number
          wallet_address?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          login_attempts?: number
          last_failed_login?: string | null
          two_factor_enabled?: boolean
        }
        Update: {
          id?: string
          username?: string
          email?: string
          password?: string
          full_name?: string
          phone?: string | null
          role?: string
          is_verified?: boolean
          balance?: number
          usdt_balance?: number
          margin_balance?: number
          wallet_address?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          login_attempts?: number
          last_failed_login?: string | null
          two_factor_enabled?: boolean
        }
      }
      crypto_assets: {
        Row: {
          id: string
          user_id: string
          coin_id: string
          symbol: string
          name: string
          amount: number
          purchase_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coin_id: string
          symbol: string
          name: string
          amount: number
          purchase_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coin_id?: string
          symbol?: string
          name?: string
          amount?: number
          purchase_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          coin_id: string
          coin_name: string
          coin_symbol: string
          amount: number
          price: number
          total: number
          type: string
          status: string
          wallet_address: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          coin_id: string
          coin_name: string
          coin_symbol: string
          amount: number
          price: number
          total: number
          type: string
          status?: string
          wallet_address?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          coin_id?: string
          coin_name?: string
          coin_symbol?: string
          amount?: number
          price?: number
          total?: number
          type?: string
          status?: string
          wallet_address?: string | null
          timestamp?: string
        }
      }
      positions: {
        Row: {
          id: string
          user_id: string
          coin_id: string
          coin_name: string
          coin_symbol: string
          type: string
          leverage: number
          size: number
          entry_price: number
          liquidation_price: number
          margin: number
          pnl: number
          is_open: boolean
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          coin_id: string
          coin_name: string
          coin_symbol: string
          type: string
          leverage: number
          size: number
          entry_price: number
          liquidation_price: number
          margin: number
          pnl?: number
          is_open?: boolean
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          coin_id?: string
          coin_name?: string
          coin_symbol?: string
          type?: string
          leverage?: number
          size?: number
          entry_price?: number
          liquidation_price?: number
          margin?: number
          pnl?: number
          is_open?: boolean
          timestamp?: string
        }
      }
      admin_wallets: {
        Row: {
          id: string
          network: string
          address: string
          memo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          network: string
          address: string
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          network?: string
          address?: string
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          type: string
          coin_id: string
          coin_symbol: string
          amount: number
          price: number
          total: number
          wallet_address: string
          status: string
          admin_notes: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          coin_id: string
          coin_symbol: string
          amount: number
          price: number
          total: number
          wallet_address: string
          status?: string
          admin_notes?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          coin_id?: string
          coin_symbol?: string
          amount?: number
          price?: number
          total?: number
          wallet_address?: string
          status?: string
          admin_notes?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      otp_codes: {
        Row: {
          id: string
          email: string
          otp: string
          type: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          otp: string
          type: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          otp?: string
          type?: string
          expires_at?: string
          created_at?: string
        }
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          name: string
          display_name: string
          qr_code_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          qr_code_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          qr_code_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}