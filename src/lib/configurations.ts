import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export interface AppConfiguration {
  EMPLOYEE_ID_PREFIX: string;
  SANCTIONED_LEAVE_PER_YEAR: number;
  WORKING_HOURS_PER_DAY: number;
  OVERTIME_THRESHOLD: number;
}

// Cache configurations to avoid repeated database calls
let configCache: AppConfiguration | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getAppConfigurations(): Promise<AppConfiguration> {
  const now = Date.now();

  // Return cached config if still valid
  if (configCache && now - cacheTimestamp < CACHE_DURATION) {
    return configCache;
  }

  try {
    const configurations = await prisma.configuration.findMany();

    const configMap = configurations.reduce(
      (acc, config) => {
        acc[config.configKey] = config.configValue;
        return acc;
      },
      {} as Record<string, string>
    );

    // Parse and validate configurations with defaults
    const appConfig: AppConfiguration = {
      EMPLOYEE_ID_PREFIX: configMap.EMPLOYEE_ID_PREFIX || 'EMP',
      SANCTIONED_LEAVE_PER_YEAR: parseInt(configMap.SANCTIONED_LEAVE_PER_YEAR || '24', 10),
      WORKING_HOURS_PER_DAY: parseInt(configMap.WORKING_HOURS_PER_DAY || '8', 10),
      OVERTIME_THRESHOLD: parseFloat(configMap.OVERTIME_THRESHOLD || '8.5'),
    };

    // Update cache
    configCache = appConfig;
    cacheTimestamp = now;

    return appConfig;
  } catch (error) {
    console.error('Error fetching configurations:', error);

    // Return default configurations if database fails
    const defaultConfig: AppConfiguration = {
      EMPLOYEE_ID_PREFIX: 'EMP',
      SANCTIONED_LEAVE_PER_YEAR: 24,
      WORKING_HOURS_PER_DAY: 8,
      OVERTIME_THRESHOLD: 8.5,
    };

    return defaultConfig;
  }
}

export async function getConfigurationValue(key: string): Promise<string | null> {
  try {
    const configuration = await prisma.configuration.findUnique({
      where: { configKey: key },
    });

    return configuration?.configValue || null;
  } catch (error) {
    console.error(`Error fetching configuration ${key}:`, error);
    return null;
  }
}

export function clearConfigCache(): void {
  configCache = null;
  cacheTimestamp = 0;
}
