import { SafeAreaView, Text, View, Alert } from "react-native";
import { supabase } from "~/lib/supabase";
import { useTranslation } from "react-i18next";
import { useAuth } from "~/lib/auth";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { LANGUAGES, prettifyTimestamp } from "~/lib/string";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Image as Compressor } from 'react-native-compressor';
import * as FileSystem from 'expo-file-system';
import { FlatList, Pressable } from "react-native-gesture-handler";
import { decode } from 'base64-arraybuffer'
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { Separator } from "~/components/ui/separator";
import { ToggleGroup, ToggleGroupIcon, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Settings, useSettings } from "~/lib/settings";
import { Sun } from "~/lib/icons/Sun";
import { Moon } from "~/lib/icons/Moon";
import { Cog } from "~/lib/icons/Cog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { langResources } from "~/lib/i18n";

const userImage = require("~/assets/user.png");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('Supabase url and anon key must be defined in environment variables');
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { settings, setSetting } = useSettings();

  const [username, setUsername] = useState(profile?.username || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "");
  useEffect(() => {
    setUsername(profile?.username || "");
    setAvatar(profile?.avatar || userImage);
  }, [profile]);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(t("logoutError"), { position: ToastPosition.BOTTOM });
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
      base64: false,
    });

    if (result && result.assets && result.assets[0].uri) {
      setAvatar(result.assets[0].uri);
    } else {
      toast.error(t("imagePickError"), { position: ToastPosition.BOTTOM });
    }
  };

  const [saving, setSaving] = useState(false);
  const saveProfile = async () => {
    if (!user) throw new Error();
    setSaving(true);

    if (!username.trim()) {
      setSaving(false);
      throw new Error(t("usernameRequired"));
    }

    var avatarUrl = avatar;
    if (avatar.startsWith("file://")) {
      const compressedImage = await Compressor.compress(avatar);
      const base64 = await FileSystem.readAsStringAsync(compressedImage, { encoding: FileSystem.EncodingType.Base64 });
      const extension = compressedImage.split('.').pop() || 'jpg';
      const filename = `${user.id}/${user.id}.${extension}`;
      const { error } = await supabase.storage.from("avatars").upload(filename, decode(base64), {
        upsert: true,
        contentType: `image/${extension}`,
      });
      if (error) {
        setSaving(false);
        throw error;
      }
      avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${filename}`;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        uid: user.id,
        username: username.trim(),
        avatar: avatarUrl || null,
      });

    setSaving(false);
    if (error) {
      throw error;
    } else {
      setUsername(username.trim());
      setAvatar(avatarUrl);
    }
  }

  return (
    <SafeAreaView className="w-full h-full flex items-center justify-center">
      <View className="w-[85%] flex flex-col items-center justify-center">
        <View>
          <Text className="text-2xl text-foreground font-semibold text-center mb-2 underline">{t("theme")}</Text>
          <ToggleGroup
            value={settings[Settings.DARK_MODE]}
            onValueChange={(value?: string) => {
              if (!value) return;
              setSetting(Settings.DARK_MODE, value);
            }}
            type="single"
          >
            <ToggleGroupItem value="light" className="border-2 border-border">
              <ToggleGroupIcon icon={Sun} />
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" className="border-2 border-border">
              <ToggleGroupIcon icon={Moon} />
            </ToggleGroupItem>
            <ToggleGroupItem value="system" className="border-2 border-border">
              <ToggleGroupIcon icon={Cog} />
            </ToggleGroupItem>
          </ToggleGroup>
        </View>

        <View className="mt-4">
          <Text className="text-2xl text-foreground font-semibold text-center mb-2 underline">{t("language")}</Text>
          <Select
            defaultValue={{
              value: settings[Settings.LANGUAGE],
              label:  settings[Settings.LANGUAGE] === "system" ? t("system") : LANGUAGES[settings[Settings.LANGUAGE]],
            }}
            value={{
              value: settings[Settings.LANGUAGE],
              label: settings[Settings.LANGUAGE] === "system" ? t("system") : LANGUAGES[settings[Settings.LANGUAGE]],
            }}
            onValueChange={(value) => {
              setSetting(Settings.LANGUAGE, value?.value || "system");
            }}
            className="w-48"
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t("selectLanguage")}
                className="text-foreground"
              />
            </SelectTrigger>
            <SelectContent>
              <FlatList
                data={[["system"], ...Object.entries(langResources)]}
                renderItem={({ item }) => (
                  <SelectItem
                    value={item[0]}
                    label={item[0] === "system" ? t("system") : LANGUAGES[item[0]]}
                    className="text-foreground"
                  >
                    {item[0] === "system" ? t("system") : LANGUAGES[item[0]]}
                  </SelectItem>
                )}
                keyExtractor={(item) => item[0]}
              />
            </SelectContent>
          </Select>
        </View>

        <Separator className="my-4" />

        <Text className="text-2xl text-foreground font-semibold text-center mb-2 underline">{t("account")}</Text>

        <View className="w-[70%] aspect-square h-auto mb-2 bg-border rounded-full p-[0.325rem]">
          <Pressable onPress={() => pickImage()}>
            <Avatar alt={profile?.username ? `${profile.username}'s Avatar` : "User Avatar"} className="w-full h-full">
              <AvatarImage source={avatar ? { uri: avatar } : userImage} className="w-full" />
            </Avatar>
          </Pressable>
        </View>

        <Input className="max-w-[70%] font-bold text-center" style={{ fontSize: 28 }} value={username} onChangeText={setUsername} />

        <Text className="text-foreground mb-5 mt-1">{`${t("memberSince")} ${user ? prettifyTimestamp(user.created_at) : ""}`}</Text>

        <Button className="w-[70%] bg-secondary min-h-12" onPress={() => {
          if (!saving) {
            toast.promise(
              saveProfile(),
              {
                loading: t("updatingProfile"),
                success: t("updateProfileSuccess"),
                error: (err: Error) => `${t("updateProfileError")}${err.message ? `: ${err.message}` : ""}`,
              },
              {
                position: ToastPosition.BOTTOM
              }
            )
          }
        }}>
          <Text className="text-lg font-bold text-white">{t("updateProfile")}</Text>
        </Button>
        <Button className="w-[70%] bg-transparent min-h-12" onPress={() => logout()}>
          <Text className="text-lg font-bold text-primary">{t("logout")}</Text>
        </Button>
      </View>
    </SafeAreaView >
  );
}