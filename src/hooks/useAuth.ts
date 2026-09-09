"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types/database";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    async function fetchUserAndProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileData && isMounted) {
            setProfile(profileData as Profile);
          } else if (isMounted) {
            const meta = session.user.user_metadata || {};
            setProfile({
              id: session.user.id,
              nombre: meta.nombre || session.user.email?.split("@")[0] || "Usuario",
              telefono: meta.telefono || null,
              rol: (meta.rol as UserRole) || "cliente",
              created_at: new Date().toISOString(),
            });
          }
        } else if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Error fetching auth profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (profileData && isMounted) {
            setProfile(profileData as Profile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/auth/login");
    router.refresh();
  }, [supabase, router]);

  return {
    user,
    profile,
    rol: profile?.rol || (user?.user_metadata?.rol as UserRole) || null,
    loading,
    signOut,
  };
}
