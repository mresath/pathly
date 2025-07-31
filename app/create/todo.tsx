import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Input } from '~/components/ui/input'
import { ActIcon, useHabit, ActivityIcon, Todo } from '~/lib/habit';
import { useColorScheme } from '~/lib/useColorScheme';
import { idFromName } from '~/lib/string';
import { router } from 'expo-router';
import { toast, ToastPosition } from '@backpackapp-io/react-native-toast';
import { useTranslation } from 'react-i18next';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { icons } from 'lucide-react-native';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
import { ChevronRight } from '~/lib/icons/ChevronRight';
import { Cog } from '~/lib/icons/Cog';
import { range } from '~/lib/math';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { FlatList } from 'react-native-gesture-handler';
import DatePicker from 'react-native-date-picker';
import { DATE_OPTIONS, NAV_THEME } from '~/lib/constants';
import { Checkbox } from '~/components/ui/checkbox';
import { XCircle } from '~/lib/icons/XCircle';
import { Info } from '~/lib/icons/Info';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

export default function Create() {
  const { activities, todos, setTodo } = useHabit();
  const { t } = useTranslation();
  const { isDarkColorScheme } = useColorScheme();
  const iconColor = isDarkColorScheme ? "white" : "black";

  const [activityId, setActivityId] = useState<string>(Object.keys(activities)[0] || "");
  const activity = useMemo(() => activities[activityId], [activityId, activities]);

  const [name, setName] = useState(activity?.name || t("newAct"));
  const [description, setDescription] = useState(activity?.description || "");
  const [icon, setIcon] = useState<ActIcon>(activity?.icon || "Activity");
  const [neglection, setNeglection] = useState<boolean>(true);
  const [date, setDate] = useState<Date>(new Date(new Date(new Date().setMinutes(Math.round(new Date().getMinutes() / 5) * 5, 0) + 24 * 60 * 60 * 1000)));
  const [reminder, setReminder] = useState<Date>();

  useEffect(() => {
    setName(activity?.name || t("newAct"));
    setDescription(activity?.description || "");
    setIcon(activity?.icon || "Activity");
  }, [activity]);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const iconsPerPage = 20;
  const pagesDisplayed = 3;
  const [timeout, setTimeoutState] = useState<number>();
  const [data, setData] = useState<string[]>(Object.keys(icons).filter(key => key.toLowerCase().includes(search.toLowerCase())).slice((page - 1) * iconsPerPage, page * iconsPerPage));
  const [numPages, setNumPages] = useState(Math.ceil(Object.keys(icons).length / iconsPerPage));
  useEffect(() => {
    clearTimeout(timeout);

    setTimeoutState(setTimeout(() => {
      const filtered = Object.keys(icons).filter(key => key.toLowerCase().includes(search.toLowerCase()));
      setNumPages(Math.ceil(filtered.length / iconsPerPage));
      setData(filtered.slice((page - 1) * iconsPerPage, page * iconsPerPage));
    }, 300));
  }, [search, page]);
  useEffect(() => {
    if (!open) {
      setSearch("");
      setPage(1);
    }
  }, [open]);
  const secondPageLeft = pagesDisplayed + 2;
  const lastPageLeft = (numPages - (pagesDisplayed + 1)) % pagesDisplayed === 1 ? numPages - pagesDisplayed : (Math.ceil((numPages - (pagesDisplayed + 1)) / pagesDisplayed) - 1) * pagesDisplayed + (pagesDisplayed + 1) + 1;
  const left = (Math.ceil((page - (pagesDisplayed + 1)) / pagesDisplayed) - 1) * pagesDisplayed + (pagesDisplayed + 1) + 1;

  const handleSubmit = () => {
    const id = idFromName(name, Object.keys(todos));
    const newTodo: Todo = {
      id: idFromName(name, Object.keys(todos)),
      activityId,
      name: name !== activity.name ? name : undefined,
      description: name !== activity.description ? description : undefined,
      icon: name !== activity.icon ? icon : undefined,
      neglection: neglection,
      due: date,
      reminder: reminder,
    };
    setTodo(id, newTodo);
    router.dismiss();
    toast.success(t("todoCreated").replace("{{todo}}", name), { position: ToastPosition.BOTTOM });
  }

  const [dateOpen, setDateOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
 
  return (
    <View className='p-4 flex flex-col h-full items-center'>
      <DatePicker 
        modal
        open={dateOpen}
        date={date}
        onConfirm={(date) => {
          setDate(new Date(date.setSeconds(0)));
          setReminder(undefined);
          setDateOpen(false);
        }}
        onCancel={() => setDateOpen(false)}
        mode="datetime"
        minuteInterval={5}
        minimumDate={new Date(new Date().setMinutes(Math.ceil(new Date().getMinutes() / 5) * 5, 0))}
        maximumDate={new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000)}
        title={null}
      />
      <DatePicker 
        modal
        open={reminderOpen}
        date={reminder || new Date(date.getTime() - 24 * 60 * 60 * 1000)}
        onConfirm={(date) => {
          setReminder(new Date(date.setSeconds(0)));
          setReminderOpen(false);
        }}
        onCancel={() => setReminderOpen(false)}
        mode="datetime"
        minuteInterval={5}
        minimumDate={new Date(new Date().setMinutes(Math.ceil(new Date().getMinutes() / 5) * 5, 0))}
        maximumDate={date}
        title={null}
      />
      <Text className='text-center text-2xl text-foreground font-bold mb-2'>{t("tiedActivity")}</Text>
      <View className='w-full flex-row items-center justify-between'>
        <Select
          defaultValue={{
            value: activityId,
            label: activity?.name || t("selectActivity")
          }}
          value={{
            value: activityId,
            label: activity?.name || t("selectActivity")
          }}
          onValueChange={(value) => setActivityId(value?.value || "")}
          className='flex-1'
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t("selectActivity")}
              className='text-foreground'
            />
          </SelectTrigger>
          <SelectContent>
            <FlatList
              data={Object.entries(activities)}
              keyExtractor={(item) => item[0]}
              renderItem={({ item }) => (
                <SelectItem
                  value={item[0]}
                  label={item[1].name}
                  className='text-foreground'
                >
                  {item[1].name}
                </SelectItem>
              )}
            />
          </SelectContent>
        </Select>

        <Pressable className='mx-4' onPress={() => {
          router.push(`/activity/edit/${activityId}`);
        }}>
          <Cog size={20} color={iconColor} />
        </Pressable>
      </View>

      <Separator className="my-4" />

      <View className='flex-row items-center w-full'>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className='p-4 border-border border rounded'>
            <ActivityIcon icon={icon} size={91} color={iconColor} />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className='flex-row items-center justify-between w-4/5'>
              <DialogTitle className='mr-auto'>{t("selectIcon")}</DialogTitle>
            </DialogHeader>
            <Input
              className='w-full mt-2'
              placeholder={t("search")}
              value={search}
              onChangeText={(val) => {
                setSearch(val);
                setPage(1);
              }}
            />
            <View className='flex flex-row flex-wrap justify-center gap-4 p-2 border border-border rounded my-2'>
              {data.length > 0 ? data.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => {
                    setIcon(key as ActIcon);
                    setOpen(false);
                  }}
                  className={`p-2 rounded ${icon === key ? 'bg-secondary' : ''}`}
                >
                  <ActivityIcon icon={key as ActIcon} size={40} color={iconColor} />
                </Pressable>
              )) : <Text className='text-foreground text-lg font-semibold'>{t("noIconsFound")}</Text>}
            </View>
            <View className='flex flex-row items-center mb-2 gap-4 justify-center'>
              <Pressable
                key={"prev"}
                disabled={page <= 1}
                onPress={() => setPage(page - 1)}
              >
                <ChevronLeft size={20} color={page > 1 ? iconColor : 'gray'} />
              </Pressable>
              {numPages > pagesDisplayed + 1 ? (
                page < lastPageLeft ? (
                  page < secondPageLeft ? (
                    <>
                      {range(1, numPages + 1).slice(0, pagesDisplayed + 1).map((i) => (
                        <Pressable
                          key={i}
                          disabled={page === i}
                          onPress={() => setPage(i)}
                        >
                          <Text className={`text-foreground p-2 rounded ${page === i ? 'bg-secondary' : ''}`}>{i}</Text>
                        </Pressable>
                      ))}
                      <Text className='text-foreground font-semibold'>...</Text>
                      <Pressable
                        key={numPages}
                        onPress={() => setPage(numPages)}
                      >
                        <Text className='text-foreground p-2 rounded'>{numPages}</Text>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Pressable
                        key={1}
                        onPress={() => setPage(1)}
                      >
                        <Text className='text-foreground p-2 rounded'>{1}</Text>
                      </Pressable>
                      <Text className='text-foreground font-semibold'>...</Text>
                      {range(left, numPages + 1).slice(0, pagesDisplayed).map((i) => (
                        <Pressable
                          key={i}
                          disabled={page === i}
                          onPress={() => setPage(i)}
                        >
                          <Text className={`text-foreground p-2 rounded ${page === i ? 'bg-secondary' : ''}`}>{i}</Text>
                        </Pressable>
                      ))}
                      <Text className='text-foreground font-semibold'>...</Text>
                      <Pressable
                        key={numPages}
                        onPress={() => setPage(numPages)}
                      >
                        <Text className='text-foreground p-2 rounded'>{numPages}</Text>
                      </Pressable>
                    </>
                  )
                ) : (
                  <>
                    <Pressable
                      key={1}
                      onPress={() => setPage(1)}
                    >
                      <Text className='text-foreground p-2 rounded'>{1}</Text>
                    </Pressable>
                    <Text className='text-foreground font-semibold'>...</Text>
                    {range(lastPageLeft, numPages + 1).slice(0, pagesDisplayed + 1).map((i) => (
                      <Pressable
                        key={i}
                        disabled={page === i}
                        onPress={() => setPage(i)}
                      >
                        <Text className={`text-foreground p-2 rounded ${page === i ? 'bg-secondary' : ''}`}>{i}</Text>
                      </Pressable>
                    ))}
                  </>
                )
              ) : (
                range(1, numPages + 1).map((i) => (
                  <Pressable
                    key={i}
                    disabled={page === i}
                    onPress={() => setPage(i)}
                  >
                    <Text className={`text-foreground p-2 rounded ${page === i ? 'bg-secondary' : ''}`}>{i}</Text>
                  </Pressable>
                ))
              )}
              <Pressable
                key={"next"}
                disabled={page >= numPages}
                onPress={() => setPage(page + 1)}
              >
                <ChevronRight size={20} color={page < numPages ? iconColor : 'gray'} />
              </Pressable>
            </View>
            <DialogFooter>
              <DialogClose asChild>
                <Button className='bg-secondary'>
                  <Text className='text-white font-semibold'>{t("cancel")}</Text>
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <View className='flex-1 h-full'>
          <Input className='w-full' value={name} onChangeText={setName} placeholder={t("name")} />
          <Textarea className='w-full' value={description} onChangeText={setDescription} placeholder={t("description")} multiline numberOfLines={3} maxLength={200} />
        </View>
      </View>

      <View className='flex-row items-center mt-4'>
        <Text className='text-foreground text-xl font-semibold'>{t("due")} </Text>
        <Pressable onPress={() => setDateOpen(true)}>
          <Text className='text-secondary dark:text-primary text-xl font-semibold underline'>{date.toLocaleString(undefined, DATE_OPTIONS)}</Text>
        </Pressable>
      </View>

      {reminder ? (
        <View className='flex-row items-center mt-4'>
          <Text className='text-foreground text-xl font-semibold'>{t("reminderOn")} </Text>
          <Pressable onPress={() => setReminderOpen(true)}>
            <Text className='text-secondary dark:text-primary text-xl font-semibold underline'>{reminder.toLocaleString(undefined, DATE_OPTIONS)}</Text>
          </Pressable>
          <Pressable className='ml-2' onPress={() => setReminder(undefined)}>
            <XCircle color={iconColor} size={20} />
          </Pressable>
        </View>
      ) : (
        <View className='flex-row items-center mt-4'>
          <Pressable onPress={() => setReminderOpen(true)}>
            <Text className='text-secondary dark:text-primary text-xl font-semibold underline'>{t("setReminder")}</Text>
          </Pressable>
        </View>
      )}

      <View className='flex-row items-center mt-4'>
        <Text className='text-foreground text-xl font-semibold mr-1'>{t("neglection")}</Text>
        <Popover>
          <PopoverTrigger>
            <Info size={20} color={iconColor} />
          </PopoverTrigger>
          <PopoverContent>
            <Text className='text-foreground'>{t("neglectionInfo")}</Text>
          </PopoverContent>
        </Popover>
        <Checkbox className='ml-5' checked={neglection} onCheckedChange={setNeglection} />
      </View>

      <Button
        className='w-full mt-auto mb-10 bg-secondary'
        onPress={handleSubmit}
      >
        <Text className='text-white'>
          {t("done")}
        </Text>
      </Button>
    </View>
  )
}