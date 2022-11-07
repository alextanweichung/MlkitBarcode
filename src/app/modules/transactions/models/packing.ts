export interface PackingList {
   packingId: number
   packingNum: string
   trxDate: string
   locationCode: string
   locationDescription: string
   warehouseAgentId: number
   warehouseAgentName: string
   deactivated: boolean
   createdById: number
 }

//  export interface PackingRoot {
//   header: PackingHeader
//   details: PackingDetail[]
// }

// export interface PackingHeader {
//   packingId: number
//   packingNum: string
//   trxDate: string
//   trxDateTime: string
//   typeCode: string
//   sourceType: string
//   customerId: number
//   businessModelType: string
//   locationId: number
//   toLocationId: any
//   warehouseAgentId: number
//   workFlowTransactionId: number
//   externalDocNum: any
//   masterUDGroup1: any
//   masterUDGroup2: any
//   masterUDGroup3: any
//   childId: any
//   childNum: any
//   printCount: number
//   isWithSo: boolean
//   remark: any
//   totalCarton: any
//   sequence: number
//   createdById: number
//   createdBy: string
//   createdAt: string
//   modifiedById: any
//   modifiedBy: any
//   modifiedAt: any
//   deactivated: boolean
// }

// export interface PackingDetail {
//   packingLineId: number
//   packingId: number
//   itemId: number
//   itemCode: string
//   itemVariationXId: number
//   itemVariationYId: number
//   itemVariationXDescription: string
//   itemVariationYDescription: string
//   itemUomId: number
//   itemSku: string
//   itemBarcode: string
//   description: string
//   qtyPacked: number
//   sequence: number
//   lineUDDate: any
//   masterUDGroup1: any
//   masterUDGroup2: any
//   masterUDGroup3: any
//   locationId: number
//   deactivated: boolean
//   cartonNum: any
// }

export interface GoodspackingDto {
  header: GoodsPacking
  details?: GoodsPackingLine[]
  // otp?: OtpLine
}

export interface GoodsPacking {
  packingId: number
  packingNum: string
  trxDate: Date,
  locationId: number
  toLocationId: number
  customerId: number
  warehouseAgentId: number
  packingUDField1?: string
  packingUDField2?: string
  packingUDField3?: string
  packingUDOption1?: number
  packingUDOption2?: number
  packingUDOption3?: number
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
  totalCarton: number
}

export interface GoodsPackingLine {
  packingLineId?: number
  packingId?: number
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
  cartonNum: number;
  deactivated?: boolean
}

export interface PackingSummary {
  packingNum: string
  customerId: number
  locationId: number
  trxDate: Date
}