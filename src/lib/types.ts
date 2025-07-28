
export type CustomField = {
  label: string;
  value: string;
};

export type Bank = {
  id: string;
  bankName: string;
  phoneForOtp: string;
  accountNumber: string;
  netBankingUsername: string;
  netBankingPassword?: string;
  mobileBankingUsername: string;
  mobileBankingPassword?: string;
  atmPin?: string;
  customFields?: CustomField[];
};

export type BankFormValues = Omit<Bank, "id">;

export type BankListItem = Omit<Bank, "netBankingPassword" | "mobileBankingPassword" | "atmPin" | "customFields">;
