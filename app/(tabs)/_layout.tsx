import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { House } from '~/lib/icons/House';
import { Cog } from '~/lib/icons/Cog';
import { router } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { User } from '~/lib/icons/User';
import { Coins } from '~/lib/icons/Coins';
import { Gem } from '~/lib/icons/Gem';
import { CheckSquare } from '~/lib/icons/CheckSquare';
import { Gamepad } from '~/lib/icons/Gamepad';
import TabBar from '~/components/tabbar';
import { Text, View } from 'react-native';
import { useAuth } from '~/lib/auth';

export default function TabLayout() {
    const { t } = useTranslation();
    const { stats } = useAuth();
    const { isDarkColorScheme } = useColorScheme();
    const iconColor = isDarkColorScheme ? 'white' : 'black';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: 'white',
                headerRight: () => <Pressable className='mr-5' onPress={() => router.push('/settings')}><Cog color={iconColor} /></Pressable>,
                animation: 'shift',
                transitionSpec: {
                    animation: "spring",
                    config: {
                        stiffness: 1000,
                        damping: 100,
                        mass: 3,
                    },
                },
                headerLeft: () => (
                    <View className='flex-row gap-4 items-center ml-5'>
                        <View className='flex-row items-center'>
                            <Coins color={iconColor} size={20} />
                            <Text className='text-foreground font-semibold'>{stats?.gold}</Text>
                        </View>
                        <View className='flex-row items-center'>
                            <Gem color={iconColor} size={20} />
                            <Text className='text-foreground font-semibold'>{stats?.gems}</Text>
                        </View>
                    </View>
                ),

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
