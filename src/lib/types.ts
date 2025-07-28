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
};

export type BankFormValues = Omit<Bank, "id">;

export type BankListItem = Omit<Bank, "netBankingPassword" | "mobileBankingPassword" | "atmPin">;
