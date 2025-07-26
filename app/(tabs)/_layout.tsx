import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { House } from '~/lib/icons/House';
import { Cog } from '~/lib/icons/Cog';
import { router } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { User } from '~/lib/icons/User';
import { CheckSquare } from '~/lib/icons/CheckSquare';
import { Gamepad } from '~/lib/icons/Gamepad';
import TabBar from '~/components/tabbar';

export default function TabLayout() {
    const { t } = useTranslation();
    const { isDarkColorScheme } = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: 'white',
                headerRight: () => <Pressable className='mr-5' onPress={() => router.push('/settings')}><Cog color={isDarkColorScheme ? 'white' : 'black'} /></Pressable>,
                animation: 'shift',
                transitionSpec: {
                    animation: "spring",
                    config: {
                        stiffness: 1000,
                        damping: 100,
                        mass: 3,
                    },
                },

            }}
            tabBar={(props) => <TabBar {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t("home"),
                    tabBarIcon: ({ color }) => <House color={color} />,
                }}
            />
            <Tabs.Screen
                name="habits"
                options={{
                    title: t("habits"),
                    tabBarIcon: ({ color }) => <CheckSquare color={color} />,
                }}
            />
            <Tabs.Screen
                name="game"
                options={{
                    title: t("rpg"),
                    tabBarIcon: ({ color }) => <Gamepad color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t("profile"),
                    tabBarIcon: ({ color }) => <User color={color} />,
                }}
            />
        </Tabs>
    )
}
