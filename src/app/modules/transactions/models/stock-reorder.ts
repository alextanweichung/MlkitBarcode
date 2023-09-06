export interface StockReorderRoot {
   stockReorderId: number
   stockReorderNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   locationId: number
   deactivated: boolean
   isCompleted: boolean
   sourceType: string
   createdBy: string
   createdAt: string
   salesOrderId: number
   salesOrderNum: string
   remark: any
   workFlowTransactionId: number
   line: StockReorderLine[]
 }
 
 export interface StockReorderLine {
   id: number
   uuid: string
   stockReorderId: string
   sequence: number
   itemId: number
   itemCode: string
   itemSku: string
   itemDesc: string
   xId: any
   xCd: any
   xDesc: any
   yId: any
   yCd: any
   yDesc: any
   barcode: string
   lineQty: number
   isDeleted: boolean
 }

 export interface StockReorderList {
  stockReorderId: number
  stockReorderNum: string
  trxDate: string
  trxDateTime: string
  locationCode: string
  locationDesc: string
  deactivated: boolean
  isCompleted: boolean
}

 