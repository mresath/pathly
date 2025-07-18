import { useTranslation } from "react-i18next";
import { View , Text } from "react-native";
import { Button } from "~/components/ui/button";
import { router } from "expo-router";

export default function OnboardingIndex() {
    const { t } = useTranslation();

    return (
        <View className="px-8 h-full justify-center">
            <Text className="text-3xl text-foreground text-center font-bold mb-1">{t("welcome")}</Text>
            <Text className="text-foreground text-center mb-12">{t("welcomeDescription")}</Text>
            <Button className="bg-secondary mx-6" onPress={() => router.push("/onboarding/pinfo")}><Text className="text-white text-xl font-bold">{t("letsGo")}</Text></Button>
        </View>
    )
}
