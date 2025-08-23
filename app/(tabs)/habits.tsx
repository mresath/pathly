import { View, Text, Dimensions } from 'react-native'
import React, { createRef, RefObject, use, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIcon, Habit, Todo, useHabit } from '~/lib/habit';
import { Gesture, GestureDetector, GestureType, Pressable, ScrollView } from 'react-native-gesture-handler';
import { Card, CardDescription, CardTitle } from '~/components/ui/card';
import { DATE_OPTIONS } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { Scan } from '~/lib/icons/Scan';
import { Trash2 } from '~/lib/icons/Trash2';
import { SquarePen } from '~/lib/icons/SquarePen';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useDimensions } from '~/lib/utils';
import { router } from 'expo-router';

export default function Tab() {
  const { t } = useTranslation();
  const { habits, todos } = useHabit();

  const [hdt, setHDT] = useState<Record<string, Habit>>({});

  const itemCount = Object.keys(todos).length + Object.keys(hdt).length + Object.keys(habits).length;
  const panRefs = useRef<RefObject<GestureType>[]>([]);
  if (panRefs.current.length !== itemCount) {
    panRefs.current = Array(itemCount).fill(0).map((_, i) => panRefs.current[i] || createRef<GestureType>());
  }

  return (
    <ScrollView className='pt-6 flex flex-col' simultaneousHandlers={panRefs.current}>
      <Text className="text-2xl text-foreground font-semibold text-center mb-2 underline">{t('todos')}</Text>
      {Object.entries(todos).map(([id, todo], i) => (
        <TodoCard key={id} todo={todo} panRef={panRefs.current[i]} />
      ))}
      {Object.keys(todos).length === 0 && (
        <Text className="text-center text-muted-foreground">{t('noTodos')}</Text>
      )}

      {Object.keys(habits).length > 0 && (
        <>
          <Text className="text-2xl text-foreground font-semibold text-center mb-2 underline mt-6">{t('hdt')}</Text>
          {Object.entries(hdt).map(([id, habit], i) => (
            <HabitCard key={id} habit={habit} panRef={panRefs.current[Object.keys(todos).length + i]} />
          ))}
          {Object.keys(hdt).length === 0 && (
            <Text className="text-center text-muted-foreground">{t('noHDT')}</Text>
          )}
        </>
      )}

      <Text className="text-2xl text-foreground font-semibold text-center mb-2 underline mt-6">{t('allHabits')}</Text>
      {Object.entries(habits).map(([id, habit], i) => (
        <HabitCard key={id} habit={habit} panRef={panRefs.current[Object.keys(todos).length + Object.keys(hdt).length + i]} />
      ))}
      {Object.keys(habits).length === 0 && (
        <Text className="text-center text-muted-foreground">{t('noHabits')}</Text>
      )}
    </ScrollView>
  )
}

const TodoCard = ({ todo, panRef }: { todo: Todo, panRef: RefObject<GestureType | undefined> }) => {
  const { t } = useTranslation();
  const { isDarkColorScheme } = useColorScheme();
  const { activities, removeTodo, logActivity } = useHabit();
  const activity = activities[todo.activityId];
  const { width: screenWidth } = useDimensions();

  const iconColor = isDarkColorScheme ? 'white' : 'black';

  const translateX = useSharedValue(0);
  const editThreshold = screenWidth * 0.2;
  const deleteThreshold = editThreshold * -1;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value < deleteThreshold) {
        translateX.value = withTiming(-screenWidth, {}, () => {
          runOnJS(removeTodo)(todo.id);
        });
      } else if (translateX.value > editThreshold) {
        translateX.value = withTiming(screenWidth, {}, () => {
          translateX.value = withTiming(0);
          runOnJS(router.push)(`/activity/edit/todo/${todo.id}`);
        });
      } else {
        translateX.value = withTiming(0);
      }
    })
    .activateAfterLongPress(100)
    .withRef(panRef);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const rDIconStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(translateX.value < deleteThreshold ? 1 : 0),
    };
  });

  const rEIconStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(translateX.value > editThreshold ? 1 : 0),
    };
  });

  return (
    <View>
      <Animated.View className='absolute h-full w-full bg-destructive flex justify-end items-center flex-row' style={rDIconStyle}>
        <Trash2 className='text-white mr-10' size={30} />
      </Animated.View>
      <Animated.View className='absolute h-full w-full bg-blue-500 flex justify-start items-center flex-row' style={rEIconStyle}>
        <SquarePen className='text-white ml-10' size={30} />
      </Animated.View>
      <GestureDetector gesture={panGesture} touchAction='pan-y'>
        <Animated.View style={rStyle} className="mx-2">
          <Card>
            <View className='flex-row justify-between items-center px-4'>
              <View className='flex flex-row items-center'>
                <View className='mr-4'>
                  <ActivityIcon icon={todo.icon ?? activity?.icon} size={40} color={iconColor} />
                </View>
                <View>
                  <CardTitle>{todo.name ?? activity?.name}</CardTitle>
                  <CardDescription>{t("due")} {todo.due.toLocaleString(undefined, DATE_OPTIONS)}</CardDescription>
                </View>
              </View>

              <Pressable onPress={() => {
                logActivity(todo.activityId);
                removeTodo(todo.id);
              }}>
                <Scan size={30} color={iconColor} />
              </Pressable>
            </View>
          </Card>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const HabitCard = ({ habit, panRef }: { habit: Habit, panRef: RefObject<GestureType | undefined> }) => {
  const { t } = useTranslation();
  const { isDarkColorScheme } = useColorScheme();
  const { activities, removeTodo, logActivity } = useHabit();
  const activity = activities[habit.activityId];
  const { width: screenWidth } = useDimensions();

  const iconColor = isDarkColorScheme ? 'white' : 'black';

  const translateX = useSharedValue(0);
  const editThreshold = screenWidth * 0.2;
  const deleteThreshold = editThreshold * -1;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value < deleteThreshold) {
        translateX.value = withTiming(-screenWidth, {}, () => {
          runOnJS(removeTodo)(habit.id);
        });
      } else if (translateX.value > editThreshold) {
        translateX.value = withTiming(screenWidth, {}, () => {
          translateX.value = withTiming(0);
          runOnJS(router.push)(`/activity/edit/habit/${habit.id}`);
        });
      } else {
        translateX.value = withTiming(0);
      }
    })
    .activateAfterLongPress(100)
    .withRef(panRef);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const rDIconStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(translateX.value < deleteThreshold ? 1 : 0),
    };
  });

  const rEIconStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(translateX.value > editThreshold ? 1 : 0),
    };
  });

  return <></>;
}