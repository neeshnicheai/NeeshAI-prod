import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/api";

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    status: string;
    occupation: string | null;
    profileImageUrl: string | null;
    bio: string | null;
    phone: string | null;
    location: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileData {
    name?: string;
    occupation?: string;
    profileImageUrl?: string;
    bio?: string;
    phone?: string;
    location?: string;
}

export const useProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiClient.get<UserProfile>("/api/users/me");
            setProfile(data);
        } catch (error) {
            console.error("[useProfile] Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = useCallback(async (data: UpdateProfileData) => {
        try {
            setSaving(true);
            const updated = await apiClient.put<UserProfile>("/api/users/me", data);
            setProfile(updated);
            return { success: true, data: updated };
        } catch (error) {
            console.error("[useProfile] Failed to update profile:", error);
            return { success: false, error };
        } finally {
            setSaving(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        saving,
        updateProfile,
        refetch: fetchProfile,
    };
};
