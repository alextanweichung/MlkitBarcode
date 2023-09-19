import { BarcodeTag } from "src/app/shared/models/item-barcode"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface ConsignmentCountRoot {
   header: ConsignmentCountHeader
   details: TransactionDetail[]
   barcodeTag?: BarcodeTag[]
 }
 
 export interface ConsignmentCountHeader {
   consignmentCountId: number
   consignmentCountNum: string
   description: string
   trxDate: string
   trxDateTime: string
   locationId: number
   consignmentCountUDField1: any
   consignmentCountUDField2: any
   consignmentCountUDField3: any
   consignmentCountUDOption1: any
   consignmentCountUDOption2: any
   consignmentCountUDOption3: any
   remark: any
   printCount: any
   sequence: any
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: number
   modifiedBy: string
   modifiedAt: string
   deactivated: boolean
 }

 export interface ConsignmentCountItem {
   itemId: number
   itemCode: string
   description: string
   variationTypeCode?: string
   itemVariationLineXId: number
   itemVariationLineYId: number
   itemVariationLineXDescription?: string
   itemVariationLineYDescription?: string
   itemSku: string
   itemBarcodeTagId: number
   itemBarcode?: string
   itemUomId?: number
   itemUomDescription?: string
   deactivated?: boolean
   qtyRequest: number
 }