import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, View, Text, LayoutChangeEvent } from 'react-native';
import { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

export default function TabBar(props: BottomTabBarProps) {
    const { state, navigation, descriptors } = props;
    const { colors } = useTheme();

    const [dimensions, setDimensions] = useState({ width: 20, height: 100 });
    const buttonWidth = dimensions.width / state.routes.length;

    const onTabBarLayout = (e: LayoutChangeEvent) => {
        setDimensions({
            height: e.nativeEvent.layout.height,
            width: e.nativeEvent.layout.width
        })
    };

    const tabPosX = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: tabPosX.value + 12.5 }],
        };
    });

    return (
        <View className='absolute bottom-8 flex flex-row justify-center items-center gap-4 mx-4'>
            <View
                className="flex flex-1 flex-row justify-between items-center bg-card rounded-full py-2 elevation-2 border-border border"
                style={{
                    shadowColor: colors.card,
                    shadowOffset: { width: 0, height: 10 },
                    shadowRadius: 10,
                    shadowOpacity: 0.1,
                }}
                onLayout={onTabBarLayout}
            >
                <Animated.View
                    key="indicator"
                    className="absolute bg-foreground rounded-full"
                    style={[animatedStyle, { height: dimensions.height - 15, width: buttonWidth - 25, top: 7.5 }]}
                />
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        tabPosX.value = withSpring(buttonWidth * index, { duration: 1500 });

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
                        <TabBarButton
                            key={route.key}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            isFocused={isFocused}
                            icon={options.tabBarIcon}
                            label={options.title || route.name}
                            color={isFocused ? colors.card : colors.text}
                        />
                    );
                })}
            </View>

            <Pressable
                className='h-full aspect-square w-auto bg-card rounded-full flex items-center justify-center elevation-2 border border-border'
                onPress={() => router.push('/create')}
            >
                <Plus
                    color={colors.text}
                    size={40}
                    strokeWidth={1.5}
                />
            </Pressable>
        </View>
    );
}

interface TabBarButtonProps {
    onPress: () => void;
    onLongPress: () => void;
    isFocused: boolean;
    icon?: (props: { color: string; size: number; focused: boolean }) => React.ReactNode;
    label: string;
    color: string;
}

const TabBarButton = ({ onPress, onLongPress, isFocused, icon, label, color }: TabBarButtonProps) => {
    const scale = useSharedValue(0);
    useEffect(() => {
        scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
    }, [scale, isFocused]);

    const animatedTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scale.value, [0, 1], [1, 0]);

        return {
            opacity
        };
    });

    const animatedIconStyle = useAnimatedStyle(() => {
        const size = interpolate(scale.value, [0, 1], [1, 1.2]);
        const top = interpolate(scale.value, [0, 1], [0, 9]);

        return {
            transform: [{ scale: size }],
            top
        };
    });

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            className='flex-1 items-center justify-center p-2'
        >
            {icon && (
                <Animated.View
                    style={[animatedIconStyle]}
                >
                    {icon({ color, size: 24, focused: isFocused })}
                </Animated.View>
            )}
            <Animated.Text style={[{ color, fontSize: 12 }, animatedTextStyle]}>
                {label}
            </Animated.Text>
        </Pressable>
    );
}