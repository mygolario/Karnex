import { useState } from 'react';
import { getAuth, linkWithCredential, EmailAuthProvider } from 'firebase/auth';
import { app } from '@/lib/firebase';

// Simple toast fallback
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg),
};

export function useAccountUpgrade() {
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);

  const upgradeToEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (!auth.currentUser) throw new Error("No anonymous user found.");
      
      const credential = EmailAuthProvider.credential(email, pass);
      const result = await linkWithCredential(auth.currentUser, credential);
      
      toast.success("حساب کاربری شما با موفقیت ذخیره شد!");
      return result.user;
    } catch (error: any) {
      // Handle known Firebase Auth errors
      if (error.code === 'auth/credential-already-in-use' || error.code === 'auth/email-already-in-use') {
        console.warn("Upgrade info:", "Email already verified/in-use (Expected behavior)");
        toast.error("این ایمیل قبلاً ثبت شده است. لطفاً از ایمیل دیگری استفاده کنید.");
        return null; // Graceful exit
      } 
      
      if (error.code === 'auth/weak-password') {
         toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد.");
         return null;
      }

      console.error("Upgrade logic error:", error.code || error.message);
      toast.error("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { upgradeToEmail, loading, isAnonymous: auth.currentUser?.isAnonymous };
}
