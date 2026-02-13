import { useState } from 'react';

// Simple toast fallback
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg),
};

export function useAccountUpgrade() {
  const [loading, setLoading] = useState(false);

  const upgradeToEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      console.warn("Account upgrade not implemented in NextAuth migration yet.");
      toast.error("این قابلیت در حال حاضر غیرفعال است.");
      return null;
    } catch (error: any) {
      console.error("Upgrade logic error:", error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { upgradeToEmail, loading, isAnonymous: false };
}
