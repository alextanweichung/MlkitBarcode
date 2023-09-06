export interface TransferOutRoot {
   transferOutId: number
   transferOutNum: string
   interTransferNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   locationId: number
   toLocationId: number
   sourceType: string
   deactivated: boolean
   isCompleted: boolean
   remark: string
   totalCarton: number
   workFlowTransactionId: number
   line: TransferOutLine[]
 }
 
 export interface TransferOutLine {
   id: number
   uuid: string
   transferOutId: number
   sequence: number
   itemId: number
   itemCode: string
   itemSku: string
   itemDesc: string
   xId: number
   xCd: string
   xDesc: string
   yId: number
   yCd: string
   yDesc: string
   barcode: string
   lineQty: number
   isDeleted: boolean
 }
 
 export interface TransferOutList {
   transferOutId: number
   transferOutNum: string
   trxDate: string
   trxDateTime: string
   fromLocationCode: string
   fromLocationDesc: string
   toLocationCode: string
   toLocationDesc: string
   isCompleted: boolean
   deactivated: boolean
 }
 