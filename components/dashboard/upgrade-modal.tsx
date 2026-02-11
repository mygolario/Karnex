"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  children?: ReactNode;
}

export function UpgradeModal({ children }: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  return (
    <>
      {children ? (
        <div onClick={handleUpgrade} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button
          variant="gradient"
          size="sm"
          className="w-full"
          onClick={handleUpgrade}
        >
          <Crown size={14} />
          ارتقا به پلن ویژه
        </Button>
      )}
    </>
  );
}
