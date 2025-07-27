import { View, Text } from 'react-native'
import React from 'react'
import { useHabit } from '~/lib/habit';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function Edit() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activities, todos } = useHabit();
  const todo = todos[id];
  const activity = activities[todo.activityId];

  return (
    <View>
      <Text>Edit</Text>
    </View>
  );
}