import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useUser } from '@kit/supabase/hooks/use-user';

export function usePersonalAccountData(
  userId: string,
  partialAccount?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  },
) {
  const client = useSupabase();
  const { data: user } = useUser();
  const queryKey = ['account:data', userId];

  const queryFn = async () => {
    if (!userId || !user) {
      return null;
    }

    // Use user data from auth instead of accounts table
    return {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      picture_url: user.user_metadata?.avatar_url || null,
    };
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!userId && !!user,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: partialAccount?.id
      ? {
        id: partialAccount.id,
        name: partialAccount.name,
        picture_url: partialAccount.picture_url,
      }
      : undefined,
  });
}

export function useRevalidatePersonalAccountDataQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) =>
      queryClient.invalidateQueries({
        queryKey: ['account:data', userId],
      }),
    [queryClient],
  );
}
