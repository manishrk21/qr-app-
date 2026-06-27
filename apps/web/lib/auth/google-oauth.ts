/**
 * Google OAuth Integration
 * Requires Supabase Auth configured with Google provider
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface GoogleAuthConfig {
  redirectTo: string; // Post-auth redirect URL
}

/**
 * Get Google OAuth URL
 * This initiates the Google login flow
 */
export async function getGoogleAuthUrl(config: GoogleAuthConfig) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: config.redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent"
        }
      }
    });

    if (error) {
      console.error("Google OAuth error:", error);
      return null;
    }

    return data.url;
  } catch (error) {
    console.error("Exception in getGoogleAuthUrl:", error);
    return null;
  }
}

/**
 * Handle Google OAuth callback
 */
export async function handleGoogleCallback(code: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth exchange error:", error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error("Exception in handleGoogleCallback:", error);
    return null;
  }
}

/**
 * Sign out user
 */
export async function signOutUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception in signOutUser:", error);
    return false;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch (error) {
    console.error("Exception in getCurrentUser:", error);
    return null;
  }
}

/**
 * Create or get restaurant admin from Google account
 */
export async function createAdminFromGoogle(
  googleUser: any,
  restaurantId: string
) {
  try {
    const supabase = createSupabaseAdminClient();
    const repository = require("@/lib/supabase-repository").createRepositoryFromAdmin();

    // Check if admin exists
    const { data: existing, error: checkError } = await supabase
      .from("restaurant_admins")
      .select("*")
      .eq("user_id", googleUser.id)
      .eq("restaurant_id", restaurantId)
      .single();

    if (existing) {
      return existing;
    }

    // Create new admin
    const { data: newAdmin, error: createError } = await supabase
      .from("restaurant_admins")
      .insert({
        restaurant_id: restaurantId,
        user_id: googleUser.id,
        email: googleUser.email,
        full_name: googleUser.user_metadata?.full_name || googleUser.email
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating admin:", createError);
      return null;
    }

    return newAdmin;
  } catch (error) {
    console.error("Exception in createAdminFromGoogle:", error);
    return null;
  }
}
