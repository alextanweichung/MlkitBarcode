export interface SalesItemRequest {
   itemId?: number[]
   search: string
   trxDate: Date
   customerId: number
   locationId: number
   startIndex: number
   size: number
}