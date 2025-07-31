import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Input } from '~/components/ui/input'
import { ActIcon, ActivityType, Difficulty, ToImp, useHabit, ActivityIcon, Activity, difficultyColor, ToImps, Difficulties, statIcon, statName } from '~/lib/habit';
import { useColorScheme } from '~/lib/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';
import { toast, ToastPosition } from '@backpackapp-io/react-native-toast';
import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupIcon, ToggleGroupItem } from '~/components/ui/toggle-group';
import { Textarea } from '~/components/ui/textarea';
import { Minus } from '~/lib/icons/Minus';
import { Plus } from '~/lib/icons/Plus';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { icons } from 'lucide-react-native';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
import { ChevronRight } from '~/lib/icons/ChevronRight';
import { range } from '~/lib/math';


export default function Create() {
  const { id } = useLocalSearchParams<{id: string}>();
  const { activities, setActivity } = useHabit();
  const activity = activities[id];
  const { t } = useTranslation();
  const { isDarkColorScheme } = useColorScheme();
  const iconColor = isDarkColorScheme ? "white" : "black";

  const [name, setName] = useState(activity.name);
  const [description, setDescription] = useState(activity.description);
  const [icon, setIcon] = useState<ActIcon>(activity.icon);
  const [stats, setStats] = useState<ToImp[]>(activity.stats);
  const [type, setType] = useState<ActivityType>(activity.type);
  const [diffValue, setDiffValue] = useState<string>(activity.difficulty.toString());
  const difficulty = parseInt(diffValue[0]) as Difficulty;

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
    const newActivity: Activity = {
      id,
      name,
      description,
      icon,
      stats,
      type,
      difficulty,
    };
    setActivity(id, newActivity);
    router.dismiss();
    toast.success(t("activityEdited").replace("{{activity}}", name), { position: ToastPosition.BOTTOM });
  }

  return (
    <View className='p-4 flex flex-col h-full items-center'>
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
      <Text className='mt-4 mb-2 text-center text-2xl text-foreground font-bold'>{t("type")}</Text>
      <ToggleGroup
        value={type}
        onValueChange={(val) => {
          if (val) setType(val as ActivityType);
        }}
        type='single'
      >
        <ToggleGroupItem
          value='negative'
          aria-label='Negative'
          className='border-2 border-foreground'
        >
          <ToggleGroupIcon icon={Minus} size={20} color={iconColor} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value='positive'
          aria-label='Positive'
          className='border-2 border-foreground'
        >
          <ToggleGroupIcon icon={Plus} size={20} color={iconColor} />
        </ToggleGroupItem>
      </ToggleGroup>
      <Text className='mt-4 mb-2 text-center text-2xl text-foreground font-bold'>{t("stats")}</Text>
      <ToggleGroup
        value={stats.map(stat => stat as string)}
        onValueChange={(val) => {
          if (val.length > 2) {
            toast.error(t("maxStatsError"), { position: ToastPosition.BOTTOM });
          } else {
            setStats(val.map(v => v as ToImp));
          }
        }}
        type='multiple'
      >
        {ToImps.map((stat) => {
          return (
            <ToggleGroupItem
              key={stat}
              value={stat}
              aria-label={stat}
              className='border-2 border-foreground'
            >
              <ToggleGroupIcon icon={statIcon(stat)} size={20} color={iconColor} />
              <Text className='text-center text-foreground text-xs font-semibold'>{statName(stat)}</Text>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
      <Text className='mt-4 mb-2 text-center text-2xl text-foreground font-bold'>{t("difficulty")}</Text>
      <ToggleGroup
        value={diffValue}
        onValueChange={(val) => {
          if (val) setDiffValue(val);
        }}
        type='single'
      >
        {Difficulties.map((i) => {
          return (
            <ToggleGroupItem
              key={i}
              value={`${i}`}
              aria-label={`Difficulty ${i}`}
              className={`border-2`}
              style={{
                borderColor: difficultyColor(i),
              }}
            >
              <Text className='text-center text-2xl font-bold absolute' style={{ color: difficultyColor(i) }}>{i}</Text>
              <Text className='text-center text-transparent pointer-events-none text-xs font-semibold'>aaa</Text>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      <Button
        className='w-full mt-auto mb-10 bg-secondary'
        onPress={handleSubmit}
        disabled={!name || !description || !icon || !type || !difficulty}
      >
        <Text className='text-white'>
          {t("done")}
        </Text>
      </Button>
    </View>
  )
}