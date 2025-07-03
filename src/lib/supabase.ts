import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Supabase connection details
const supabaseUrl = 'https://fngvivaphqjleshemsse.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZ3ZpdmFwaHFqbGVzaGVtc3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA2MzA0MDAsImV4cCI6MjAzNjIwNjQwMH0.YOUR_ANON_KEY'; // Replace with your actual anon key

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if a user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Get user profile data
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

// Get user's crypto assets
export const getUserAssets = async (userId: string) => {
  const { data, error } = await supabase
    .from('crypto_assets')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user assets:', error);
    return [];
  }
  
  return data;
};

// Get user's transactions
export const getUserTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
  
  return data;
};

// Get user's positions
export const getUserPositions = async (userId: string) => {
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching user positions:', error);
    return [];
  }
  
  return data;
};