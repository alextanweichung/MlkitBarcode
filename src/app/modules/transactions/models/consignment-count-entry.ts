import { BarcodeTag } from "src/app/shared/models/item-barcode"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface ConsignmentCountEntryList {
   consignmentCountEntryId: number
   consignmentCountEntryNum: string
   trxDate: Date
   locationId: number
   locationCode: string
   locationDescription: string
   totalQty: number
}

export interface ConsignmentCountEntryRoot {
   header: ConsignmentCountEntryHeader
   details: TransactionDetail[]
   barcodeTag?: any
}

export interface ConsignmentCountEntryHeader {
   consignmentCountEntryId: number
   consignmentCountEntryNum: string
   description: any
   trxDate: string
   trxDateTime: string
   locationId: number
   consignmentCountEntryUDField1: any
   consignmentCountEntryUDField2: any
   consignmentCountEntryUDField3: any
   consignmentCountEntryUDOption1: any
   consignmentCountEntryUDOption2: any
   consignmentCountEntryUDOption3: any
   remark: any
   printCount: number
   rack: any
   zone: any
   sourceType: string
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
   revision: number
}

export interface ConsignmentCountEntryDetail {
   consignmentCountEntryLineId: number
   consignmentCountEntryId: number
   itemId: number
   itemVariationXId: number
   itemVariationYId: number
   itemSku: string
   itemBarcodeTagId: number
   itemBarcode: string
   qtyRequest: number
   qtyApproved?: number
   qtyCommit?: number
   sequence: number
   createdById?: number
   createdBy?: string
   createdAt?: string
   modifiedById?: number
   modifiedBy?: string
   modifiedAt?: string
   deactivated?: boolean

   // local col
   itemCode?: string
   itemDescription?: string
   itemVariationXDescription?: string
   itemVariationYDescription?: string

   // testing performance
   guid?: string
}