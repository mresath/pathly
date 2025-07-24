import { toast, ToastPosition } from '@backpackapp-io/react-native-toast';
import { router, Stack } from 'expo-router'
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { PInfo, Stats, useAuth } from '~/lib/auth';
import { getDate } from '~/lib/math';
import { supabase } from '~/lib/supabase';

export interface OnboardingData {
  username?: string;
  pinfo?: PInfo;
  stats?: Stats;
  setUsername: Dispatch<SetStateAction<string | undefined>>;
  setPInfo: Dispatch<SetStateAction<PInfo | undefined>>;
  setStats: Dispatch<SetStateAction<Stats | undefined>>;
  finishOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingData>({
  setUsername: () => { },
  setPInfo: () => { },
  setStats: () => { },
  finishOnboarding: () => { }
});

export const useOnboard = () => useContext(OnboardingContext);

export default function OnboardingLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [username, setUsername] = useState<string>();
  const [pinfo, setPInfo] = useState<PInfo>();
  const [stats, setStats] = useState<Stats>();

  const finishOnboarding = async () => {
    if (!user) return;

    const { error: userError } = await supabase
      .from("profiles")
      .upsert({ uid: user.id, username });
    if (userError) {
      console.error("Error saving user profile:", userError);
      toast.error(t("onboardError"), { position: ToastPosition.BOTTOM });
      return;
    }

    const { error: pinfoError } = await supabase
      .from("pinfo")
      .upsert(pinfo)
    if (pinfoError) {
      console.error("Error saving personal info:", pinfoError);
      toast.error(t("onboardError"), { position: ToastPosition.BOTTOM });
      return;
    }

    const { error: statsError } = await supabase
      .from("stats")
      .upsert({
        ...stats,
        uid: user.id,
        lastUpdated: getDate(),
      });
    if (statsError) {
      console.error("Error saving stats:", statsError);
      toast.error(t("onboardError"), { position: ToastPosition.BOTTOM });
      return;
    }

    router.replace("/(tabs)");
    toast.success(t("onboardSuccess"), { position: ToastPosition.BOTTOM });
  };

  return (
    <OnboardingContext.Provider value={{
      username,
      pinfo,
      stats,
      setUsername,
      setPInfo,
      setStats,
      finishOnboarding
    }}>
      <Stack screenOptions={{ headerShown: true, title: t("onboarding") }} />
    </OnboardingContext.Provider >
  )
}
