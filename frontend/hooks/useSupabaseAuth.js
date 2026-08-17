import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

function normalizeUser(authUser, username) {
  if (!authUser) return null;

  return {
    id: authUser.id,
    email: authUser.email,
    username:
      username ||
      authUser.user_metadata?.username ||
      authUser.email?.split("@")[0] ||
      "learner",
  };
}

async function getProfile(authUser) {
  if (!authUser) return null;

  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", authUser.id)
    .maybeSingle();

  return normalizeUser(authUser, data?.username);
}

function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      const nextUser = await getProfile(data.session?.user);
      if (active) {
        setUser(nextUser);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(normalizeUser(session.user));
      setLoading(false);

      setTimeout(() => {
        getProfile(session.user).then((profile) => {
          if (active) setUser(profile);
        });
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, []);

  return { user, loading, signOut };
}

export default useSupabaseAuth;
