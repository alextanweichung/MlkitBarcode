export interface InboundScanRoot {
  header: InboundScanHeader
  details: any
}

export interface InboundScanHeader {
  inboundScanId: number
  inboundScanNum: string
  trxDate: string
  trxDateTime: string
  fromCustomerId: number
  fromLocationId: number
  toLocationId: number
  warehouseAgentId: number
  businessModelType: string
  typeCode: string
  childId: number
  childNum: string
  childDocType: string
  inboundScanUDField1: string
  inboundScanUDField2: string
  inboundScanUDField3: string
  inboundScanUDOption1: number
  inboundScanUDOption2: number
  inboundScanUDOption3: number
  masterUDGroup1: number
  masterUDGroup2: number
  masterUDGroup3: number
  sourceType: string
  isWithDoc: boolean
  docType: string
  docId: number
  docNum: string
  workFlowTransactionId: number
  printCount: number
  remark: string
  sequence: number
}

export interface InboundScanDetails {
  documentId: number
  documentNum: string
  outstandingScanList: InboundScanOutstandingScanList[]
  currentScanList: InboundScanCurrentScanList[]
  scanHistory: any[]
}

export interface InboundScanOutstandingScanList {
  documentId: number
  documentLineId: number
  itemId: number
  itemCode: string
  itemVariationXId?: number
  itemVariationYId: number
  itemVariationXDescription?: string
  itemVariationYDescription: string
  itemUomId: number
  itemSku: string
  rack: string
  subRack: string
  qtyRequest: number
  qtyScanned: number
  qtyScannedCurrent: number
}

export interface InboundScanCurrentScanList {
  documentId: number
  docRowIndex: number
  inboundScanLineId: number
  inboundScanId: number
  itemId: number
  itemCode: string
  itemVariationXId?: number
  itemVariationYId: number
  itemVariationXDescription?: string
  itemVariationYDescription: string
  itemUomId: number
  itemSku: string
  itemBarcode: string
  description: string
  qtyScanned: number
  sequence: number
  lineUDDate: Date
  masterUDGroup1: number
  masterUDGroup2: number
  masterUDGroup3: number
  locationId: number
  deactivated: boolean
}
 
 export interface InboundScanList {
  inboundScanId: number
  inboundScanNum: string
  trxDate: Date
  locationCode: string
  locationDescription: string
  fromCustomerId: number
  customerName: string
  warehouseAgentId: number
  warehouseAgentName: string
  deactivated: boolean
}
