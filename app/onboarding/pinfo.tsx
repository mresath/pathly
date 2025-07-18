import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useOnboard } from "./_layout";
import { useAuth } from "~/lib/auth";
import { router } from "expo-router";

export default function OnboardingPInfo() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const { username: oUsername, pinfo: oPInfo, setUsername: setOUsername, setPInfo } = useOnboard();

    const [username, setUsername] = useState(oUsername || "");
    const [name, setName] = useState(oPInfo?.name || "");
    const [age, setAge] = useState(oPInfo?.age || -1);
    const [gender, setGender] = useState(oPInfo?.gender);

    const handleNext = () => {
        if (!user) return;

        if (!username) {
            toast.error(t("usernameRequired"), { position: ToastPosition.BOTTOM });
            return;
        }
        if (!name) {
            toast.error(t("fullnameRequired"), { position: ToastPosition.BOTTOM });
            return;
        }
        if (age < 14) {
            toast.error(t("minage"), { position: ToastPosition.BOTTOM });
            return;
        }
        if (!gender) {
            toast.error(t("genderRequired"), { position: ToastPosition.BOTTOM });
            return;
        }

        // TODO: ToS etc. checks

        setOUsername(username);
        setPInfo({
            uid: user?.id,
            name,
            age,
            gender
        });

        router.push("/onboarding/stats");
    }

    return (
        <View className="px-8 h-full justify-center">
            <Text className="text-foreground text-center font-bold text-3xl mb-1">{t("pinfo")}</Text>
            <Text className="text-foreground text-center">{t("pinfoDescription")}</Text>
            <View className="gap-2 mt-10 mx-6 mb-4">
                <Input className="text-lg" placeholder={t("username")} value={username} onChangeText={setUsername} />
                <Input className="text-lg" placeholder={t("fullname")} value={name} onChangeText={setName} />
                <Input
                    className="text-lg"
                    placeholder={t("age")}
                    inputMode="numeric"
                    keyboardType="number-pad"
                    value={age === -1 ? "" : age.toString()}
                    onChange={(e) => {
                        const value = e.nativeEvent.text;
                        if (value === "") {
                            setAge(-1);
                        } else {
                            const parsedValue = parseInt(value);
                            if (!isNaN(parsedValue)) {
                                setAge(parsedValue);
                            }
                        }
                    }}
                />
                <Select
                    value={gender ? {
                        value: gender,
                        label: t(gender)
                    } : undefined}
                    onValueChange={(value) => setGender(value?.value)}
                >
                    <SelectTrigger>
                        <SelectValue
                            className={`text-lg ${gender ? 'text-foreground' : 'text-gray-400'}`}
                            placeholder={t("gender")}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem label={t("male")} value="male">
                                {t("male")}
                            </SelectItem>
                            <SelectItem label={t("female")} value="female">
                                {t("female")}
                            </SelectItem>
                            <SelectItem label={t("other")} value="other">
                                {t("other")}
                            </SelectItem>
                            <SelectItem label={t("pnts")} value="pnts">
                                {t("pnts")}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </View>

            {/* TODO: ToS Privacy Policy etc. */}

            <Button className="bg-secondary mx-6 mt-8" onPress={handleNext}><Text className="text-white text-xl font-bold">{t("next")}</Text></Button>
        </View>
    )
}
