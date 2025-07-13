import React, { useState } from "react";
import { Alert, View } from "react-native";
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { supabase } from "~/lib/supabase";
import { Pressable } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { useColorScheme } from "~/lib/useColorScheme";
import * as Device from 'expo-device';

const iosClientId = process.env.EXPO_PUBLIC_IOS_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;

if (!iosClientId || !androidClientId) {
    throw new Error("Google client ids must be defined in environment variables.");
}

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    const { isDarkColorScheme } = useColorScheme();

    GoogleSignin.configure({
        iosClientId: iosClientId,
    })

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) Alert.alert(t("signInError"), error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) Alert.alert(t("signUpError"), error.message);
        setLoading(false);
    }

    async function signInWithGoogle() {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            if (userInfo && userInfo.data && userInfo.data.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: userInfo.data.idToken,
                });
                console.log(error, data);
            } else {
                throw new Error('no ID token present!');
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                // some other error happened
                //Alert.alert(t("googleSignInError"), error.message || t("unknownError"));
            }
        }
    }

    return (
        <View className="h-full w-full items-center justify-center p-4">
            <Stack.Screen options={{ headerShown: true, title: t("login") }} />
            <View className="w-[85%] flex flex-col items-center justify-center">
                <View className="w-full mb-3 min-h-10 flex justify-center items-center">
                    <GoogleSigninButton
                        size={GoogleSigninButton.Size.Wide}
                        color={isDarkColorScheme ? GoogleSigninButton.Color.Light : GoogleSigninButton.Color.Dark}
                        onPress={() => signInWithGoogle()}
                    />
                </View>
                <Input
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder={t("emailPlaceholder")}
                    autoCapitalize={"none"}
                    className="w-full mb-1 min-h-10"
                />
                <Input
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder={t("passwordPlaceholder")}
                    autoCapitalize={"none"}
                    className="w-full mb-3 min-h-10"
                />
                <View className="w-full mb-1 bg-secondary rounded min-h-10 flex justify-center items-center">
                    <Pressable
                        disabled={loading}
                        onPress={() => signInWithEmail()}
                        className="w-full"
                    >
                        <Text className="text-lg font-bold">{t("signIn")}</Text>
                    </Pressable>
                </View>
                <View className="w-full min-h-10 flex justify-center items-center">
                    <Pressable
                        disabled={loading}
                        onPress={() => signUpWithEmail()}
                        className="w-full"
                    >
                        <Text className="text-primary text-lg font-bold">{t("signUp")}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
