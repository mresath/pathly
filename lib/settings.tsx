import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from "./useColorScheme";
import i18n, { langResources } from "./i18n";

export enum Settings {
    DARK_MODE = "settings.darkMode",
    LANGUAGE = "settings.language",
}

type SettingsType = {
    [Settings.DARK_MODE]: "light" | "dark" | "system";
    [Settings.LANGUAGE]: keyof typeof langResources | "system"; // e.g., "en", "fr", etc.
}

const defaultSettings: SettingsType = {
    [Settings.DARK_MODE]: "dark",
    [Settings.LANGUAGE]: "system",
};

interface SettingsContextType {
    settings: SettingsType;
    setSetting: (key: Settings, value: string) => void;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    setSetting: () => { },
});

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SettingsType>(defaultSettings);
    const { setColorScheme } = useColorScheme();

    useEffect(() => {
        const loadSettings = async () => {
            const savedSettings = await AsyncStorage.multiGet(Object.values(Settings));
            const parsedSettings = savedSettings.reduce((acc, [key, value]) => {
                if (value) {
                    acc[key as Settings] = JSON.parse(value);
                }
                return acc;
            }, {} as SettingsType);
            setSettings((prev) => ({ ...prev, ...parsedSettings }));
        }

        loadSettings();
    }, []);

    useEffect(() => {
        setColorScheme(settings[Settings.DARK_MODE]);
        if (i18n && settings[Settings.LANGUAGE] === "system") {
            setSetting(Settings.LANGUAGE, i18n.language);
        } else if (i18n && i18n.isInitialized && i18n.language !== settings[Settings.LANGUAGE]) {
            i18n.changeLanguage(settings[Settings.LANGUAGE]);
        }
    }, [settings]);

    const setSetting = (key: Settings, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        AsyncStorage.setItem(key, JSON.stringify(value));
    };

    const saveSettings = () => AsyncStorage.multiSet(Object.entries(settings).map(([key, value]) => [key, JSON.stringify(value)]));

    return (
        <SettingsContext.Provider value={{ settings, setSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};


export const useSettings = () => useContext(SettingsContext);