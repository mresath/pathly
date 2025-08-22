import { View, Text, Alert } from 'react-native'
import { FlatList, Pressable } from 'react-native-gesture-handler';
import { ActivityIcon, useHabit } from '~/lib/habit'
import { useColorScheme } from '~/lib/useColorScheme';
import { Scan } from '~/lib/icons/Scan';
import { Ellipsis } from '~/lib/icons/Ellipsis';
import { SquarePen } from '~/lib/icons/SquarePen';
import { useTranslation } from 'react-i18next';
import { Activity } from '~/lib/icons/Activity';
import { SquarePlus } from '~/lib/icons/SquarePlus';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { Trash2 } from '~/lib/icons/Trash2';
import { NAV_THEME } from '~/lib/constants';
import { router } from 'expo-router';


export default function Tab() {
  const { activities, removeActivity, logActivity } = useHabit();
  const { t } = useTranslation();
  const { isDarkColorScheme } = useColorScheme();
  const iconColor = isDarkColorScheme ? "white" : "black";

  return (
    <View className='flex flex-col h-full w-full'>
      <FlatList className='flex-1' data={Object.entries(activities).map(([key, activity], index, arr) => ({ key, activity, index, length: arr.length }))} renderItem={({ item: item }) => {
        const activity = item.activity;
        return (
          <View key={item.key} className={`w-full ${item.index < item.length - 1 ? "border-b border-border" : ""} p-4 flex-row items-center gap-2`}>
            <ActivityIcon icon={activity.icon} size={20} color={iconColor} />
            <Text className='text-foreground text-lg'>{activity.name}</Text>
            <Pressable style={{ marginLeft: 'auto' }} onPress={() => {
              logActivity(activity.id);
              router.back();
            }}>
              <Scan size={20} color={iconColor} />
            </Pressable>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Ellipsis size={20} color={iconColor} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onPress={() => { 
                  router.push(`activity/edit/${activity.id}`);
                }}>
                  <View className='flex-row items-center gap-2 p-2'>
                    <SquarePen size={16} color={iconColor} />
                    <Text className='text-foreground'>{t("edit")}</Text>
                  </View>
                </DropdownMenuItem>
                <DropdownMenuItem onPress={() => {
                  Alert.alert(
                    t("areYouSure"),
                    t("deleteActivityConfirmation").replace("{{activity}}", activity.name),
                    [
                      {
                        text: t("cancel"),
                        style: "cancel"
                      },
                      {
                        text: t("delete"),
                        style: "destructive",
                        onPress: () => {
                          removeActivity(activity.id);
                        }
                      }
                    ]
                  )
                }}>
                  <View className='flex-row items-center gap-2 p-2'>
                    <Trash2 size={16} color={(isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light).notification} />
                    <Text className='text-destructive'>{t("delete")}</Text>
                  </View>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>
        );
      }} />
      <Pressable onPress={() => {
        router.push("activity/create");
      }}>
        <View className='w-full border-y border-border p-4 flex-row items-center gap-2 mb-6'>
          <Activity size={20} color={iconColor} />
          <Text className='text-foreground text-lg'>{t("addActivity")}</Text>
          <SquarePlus className='ml-auto' size={20} color={iconColor} />
        </View>
      </Pressable>
    </View>
  );
}