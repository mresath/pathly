import { SafeAreaView, Text, View, Alert } from "react-native";
import { supabase } from "~/lib/supabase";
import { useTranslation } from "react-i18next";
import { useAuth } from "~/lib/auth";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { prettifyTimestamp } from "~/lib/string";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Image as Compressor } from 'react-native-compressor';
import * as FileSystem from 'expo-file-system';
import { Pressable } from "react-native-gesture-handler";
import { decode } from 'base64-arraybuffer'
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";

const userImage = require("~/assets/user.png");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('Supabase url and anon key must be defined in environment variables');
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { user, profile, getProfile } = useAuth();

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
        <View className="w-[70%] aspect-square h-auto mb-2 bg-secondary rounded-full p-2">
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