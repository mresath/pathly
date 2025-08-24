import { createContext, useContext, useEffect, useState } from "react"
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

interface TaskContextType {
    tasks: Record<string, boolean>;
    status: BackgroundTask.BackgroundTaskStatus | undefined;
    registerTaskAsync: (id: string) => Promise<void>;
    unregisterTaskAsync: (id: string) => Promise<void>;
    updateAsync: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType>({
    tasks: {},
    status: undefined,
    registerTaskAsync: async (id: string) => {},
    unregisterTaskAsync: async (id: string) => {},
    updateAsync: async () => {},
});

export default function BackgroundTaskManager({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Record<string, boolean>>({});
    const [status, setStatus] = useState<BackgroundTask.BackgroundTaskStatus | undefined>();

    const registerTaskAsync = async (id: string) => {
        setTasks((prev) => ({ ...prev, [id]: true }));
        return BackgroundTask.registerTaskAsync(id);
    }

    const unregisterTaskAsync = async (id: string) => {
        setTasks((prev) => ({ ...prev, [id]: false }));
        return BackgroundTask.unregisterTaskAsync(id);
    }

    const updateAsync = async () => {
        const status = await BackgroundTask.getStatusAsync();
        setStatus(status);

        setTasks(Object.fromEntries((await TaskManager.getRegisteredTasksAsync()).map(task => [task.taskName, true])));
    }

    useEffect(() => {
        updateAsync();
    }, []);

    return (
        <TaskContext.Provider value={{
            tasks,
            status,
            registerTaskAsync,
            unregisterTaskAsync,
            updateAsync
        }}>
            {children}
        </TaskContext.Provider>
    )
}

export const useBackgroundTask = () => useContext(TaskContext);