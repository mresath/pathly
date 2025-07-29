
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CalendarClock, NotebookPen, Repeat } from 'lucide-react-native';

export default function TabLayout() {
    const { t } = useTranslation();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: 'white',
                tabBarPosition: 'top',
                headerShown: false,
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
            tabBar={(props) => <TopBar {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t("newActivity"),
                    tabBarIcon: ({ color }) => <NotebookPen color={color} />
                }}
            />
            <Tabs.Screen
                name="habit"
                options={{
                    title: t("newHabit"),
                    tabBarIcon: ({ color }) => <Repeat color={color} />
                }}
            />
            <Tabs.Screen
                name="todo"
                options={{
                    title: t("newTodo"),
                    tabBarIcon: ({ color }) => <CalendarClock color={color} />
                }}
            />
        </Tabs>
    )
}

const TopBar = ({ state, navigation, descriptors }: BottomTabBarProps) => {
    const { colors } = useTheme();

    return (
        <View
            className='bg-card flex-row items-center justify-between py-2 border-b border-border'
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <Pressable
                        onPress={onPress}
                        onLongPress={onLongPress}
                        className='flex-1 items-center justify-center p-2'
                        key={route.key}
                    >
                        {options.tabBarIcon && options.tabBarIcon({ color: isFocused ? colors.primary : colors.text, size: 24, focused: isFocused })}
                        <Text style={{ color: isFocused ? colors.primary : colors.text, fontSize: 12 }}>
                            {options.title || route.name}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    )
}