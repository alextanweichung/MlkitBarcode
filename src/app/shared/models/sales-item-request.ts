export interface SalesItemRequest {
   search: string
   trxDate: Date
   customerId: number
   locationId: number
   startIndex: number
   size: number
}