import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Cog } from '~/lib/icons/Cog';
import { House } from '~/lib/icons/House';

export default function TabLayout() {
    const { t } = useTranslation();

    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'white' }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: t("home"),
                    tabBarIcon: ({ color }) => <House color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: t("settings"),
                    tabBarIcon: ({ color }) => <Cog color={color} />,
                }}
            />
        </Tabs>
    )
}
