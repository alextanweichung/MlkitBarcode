export interface TransactionProcessingDoc {
  docId: number;
  docNum: string;
  docType: string;
  trxDate: Date;
  counterPart: string;
  country: string;
  currency: string;
  amount: number;
  quantity: number;
  createdBy: string;
  createdAt: Date;
  isComplete: boolean;
  isPrinted: boolean;
  routerLink: string;
  appCode: string;
  reportNum: string;
  reportName: string;
}

export interface TransactionProcessingCount {
  pending: number;
  completed: number;
  total: number;
  isAllowApprove: boolean
}

export interface BulkConfirmReverse {
  status: string;
  reason?: string
  docId: number[];
}