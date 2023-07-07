export interface Draft_Transactions {
   DRAFT_TRANSACTIONSId: string
   transaction_type: TransactionType
   json_data: string
}

export enum TransactionType {
   quotation = "QUOTATION",
   salesOrder = "SALES_ORDER"
}