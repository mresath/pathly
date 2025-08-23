import { useState, createContext, useEffect, useContext, ReactNode } from "react"
import { Stats, useAuth } from "./auth";
import { getDate } from "./math";
import { supabase } from "./supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stattype } from "./types";
import { RRule } from 'rrule'
import { DEFAULT_ACTIVITIES } from "./constants";
import { icons, LucideIcon, LucideProps } from 'lucide-react-native';
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { View, Text } from "react-native";
import { Sparkles } from "~/lib/icons/Sparkles";
import { Coins } from "~/lib/icons/Coins";

export type ToImp = Exclude<Stattype, 'discipline'>;
export type ActivityType = 'positive' | 'negative';
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type ActIcon = keyof typeof icons;

export const ToImps: ToImp[] = ["physical", "mental", "social", "spiritual", "skill"];
export const ActivityTypes: ActivityType[] = ['positive', 'negative'];
export const Difficulties: Difficulty[] = [1, 2, 3, 4, 5];

export type Activity = {
    id: string;
    name: string;
    description: string;
    icon: ActIcon;
    stats: ToImp[];
    type: ActivityType;
    difficulty: Difficulty;
};

export type Habit = {
    id: string;
    activityId: string;
    neglection: boolean;
    rule: RRule;
    reminder?: RRule;
    name?: string;
    description?: string;
    icon?: ActIcon;
};

export type Todo = {
    id: string;
    activityId: string;
    neglection: boolean;
    due: Date;
    reminder?: Date;
    name?: string;
    description?: string;
    icon?: ActIcon;
}

export type HabitData = {
    [date: string]: {
        habits: {
            [habitId: string]: boolean;
        }
    }
}

interface HabitContextType {
    activities: Record<string, Activity>;
    setActivity: (activityId: string, activity: Activity) => void;
    removeActivity: (activityId: string) => void;
    logActivity: (activityId: string, discipline?: -1 | 0 | 1) => void;
    habits: Record<string, Habit>;
    currentHabits: Record<string, Habit>;
    setHabit: (habitId: string, habit: Habit) => void;
    removeHabit: (habitId: string) => void;
    todos: Record<string, Todo>;
    setTodo: (todoId: string, todo: Todo) => void;
    removeTodo: (todoId: string) => void;
    habitData: HabitData;
    updateHabitData: (habitId: string, value: boolean) => void;
}

interface UserData {
    activities: Record<string, Activity>;
    habits: Record<string, Habit>;
    currentHabits: Record<string, Habit>;
    todos: Record<string, Todo>;
    habitData: HabitData;
    lastUpdated: number;
}

const defaultActivities: Record<string, Activity> = DEFAULT_ACTIVITIES;

const HabitContext = createContext<HabitContextType>({
    activities: defaultActivities,
    setActivity: () => { },
    removeActivity: () => { },
    logActivity: () => { },
    habits: {},
    currentHabits: {},
    setHabit: () => { },
    removeHabit: () => { },
    todos: {},
    setTodo: () => { },
    removeTodo: () => { },
    habitData: {},
    updateHabitData: () => { },
});

export default function HabitProvider({ children }: { children: React.ReactNode }) {
    const { user, addGold, addXP, increaseStat, decreaseStat, updateStats } = useAuth();

    const [activities, setActivities] = useState<Record<string, Activity>>(defaultActivities);
    const [habits, setHabits] = useState<Record<string, Habit>>({});
    const [currentHabits, setCurrentHabits] = useState<Record<string, Habit>>({});
    const [todos, setTodos] = useState<Record<string, Todo>>({});

    const [habitData, setHabitData] = useState<HabitData>({});

    const [remoteLU, setRemoteLU] = useState<number | null>(null);
    const [updateTimeout, setUpdateTimeout] = useState<number | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const lActivities = await AsyncStorage.getItem(`${user.id}-activities`).then((data) => {
                if (!data) return null;
                return JSON.parse(data) as Record<string, Activity>;
            });
            const lHabits = await AsyncStorage.getItem(`${user.id}-habits`).then((data) => {
                if (!data) return null;
                return JSON.parse(data) as Record<string, Habit>;
            });
            const lCurrentHabits = await AsyncStorage.getItem(`${user.id}-currentHabits`).then((data) => {
                if (!data) return null;
                return JSON.parse(data) as Record<string, Habit>;
            });
            const lTodos = await AsyncStorage.getItem(`${user.id}-todos`).then((data) => {
                if (!data) return null;
                return JSON.parse(data, (key, value) => {
                    if (key === "due" || key === "reminder") {
                        return new Date(value);
                    }
                    return value;
                }) as Record<string, Todo>;
            });
            const lHabitData = await AsyncStorage.getItem(`${user.id}-habitData`).then((data) => {
                if (!data) return null;
                return JSON.parse(data) as HabitData;
            });
            const lLastUpdated = await AsyncStorage.getItem(`${user.id}-lastUpdated`).then((data) => {
                if (!data) return null;
                return JSON.parse(data) as number;
            });

            const localData: UserData = {
                activities: lActivities || {},
                habits: lHabits || {},
                currentHabits: lCurrentHabits || {},
                todos: lTodos || {},
                habitData: lHabitData || {},
                lastUpdated: lLastUpdated || 0,
            };

            const { data: luData } = await supabase.from("data").select("lastUpdated").eq("uid", user.id).single();

            if (luData) setRemoteLU(luData.lastUpdated);

            if (!localData) {
                if (!luData) {
                    updateData();
                    return;
                };

                const { data } = await supabase.from("data").select("data").eq("uid", user.id).single();
                if (!data) return;

                const userData: UserData = data.data;
                if (!userData) return;

                setActivities(userData.activities);
                setHabits(userData.habits);
                setCurrentHabits(userData.currentHabits);
                setTodos(userData.todos);
                setHabitData(userData.habitData);
                setRemoteLU(userData.lastUpdated);

                await AsyncStorage.multiSet([
                    [`${user.id}-activities`, JSON.stringify(userData.activities || defaultActivities)],
                    [`${user.id}-habits`, JSON.stringify(userData.habits)],
                    [`${user.id}-currentHabits`, JSON.stringify(userData.currentHabits)],
                    [`${user.id}-todos`, JSON.stringify(userData.todos)],
                    [`${user.id}-habitData`, JSON.stringify(userData.habitData)],
                    [`${user.id}-lastUpdated`, JSON.stringify(userData.lastUpdated)],
                ]);
            } else {
                if (!luData || localData.lastUpdated >= luData.lastUpdated) {
                    setActivities(localData.activities);
                    setHabits(localData.habits);
                    setCurrentHabits(localData.currentHabits);
                    setTodos(localData.todos);
                    setHabitData(localData.habitData);
                    setRemoteLU(localData.lastUpdated);

                    if (luData && localData.lastUpdated > luData.lastUpdated) await supabase.from("data").upsert({ uid: user.id, lastUpdated: localData.lastUpdated, data: localData });
                } else {
                    const { data } = await supabase.from("data").select("data").eq("uid", user.id).single();
                    if (!data) return;

                    const userData: UserData = data.data;
                    if (!userData) return;

                    setActivities(userData.activities || defaultActivities);
                    setHabits(userData.habits || {});
                    setCurrentHabits(userData.currentHabits || {});
                    setTodos(userData.todos || {});
                    setHabitData(userData.habitData || {});
                    setRemoteLU(userData.lastUpdated);

                    await AsyncStorage.multiSet([
                        [`${user.id}-activities`, JSON.stringify(userData.activities)],
                        [`${user.id}-habits`, JSON.stringify(userData.habits)],
                        [`${user.id}-currentHabits`, JSON.stringify(userData.currentHabits)],
                        [`${user.id}-todos`, JSON.stringify(userData.todos)],
                        [`${user.id}-habitData`, JSON.stringify(userData.habitData)],
                        [`${user.id}-lastUpdated`, JSON.stringify(userData.lastUpdated)],
                    ]);
                }
            }
        }

        fetchData();
    }, [user]);

    const updateLocalData = async () => {
        if (!user) return;

        const userData: UserData = {
            activities,
            habits,
            currentHabits,
            todos,
            habitData,
            lastUpdated: getDate(),
        };

        await AsyncStorage.multiSet([
            [`${user.id}-activities`, JSON.stringify(userData.activities)],
            [`${user.id}-habits`, JSON.stringify(userData.habits)],
            [`${user.id}-currentHabits`, JSON.stringify(userData.currentHabits)],
            [`${user.id}-todos`, JSON.stringify(userData.todos)],
            [`${user.id}-habitData`, JSON.stringify(userData.habitData)],
            [`${user.id}-lastUpdated`, JSON.stringify(userData.lastUpdated)],
        ]);
    };

    const updateData = async () => {
        await updateLocalData();

        const createSelfTimeout = (time?: number) => {
            if (updateTimeout) clearTimeout(updateTimeout);
            return setTimeout(() => {
                updateData();
            }, time ?? 300 * 1000);
        };

        if (!user) {
            setUpdateTimeout(createSelfTimeout());
            return;
        };

        const userData: UserData = {
            activities,
            habits,
            currentHabits,
            todos,
            habitData,
            lastUpdated: getDate(),
        };

        var lu = remoteLU;
        if (!remoteLU) {
            const { data } = await supabase.from("data").select("lastUpdated").eq("uid", user.id).single();

            if (!data) {
                setUpdateTimeout(createSelfTimeout());
                return;
            };
            setRemoteLU(data.lastUpdated);
            lu = data.lastUpdated;
        }

        if (!lu) {
            setUpdateTimeout(createSelfTimeout());
            return;
        };

        if (userData.lastUpdated - lu > 600) {
            setRemoteLU(userData.lastUpdated);
            await supabase.from("data").upsert({ uid: user.id, lastUpdated: userData.lastUpdated, data: userData });

            setUpdateTimeout(createSelfTimeout());
            return;
        }

        setUpdateTimeout(createSelfTimeout((600 - (userData.lastUpdated - lu) + 1) * 1000));
    };

    const setActivity = (activityId: string, activity: Activity) => {
        setActivities((prevActivities) => ({
            ...prevActivities,
            [activityId]: activity,
        }));
    };

    const removeActivity = (activityId: string) => {
        setActivities((prevActivities) => {
            const newActivities = { ...prevActivities };
            delete newActivities[activityId];
            return newActivities;
        });
    };

    const setHabit = (habitId: string, habit: Habit) => {
        setHabits((prevHabits) => ({
            ...prevHabits,
            [habitId]: habit,
        }));
        setCurrentHabits((prevCurrent) => ({
            ...prevCurrent,
            [habitId]: habit,
        }));
    };

    const removeHabit = (habitId: string) => {
        setCurrentHabits((prevCurrent) => {
            const newCurrent = { ...prevCurrent };
            delete newCurrent[habitId];
            return newCurrent;
        });
    };

    const setTodo = (todoId: string, todo: Todo) => {
        setTodos((prevTodos) => ({
            ...prevTodos,
            [todoId]: todo,
        }));
    };

    const removeTodo = (todoId: string) => {
        setTodos((prevTodos) => {
            const newTodos = { ...prevTodos };
            delete newTodos[todoId];
            return newTodos;
        });
    };

    const updateHabitData = (habitId: string, value: boolean) => {
        const today = new Date().toLocaleDateString("en-US");
        setHabitData((prevData) => ({
            ...prevData,
            [today]: {
                ...prevData[today],
                [habitId]: value,
            },
        }));
    };

    useEffect(() => {
        updateData();
    }, [activities, habits, currentHabits, todos, habitData]);

    const logActivity = (activityId: string, discipline?: -1 | 0 | 1) => {
        if (!discipline) discipline = 0;
        const activity = activities[activityId];
        var xpGain = 10;
        var goldGain = 20;
        switch (activity.difficulty) {
            case 1:
                xpGain = 2;
                goldGain = 5;
                break;
            case 2:
                xpGain = 5;
                goldGain = 10;
                break;
            case 3:
                xpGain = 10;
                goldGain = 20;
                break;
            case 4:
                xpGain = 17;
                goldGain = 35;
                break;
            case 5:
                xpGain = 25;
                goldGain = 50;
                break;
        }
        if (activity.type === 'negative') {
            xpGain = -xpGain;
            goldGain = 0;
        }
        const newStats: Partial<Stats> = {
            ...addXP?.(xpGain),
            gold: addGold?.(goldGain),
        };
        activity.stats.forEach(stat => {
            newStats[stat] = activity.type === "negative" ? decreaseStat?.(stat, activity.difficulty) : increaseStat?.(stat, activity.difficulty);
        });
        if (discipline !== 0) {
            newStats.discipline = discipline === 1 ? increaseStat?.("discipline", activity.difficulty) : decreaseStat?.("discipline", activity.difficulty);
        }
        updateStats?.(newStats).then(() => {
            toast.success("", {
                position: ToastPosition.BOTTOM,
                customToast: (toast) => {
                    const Indicator = ({ text, icon }: { text: string; icon: ReactNode }) => {
                        return (
                            <View className="flex-row items-center">
                                <Text>{text}</Text>
                                {icon}
                            </View>
                        );
                    }

                    const DiscIcon = statIcon("discipline");

                    return (
                        <View className="flex-row items-center bg-foreground gap-4  px-4 justify-center" style={{
                            height: toast.height,
                            width: toast.width,
                            borderRadius: 8,
                        }}>
                            <Indicator key="xp" text={`${xpGain > 0 ? "+" : ""}${xpGain}`} icon={<Sparkles />} />
                            {goldGain > 0 && (
                                <Indicator key="gold" text={`${goldGain > 0 ? "+" : ""}${goldGain}`} icon={<Coins />} />
                            )}
                            {discipline !== 0 && (
                                <Indicator key="discipline" text={`${discipline === 1 ? "+" : "-"}${activity.difficulty}`} icon={<DiscIcon />} />
                            )}
                            {activity.stats.map((stat) => {
                                const Icon = statIcon(stat);
                                return <Indicator key={stat} text={`${activity.type === "negative" ? "-" : "+"}`} icon={<Icon />} />
                            })}
                        </View>
                    )
                }
            });
        });
    }

    return (
        <HabitContext.Provider value={{
            activities,
            setActivity,
            removeActivity,
            logActivity,
            habits,
            currentHabits,
            setHabit,
            removeHabit,
            todos,
            setTodo,
            removeTodo,
            habitData,
            updateHabitData,
        }}>
            {children}
        </HabitContext.Provider>
    )
}

export const useHabit = () => useContext(HabitContext);

export const ActivityIcon = (props: { icon: ActIcon } & LucideProps) => {
    const Icon = icons[props.icon];
    return <Icon size={props.size} color={props.color} />;
};

export const difficultyColor = (diff: Difficulty) => {
    switch (diff) {
        case 1:
            return "lightgreen";
        case 2:
            return "yellow";
        case 3:
            return "orange";
        case 4:
            return "red";
        case 5:
            return "darkred";
    }
}

export const statIcon = (stat: Stattype): LucideIcon => {
    switch (stat) {
        case "discipline":
            return icons.CalendarDays;
        case "physical":
            return icons.BicepsFlexed;
        case "mental":
            return icons.Brain;
        case "social":
            return icons.Users;
        case "spiritual":
            return icons.Heart;
        case "skill":
            return icons.Wrench;
    }
}

export const statName = (stat: Stattype): string => {
    switch (stat) {
        case "discipline":
            return "Dsc";
        case "physical":
            return "Phy";
        case "mental":
            return "Men";
        case "social":
            return "Scl";
        case "spiritual":
            return "Spr";
        case "skill":
            return "Skl";
    }
}