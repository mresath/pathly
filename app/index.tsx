import { router } from 'expo-router'
import { useEffect } from 'react'
import { supabase } from '~/lib/supabase';

export default function AppIndex() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/(tabs)/");
      } else {
        console.log("No user");
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/(tabs)/");
      } else {
        console.log("No user");
        router.replace("/(auth)/login/");
      }
    });
  }, []);
}
