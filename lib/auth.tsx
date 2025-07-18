import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase";
import { Session, User } from "@supabase/supabase-js";
import { router } from "expo-router";
import { generateUsername } from "./string";
import * as SecureStore from 'expo-secure-store';

export interface Profile {
    uid: string;
    username?: string;
    email?: string;
    avatar?: string;
}

export interface PInfo {
    uid: string;
    name?: string;
    age?: number;
    gender?: string;
}

export interface Stats {
    uid: string;
    lastUpdated: number;
    xp: number;
    level: number;
    gold: number;
    gems: number;
    discipline: number;
    physical: number;
    mental: number;
    spiritual: number;
    social: number;
    skill: number;
}

interface AuthContextType {
    session?: Session | null;
    user?: User | null;
    profile?: Profile | null;
    getProfile?: () => Promise<void>;
    stats?: Stats | null;
    pinfo?: PInfo | null;
    getInfo?: () => Promise<void>;
    updateStats?: (update: Partial<Omit<Stats, "uid" | "lastUpdated">>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);
        });

        supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            setUser(s?.user ?? null);
        });
    }, []);

    useEffect(() => {
        if (!user) {
            router.replace("/(auth)/login");
        } else {
            router.replace("/(tabs)");

            const fetchProfile = async () => {
                const { data, error } = await supabase
                    .from("profiles")
                    .select()
                    .eq("uid", user.id)
                    .single();

                if (error) {
                    console.error("Error fetching profile:", error);
                    if (error.code = "PGRST116") {
                        console.log("No profile found, creating a new one...");
                        const newProfile: Profile = {
                            uid: user.id,
                            username: user.user_metadata?.name || user.email?.split("@")[0] || generateUsername(),
                            email: user.email || "",
                            avatar: user.user_metadata?.avatar_url || ""
                        };

                        const { error } = await supabase
                            .from("profiles")
                            .upsert(newProfile);

                        if (error) {
                            console.error("Error creating profile:", error);
                        } else {
                            setProfile(newProfile)
                        };
                    }
                } else {
                    setProfile(data);
                }
            }

            fetchProfile();
        }
    }, [user]);

    const getProfile = useCallback(async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("profiles")
            .select()
            .eq("uid", user.id)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
        } else {
            setProfile(data);
        }
    }, [user]);


    const [pinfo, setPInfo] = useState<PInfo | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [sloading, setSLoading] = useState(false);
    const fetchInfo = async () => {
        if (!user || sloading) return;
        setSLoading(true);

        const { data: pinfoData, error: pinfoError } = await supabase
            .from("pinfo")
            .select()
            .eq("uid", user.id)
            .single();

        const localStats = await SecureStore.getItemAsync(`${user.id}-stats`);
        const { data: statData, error: statError } = await supabase
            .from("stats")
            .select()
            .eq("uid", user.id)
            .single();

        if (pinfoError) {
            console.error("Error fetching pinfo:", pinfoError);
        } else {
            setPInfo(pinfoData);
        }
        if (statError) {
            console.error("Error fetching stats:", statError);
        } else {
            if (localStats) {
                const parsedStats = JSON.parse(localStats) as Stats;
                if (parsedStats.lastUpdated > (statData?.lastUpdated || 0)) {
                    setStats(parsedStats);
                } else {
                    setStats(statData);
                }
            } else {
                setStats(statData);
            }
        }

        if (pinfoError || statError) {
            if (pinfoError?.code === "PGRST116" || statError?.code === "PGRST116") {
                console.log("No pinfo or stats found, starting onboarding...");
                router.replace("/onboarding");
            }
        }

        setSLoading(false);
    };
    useEffect(() => {
        fetchInfo();
    }, [user]);

    const getInfo = useCallback(async () => {
        if (!user) return;

        const { data: pinfoData, error: pinfoError } = await supabase
            .from("pinfo")
            .select()
            .eq("uid", user.id)
            .single();

        const localStats = await SecureStore.getItemAsync(`${user.id}-stats`);
        const { data: statData, error: statError } = await supabase
            .from("stats")
            .select()
            .eq("uid", user.id)
            .single();

        if (pinfoError) {
            console.error("Error fetching pinfo:", pinfoError);
        } else {
            setPInfo(pinfoData);
        }
        if (statError) {
            console.error("Error fetching stats:", statError);
            if (localStats) {
                const parsedStats = JSON.parse(localStats) as Stats;
                setStats(parsedStats);
            }
        } else {
            if (localStats) {
                const parsedStats = JSON.parse(localStats) as Stats;
                if (parsedStats.lastUpdated > (statData?.lastUpdated || 0)) {
                    setStats(parsedStats);
                } else {
                    setStats(statData);
                }
            } else {
                setStats(statData);
            }
        }
    }, [user]);

    const updateStats = useCallback(async (update: Partial<Omit<Stats, "uid" | "lastUpdated">>) => {
        if (!user) return;

        const newStats = {
            xp: 0,
            level: 0,
            gold: 0,
            gems: 0,
            discipline: 0,
            physical: 0,
            mental: 0,
            spiritual: 0,
            social: 0,
            skill: 0,
            ...stats,
            ...update,
            uid: user.id,
            lastUpdated: Math.floor(Date.now() / 1000),
        }

        setStats(newStats);

        await SecureStore.setItemAsync(`${user.id}-stats`, JSON.stringify(newStats));

        const { error } = await supabase
            .from("stats")
            .update(newStats)
            .eq("uid", user.id);

        if (error) {
            console.error("Error updating stats:", error);
        }
    }, [user, stats]);

    return (
        <AuthContext.Provider value={{
            session,
            user,
            profile,
            getProfile,
            pinfo,
            stats,
            getInfo,
            updateStats
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);