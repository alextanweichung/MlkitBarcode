import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface InterTransferList {
   interTransferId: number
   interTransferNum: string
   trxDate: Date
   locationCode: string
   locationDescription: string
   toLocationCode: string
   toLocationDescription: string
   deactivated: boolean
 }
 

 export interface InterTransferRoot {
   header: InterTransferHeader
   details: TransactionDetail[]
 }
 
 export interface InterTransferHeader {
   interTransferId: number
   interTransferNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   shipAddress: any
   shipPostCode: any
   shipPhone: any
   shipFax: any
   shipEmail: any
   shipAreaId: any
   shipMethodId: number
   attention: any
   locationId: number
   toLocationId: number
   workFlowTransactionId: number
   interTransferUDField1: any
   interTransferUDField2: any
   interTransferUDField3: any
   interTransferUDOption1: any
   interTransferUDOption2: any
   interTransferUDOption3: any
   masterUDGroup1: any
   masterUDGroup2: any
   masterUDGroup3: any
   printCount: any
   externalDocNum: any
   sourceType: string
   isCompleted: boolean
   transferOutId: any
   transferOutNum: any
   packingId: any
   packingNum: any
   multiPackingId: any
   multiPackingNum: any
   parentObject: any
   receivedAt: any
   receivedBy: any
   remark: any
   totalCarton: any
   completedAppCode: any
   sequence: any
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: number
   modifiedBy: string
   modifiedAt: string
   deactivated: boolean
 }

 export interface TransferConfirmationRoot {
  interTransferId: number
  interTransferNum: string
  trxDate: string
  trxDateTime: string
  typeCode: string
  locationId: number
  toLocationId: number
  sourceType: string
  transferOutId: any
  transferOutNum: any
  deactivated: boolean
  isCompleted: boolean
  createdBy: string
  createdAt: string
  line: TransferConfirmationLine[]
}

export interface TransferConfirmationLine {
  interTransferLineId: number
  interTransferVariationId: number
  interTransferId: number
  sequence: number
  itemId: number
  itemCode: string
  itemSku: string
  itemDesc: string
  xId: number
  xDesc: string
  yId: number
  yDesc: string
  barcode: string
  qty: number
  qtyReceive: any
  isDeleted: any
}
