import { useState } from 'react';
import { createClient } from '@/lib/supabase';

// Simple toast fallback
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg),
};

export function useAccountUpgrade() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const upgradeToEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        email: email,
        password: pass
      });

      if (error) throw error;
      
      toast.success("حساب کاربری شما با موفقیت ذخیره شد!");
      return user;
    } catch (error: any) {
      console.error("Upgrade logic error:", error.message);
      toast.error("خطایی رخ داد. لطفاً دوباره تلاش کنید: " + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { upgradeToEmail, loading, isAnonymous: false }; // Supabase handles anonymous users differently, assuming false for now or check is_anonymous
}
