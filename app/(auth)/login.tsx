import React, { useState } from "react";
import { View } from "react-native";
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { supabase } from "~/lib/supabase";
import { useTranslation } from "react-i18next";
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { useColorScheme } from "~/lib/useColorScheme";
import { Button } from "~/components/ui/button";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { Stack } from "expo-router";

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

        if (error) toast.error(`${t("signInError")}${error.message ? `: ${error.message}` : ""}`, { position: ToastPosition.BOTTOM });
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) toast.error(`${t("signUpError")}${error.message ? `: ${error.message}` : ""}`, { position: ToastPosition.BOTTOM });
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
                throw new Error('No ID token present!');
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
            }
        }
    }

    return (
        <View className="h-full w-full items-center justify-center p-4">
            <Stack.Screen name="" options={{ headerShown: true, title: t("login") }} />
            <View className="w-[85%] flex flex-col items-center justify-center">
                <View className="w-full mb-3 min-h-12 flex justify-center items-center">
                    <GoogleSigninButton
                        size={GoogleSigninButton.Size.Wide}
                        color={isDarkColorScheme ? GoogleSigninButton.Color.Light : GoogleSigninButton.Color.Dark}
                        onPress={() => signInWithGoogle()}
                        style={{ width: '100%' }}
                    />
                </View>
                <Input
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder={t("emailPlaceholder")}
                    autoCapitalize={"none"}
                    className="w-full mb-1 min-h-12"
                />
                <Input
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder={t("passwordPlaceholder")}
                    autoCapitalize={"none"}
                    className="w-full mb-3 min-h-12"
                />
                <Button
                    disabled={loading}
                    onPress={() => signInWithEmail()}
                    className="mb-1 w-full bg-secondary min-h-12"
                >
                    <Text className="text-lg font-bold text-white">{t("signIn")}</Text>
                </Button>
                <Button
                    disabled={loading}
                    onPress={() => signUpWithEmail()}
                    className="mb-1 w-full bg-transparent min-h-12"
                >
                    <Text className="text-lg font-bold text-secondary dark:text-primary">{t("signUp")}</Text>
                </Button>
            </View>
        </View>
    );
}
