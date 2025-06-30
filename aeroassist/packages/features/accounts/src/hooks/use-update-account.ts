import { useMutation } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

type UpdateData = {
  name?: string;
  picture_url?: string | null;
};

export function useUpdateAccountData(accountId: string) {
  const client = useSupabase();

  const mutationKey = ['account:data', accountId];

  const mutationFn = async (data: UpdateData) => {
    // Update user metadata instead of accounts table
    const { data: userData, error } = await client.auth.updateUser({
      data: {
        name: data.name,
        avatar_url: data.picture_url,
      }
    });

    if (error) {
      throw error;
    }

    return {
      id: userData.user?.id,
      name: userData.user?.user_metadata?.name || userData.user?.email?.split('@')[0] || '',
      picture_url: userData.user?.user_metadata?.avatar_url || null,
    };
  };

  return useMutation({
    mutationKey,
    mutationFn,
  });
}
