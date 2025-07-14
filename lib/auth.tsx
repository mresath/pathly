import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase";
import { Session, User } from "@supabase/supabase-js";
import { router } from "expo-router";
import { generateUsername } from "./string";

export interface Profile {
    uid: string;
    username?: string;
    email?: string;
    avatar?: string;
}

interface AuthContextType {
    session?: Session | null;
    user?: User | null;
    profile?: Profile | null;
    getProfile?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const [profile, setProfile] = useState<any>(null);

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
            router.replace("/(tabs)/");

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

    return (
        <AuthContext.Provider value={{
            session,
            user,
            profile,
            getProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);