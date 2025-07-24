import { useState, Dispatch, SetStateAction, createContext, useEffect, useContext } from "react"
import { useAuth } from "./auth";
import { getDate } from "./math";
import { supabase } from "./supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Activity = {
    id: string;
};

type Habit = {
    id: string;
};

type Todo = {
    id: string;
};

// TODO: Define types

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
    habitData: Record<string, any>;
    setHabitData: Dispatch<SetStateAction<Record<string, any>>>;
}

interface UserData {
    activities: Record<string, Activity>;
    habits: Record<string, Habit>;
    currentHabits: Record<string, Habit>;
    todos: Record<string, Todo>;
    habitData: Record<string, any>;
    lastUpdated: number;
}

const defaultActivities: Record<string, Activity> = {};

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
    setHabitData: () => { },
});

export default function HabitProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    const [activities, setActivities] = useState<Record<string, Activity>>(defaultActivities);
    const [habits, setHabits] = useState<Record<string, Habit>>({});
    const [currentHabits, setCurrentHabits] = useState<Record<string, Habit>>({});
    const [todos, setTodos] = useState<Record<string, Todo>>({});

    const [habitData, setHabitData] = useState({});

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
                for (const [value] of data) {
                    if (!value) return null;
                }

                return data.reduce((acc, [key, value]) => {
                    if (value) {
                        acc[key.split('-')[1]] = JSON.parse(value);
                    }
                    return acc;
                }, {} as Record<string, any>) as UserData;
            });
            const { data: luData } = await supabase.from("data").select("lastUpdated").eq("uid", user.id).single();

            if (luData) setRemoteLU(luData.lastUpdated);

            if (!localData) {
                if (!luData) return;

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
                    [`${user.id}-activities`, JSON.stringify(userData.activities)],
                    [`${user.id}-habits`, JSON.stringify(userData.habits)],
                    [`${user.id}-currentHabits`, JSON.stringify(userData.currentHabits)],
                    [`${user.id}-todos`, JSON.stringify(userData.todos)],
                    [`${user.id}-habitData`, JSON.stringify(userData.habitData)],
                    [`${user.id}-lastUpdated`, JSON.stringify(userData.lastUpdated)],
                ]);
            } else {
                if (!luData || localData.lastUpdated > luData.lastUpdated) {
                    setActivities(localData.activities);
                    setHabits(localData.habits);
                    setCurrentHabits(localData.currentHabits);
                    setTodos(localData.todos);
                    setHabitData(localData.habitData);
                    setRemoteLU(localData.lastUpdated);

                    await supabase.from("data").upsert({ uid: user.id, lastUpdated: localData.lastUpdated, data: localData });
                } else if (localData.lastUpdated < luData.lastUpdated) {
                    const { data } = await supabase.from("data").select("data").eq("uid", user.id).single();
                    if (!data) return;

                    const userData: UserData = data.data;
                    if (!userData) return;

                    setActivities(userData.activities || {});
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
    }

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
            setHabitData,
        }}>
            {children}
        </HabitContext.Provider>
    )
}

export const useHabit = () => useContext(HabitContext);