export interface PickingList {
   pickingId: number
   pickingNum: string
   trxDate: string
   locationCode: string
   locationDescription: string
   warehouseAgentId: number
   warehouseAgentName: string
   deactivated: boolean
   createdById: number
 }
  
//  export interface PickingRoot {
//   header: PickingHeader
//   details: PickingDetail[]
// }

// export interface PickingHeader {
//   pickingId: number
//   pickingNum: string
//   trxDate: string
//   trxDateTime: string
//   typeCode: string
//   sourceType: string
//   customerId: number
//   businessModelType: string
//   locationId: number
//   toLocationId: any
//   warehouseAgentId: number
//   workFlowTransactionId: any
//   externalDocNum: any
//   masterUDGroup1: any
//   masterUDGroup2: any
//   masterUDGroup3: any
//   printCount: number
//   isWithSo: boolean
//   remark: any
//   sequence: number
//   createdById: number
//   createdBy: string
//   createdAt: string
//   modifiedById: any
//   modifiedBy: any
//   modifiedAt: any
//   deactivated: boolean
// }

// export interface PickingDetail {
//   salesOrderId: number
//   salesOrderNum: string
//   outstandingPickList: PickingOutstandingPickList[]
//   currentPickList: PickingCurrentPickList[]
//   pickingHistory: PickingHistory[]
// }

// export interface PickingOutstandingPickList {
//   salesOrderId: number
//   itemId: number
//   itemCode: string
//   itemVariationXId?: number
//   itemVariationYId: any
//   itemVariationXDescription?: string
//   itemVariationYDescription: any
//   itemUomId: number
//   itemSku: string
//   rack: any
//   subRack: any
//   qtyRequest: number
//   qtyPickedSo: number
//   qtyPickedCurrent: number
// }

// export interface PickingCurrentPickList {
//   salesOrderId: number
//   soRowIndex: number
//   pickingLineId: number
//   pickingId: number
//   itemId: number
//   itemCode: string
//   itemVariationXId: any
//   itemVariationYId: any
//   itemVariationXDescription: any
//   itemVariationYDescription: any
//   itemUomId: number
//   itemSku: string
//   itemBarcode: any
//   description: string
//   qtyPicked: number
//   sequence: number
//   lineUDDate: any
//   masterUDGroup1: any
//   masterUDGroup2: any
//   masterUDGroup3: any
//   locationId: number
//   deactivated: boolean
// }

// export interface PickingHistory {
//   pickingId: number
//   pickingNum: string
// }

export interface GoodsPickingDto {
  header: GoodsPicking
  details?: GoodsPickingLine[]
  // otp?: OtpLine
}

export interface GoodsPicking {
  pickingId: number
  pickingNum: string
  trxDate: Date,
  locationId: number
  toLocationId: number
  customerId: number
  warehouseAgentId: number
  pickingUDField1?: string
  pickingUDField2?: string
  pickingUDField3?: string
  pickingUDOption1?: number
  pickingUDOption2?: number
  pickingUDOption3?: number
  deactivated?: boolean,
  workFlowTransactionId?: number
  createdBy?: string
  createdAt?: Date,
  masterUDGroup1?: number
  masterUDGroup2?: number
  masterUDGroup3?: number
  businessModelType: string
  sourceType: string
  typeCode: string
  isWithSo: boolean
  remark: string
}

export interface GoodsPickingLine {
  pickingLineId?: number
  pickingId?: number
  salesOrderId: number
  itemId: number
  itemVariationXId?: number
  itemVariationYId?: number
  itemSku: string
  itemBarcode: string
  itemUomId?: number
  qtyRequest: number
  soRowIndex?: number
  sequence: number
  lineUDDate?: Date
  masterUDGroup1?: number
  masterUDGroup2?: number
  masterUDGroup3?: number
  locationId: number
  deactivated?: boolean
}

export interface PickingSummary {
  pickingNum: string
  customerId: number
  locationId: number
  trxDate: Date
}