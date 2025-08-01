import { useState, createContext, useEffect, useContext } from "react"
import { useAuth } from "./auth";
import { getDate } from "./math";
import { supabase } from "./supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stattype } from "./types";
import { RRule } from 'rrule'
import { DEFAULT_ACTIVITIES } from "./constants";
import { icons, LucideIcon, LucideProps } from 'lucide-react-native';

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
        calculated: boolean;
        habits: {
            [habitId: string]: boolean;
        }
    }
}

interface HabitContextType {
    activities: Record<string, Activity>;
    setActivity: (activityId: string, activity: Activity) => void;
    removeActivity: (activityId: string) => void;
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
    const { user } = useAuth();

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
            const localData = await AsyncStorage.multiGet([
                `${user.id}-activities`,
                `${user.id}-habits`,
                `${user.id}-currentHabits`,
                `${user.id}-todos`,
                `${user.id}-habitData`,
                `${user.id}-lastUpdated`
            ]).then((data) => {
                for (const [key, value] of data) {
                    if (!value) return null;
                }

                return data.reduce((acc, [key, value]) => {
                    if (value) {
                        const a = key.split('-');
                        acc[a[a.length - 1]] = JSON.parse(value);
                    }
                    return acc;
                }, {} as Record<string, any>) as UserData;
            });
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

    const updateData = async () => {
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

        await AsyncStorage.multiSet([
            [`${user.id}-activities`, JSON.stringify(userData.activities)],
            [`${user.id}-habits`, JSON.stringify(userData.habits)],
            [`${user.id}-currentHabits`, JSON.stringify(userData.currentHabits)],
            [`${user.id}-todos`, JSON.stringify(userData.todos)],
            [`${user.id}-habitData`, JSON.stringify(userData.habitData)],
            [`${user.id}-lastUpdated`, JSON.stringify(userData.lastUpdated)],
        ]);

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

        updateData();
    };

    const removeActivity = (activityId: string) => {
        setActivities((prevActivities) => {
            const newActivities = { ...prevActivities };
            delete newActivities[activityId];
            return newActivities;
        });

        updateData();
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

        updateData();
    };

    const removeHabit = (habitId: string) => {
        setCurrentHabits((prevCurrent) => {
            const newCurrent = { ...prevCurrent };
            delete newCurrent[habitId];
            return newCurrent;
        });

        updateData();
    };

    const setTodo = (todoId: string, todo: Todo) => {
        setTodos((prevTodos) => ({
            ...prevTodos,
            [todoId]: todo,
        }));

        updateData();
    };

    const removeTodo = (todoId: string) => {
        setTodos((prevTodos) => {
            const newTodos = { ...prevTodos };
            delete newTodos[todoId];
            return newTodos;
        });

        updateData();
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

    return (
        <HabitContext.Provider value={{
            activities,
            setActivity,
            removeActivity,
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