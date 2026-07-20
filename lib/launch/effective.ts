/**
 * Server-side launch config overrides (SystemSetting key: launch_overrides).
 */

import prisma from "@/lib/prisma";
import type { Prisma } from "../../prisma/client";
import {
  mergeLaunchConfig,
  type EffectiveLaunchConfig,
  type LaunchOverrides,
} from "@/lib/launch/config";

export const LAUNCH_OVERRIDES_KEY = "launch_overrides";

export async function getLaunchOverrides(): Promise<LaunchOverrides | null> {
  try {
    const row = await prisma.systemSetting.findUnique({
      where: { key: LAUNCH_OVERRIDES_KEY },
    });
    if (!row?.value || typeof row.value !== "object" || Array.isArray(row.value)) {
      return null;
    }
    return row.value as LaunchOverrides;
  } catch {
    return null;
  }
}

export async function getEffectiveLaunchConfig(): Promise<EffectiveLaunchConfig> {
  const overrides = await getLaunchOverrides();
  return mergeLaunchConfig(overrides);
}

export async function setLaunchOverrides(
  overrides: LaunchOverrides,
): Promise<EffectiveLaunchConfig> {
  await prisma.systemSetting.upsert({
    where: { key: LAUNCH_OVERRIDES_KEY },
    create: {
      key: LAUNCH_OVERRIDES_KEY,
      value: overrides as Prisma.InputJsonValue,
    },
    update: {
      value: overrides as Prisma.InputJsonValue,
    },
  });
  return mergeLaunchConfig(overrides);
}
