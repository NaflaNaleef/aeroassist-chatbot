import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

/**
 * Class representing an API for interacting with user accounts.
 * @constructor
 * @param {SupabaseClient<Database>} client - The Supabase client instance.
 */
class AccountsApi {
  constructor(private readonly client: SupabaseClient<Database>) { }

  /**
   * @name getAccount
   * @description Get the account data for the given ID.
   * @param id
   */
  async getAccount(id: string) {
    // Get user data from auth instead of accounts table
    const { data: { user }, error } = await this.client.auth.getUser();

    if (error || !user) {
      throw error || new Error('User not found');
    }

    return {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      picture_url: user.user_metadata?.avatar_url || null,
    };
  }
}

export function createAccountsApi(client: SupabaseClient<Database>) {
  return new AccountsApi(client);
}
