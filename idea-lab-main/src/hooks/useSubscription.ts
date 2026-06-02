import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "./useAuth";
import apiClient from "@/lib/api";

export interface SubscriptionInfo {
  plan: string;
  projectCount: number;
  maxProjects: number;
  canCreateProject: boolean;
  customLogoUrl: string;
  customBrandingText: string;
  subscriptionExpiresAt: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Guard against duplicate fetches
  const lastFetchedUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchSubscription = useCallback(async (force = false) => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      lastFetchedUserIdRef.current = null;
      return;
    }

    // Skip if already fetched for this user
    if (!force && lastFetchedUserIdRef.current === user.id) {
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setLoading(true);
      const data = await apiClient.get<SubscriptionInfo>('/api/users/subscription');
      setSubscription(data);
      lastFetchedUserIdRef.current = user.id;
    } catch (err) {
      console.error("[useSubscription] Error fetching subscription:", err);
      // Default to free plan on error
      setSubscription({
        plan: "FREE",
        projectCount: 0,
        maxProjects: 5,
        canCreateProject: true,
        customLogoUrl: "",
        customBrandingText: "",
        subscriptionExpiresAt: null,
      });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const upgradeToPro = async (): Promise<boolean> => {
    try {
      await apiClient.put('/api/users/subscription/upgrade');
      await fetchSubscription();
      return true;
    } catch (err) {
      console.error("[useSubscription] Error upgrading:", err);
      return false;
    }
  };

  const updateBranding = async (customLogoUrl?: string, customBrandingText?: string): Promise<boolean> => {
    try {
      await apiClient.put('/api/users/branding', { customLogoUrl, customBrandingText });
      await fetchSubscription();
      return true;
    } catch (err) {
      console.error("[useSubscription] Error updating branding:", err);
      return false;
    }
  };

  const isPro = subscription?.plan === "PRO" || subscription?.plan === "PREMIUM" || subscription?.plan === "ENTERPRISE";
  const isFree = !isPro;
  const isEnterprise = subscription?.plan === "ENTERPRISE";
  const canCreateProject = subscription?.canCreateProject ?? true;

  // Compute days remaining from subscriptionExpiresAt
  const daysRemaining = useMemo(() => {
    if (!subscription?.subscriptionExpiresAt) return null;
    const expiresAt = new Date(subscription.subscriptionExpiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [subscription?.subscriptionExpiresAt]);

  return {
    subscription,
    loading,
    isPro,
    isFree,
    isEnterprise,
    canCreateProject,
    daysRemaining,
    upgradeToPro,
    updateBranding,
    refetch: fetchSubscription,
  };
};
