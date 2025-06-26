// Configuration and system settings type definitions

export interface Configuration {
  id: string;
  configKey: string;
  configValue: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationFormData {
  configKey: string;
  configValue: string;
  description: string;
}

export interface SystemSettings {
  companyName: string;
  companyAddress: string;
  companyLogo?: string;
  financialYearStart: string;
  defaultCurrency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}
