import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { House } from '~/lib/icons/House';
import { Cog } from '~/lib/icons/Cog';
import { router } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';

export default function TabLayout() {
    const { t } = useTranslation();
    const { isDarkColorScheme } = useColorScheme();

    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'white', headerRight: () => <Pressable onPress={() => router.push('/settings')}><Cog color={isDarkColorScheme ? 'white' : 'black'} /></Pressable> }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: t("home"),
                    tabBarIcon: ({ color }) => <House color={color} />,
                }}
            />
        </Tabs>
    )
}
