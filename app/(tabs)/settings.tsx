import { Stack } from "expo-router";
import { SafeAreaView, Text, View, Alert } from "react-native";
import { supabase } from "~/lib/supabase";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Pressable } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";

export default function Tab() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        Alert.alert(t("userError"));
      }
    });
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert(t("logoutError"), error.message);
    }
  }

  return (
    <SafeAreaView className="w-full h-full flex items-center justify-center">
      <View className="w-[85%] flex flex-col items-center justify-center">
        <Text className="text-foreground text-2xl font-bold mb-5">{t("loggedInAs")} <Text className="text-primary">{user?.user_metadata?.name}</Text></Text>
        <View className="w-full mb-1 bg-secondary rounded min-h-10 flex justify-center items-center">
          <Pressable
            onPress={() => logout()}
            className="w-full"
          >
            <Text className="text-lg font-bold">{t("logout")}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}