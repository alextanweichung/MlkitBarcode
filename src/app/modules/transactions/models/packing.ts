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

 export interface PackingRoot {
  header: PackingHeader
  details: PackingDetail[]
}

export interface PackingHeader {
  packingId: number
  packingNum: string
  trxDate: string
  trxDateTime: string
  typeCode: string
  sourceType: string
  customerId: number
  businessModelType: string
  locationId: number
  toLocationId: any
  warehouseAgentId: number
  workFlowTransactionId: number
  externalDocNum: any
  masterUDGroup1: any
  masterUDGroup2: any
  masterUDGroup3: any
  childId: any
  childNum: any
  printCount: number
  isWithSo: boolean
  remark: any
  totalCarton: any
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}

export interface PackingDetail {
  packingLineId: number
  packingId: number
  itemId: number
  itemCode: string
  itemVariationXId: number
  itemVariationYId: number
  itemVariationXDescription: string
  itemVariationYDescription: string
  itemUomId: number
  itemSku: string
  itemBarcode: string
  description: string
  qtyPacked: number
  sequence: number
  lineUDDate: any
  masterUDGroup1: any
  masterUDGroup2: any
  masterUDGroup3: any
  locationId: number
  deactivated: boolean
  cartonNum: any
}
