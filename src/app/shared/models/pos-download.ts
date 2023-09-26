export interface PDItemMaster {
  id: number
  code: string
  itemDesc: string
  newId: number
  newDate: Date
  brandId: number
  brandCd: string
  brandDesc: string
  groupId: number
  groupCd: string
  groupDesc: string
  catId: number
  catCd: string
  catDesc: string
  deptId: number,
  seasonId: number,
  varCd: string
  price: number
  minPrice: number
  discId: number
  discCd: string
  discPct: number
  taxId: number
  taxCd: string
  taxPct: number
  imgUrl: string
}

export interface PDItemBarcode {
  id: number
  itemId: number
  xId: any
  xCd: any
  xDesc: any
  xSeq: any
  yId: any
  yCd: any
  yDesc: any
  ySeq: any
  barcode: string
  sku: string
  qty: number
}

export interface PDMarginConfig {
  id: number
  trxDate: Date
  locId: number
  type?: string
  typeId?: number
  discCode: string
  hLevel: number
  mPct: number
  bPct: number
}