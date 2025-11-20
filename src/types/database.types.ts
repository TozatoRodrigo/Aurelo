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
          id: string
          full_name: string | null
          avatar_url: string | null
          role: string | null
          monthly_goal: number | null
          weekly_hours_limit: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          monthly_goal?: number | null
          weekly_hours_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          monthly_goal?: number | null
          weekly_hours_limit?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      work_relations: {
        Row: {
          id: string
          user_id: string
          institution_name: string
          contract_type: 'CLT' | 'PJ' | 'Informal'
          hourly_rate: number | null
          standard_shift_value: number | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          institution_name: string
          contract_type: 'CLT' | 'PJ' | 'Informal'
          hourly_rate?: number | null
          standard_shift_value?: number | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          institution_name?: string
          contract_type?: 'CLT' | 'PJ' | 'Informal'
          hourly_rate?: number | null
          standard_shift_value?: number | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shifts: {
        Row: {
          id: string
          user_id: string
          work_relation_id: string | null
          start_time: string
          end_time: string
          status: 'scheduled' | 'completed' | 'cancelled'
          estimated_value: number | null
          is_manual_entry: boolean | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          work_relation_id?: string | null
          start_time: string
          end_time: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          estimated_value?: number | null
          is_manual_entry?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          work_relation_id?: string | null
          start_time?: string
          end_time?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          estimated_value?: number | null
          is_manual_entry?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shift_swaps: {
        Row: {
          id: string
          user_id: string
          shift_id: string | null
          swap_type: 'offer' | 'request' | 'exchange'
          desired_date: string | null
          desired_institution_id: string | null
          status: 'open' | 'matched' | 'completed' | 'cancelled'
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shift_id?: string | null
          swap_type: 'offer' | 'request' | 'exchange'
          desired_date?: string | null
          desired_institution_id?: string | null
          status?: 'open' | 'matched' | 'completed' | 'cancelled'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shift_id?: string | null
          swap_type?: 'offer' | 'request' | 'exchange'
          desired_date?: string | null
          desired_institution_id?: string | null
          status?: 'open' | 'matched' | 'completed' | 'cancelled'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      swap_interests: {
        Row: {
          id: string
          swap_id: string
          interested_user_id: string
          message: string | null
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          swap_id: string
          interested_user_id: string
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          swap_id?: string
          interested_user_id?: string
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
