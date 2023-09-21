import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface ConsignmentSalesList {
  consignmentSalesId: number
  consignmentSalesNum: string
  trxDate: Date
  customerName: string
  locationDesc: string
  toLocationDesc: string
  deactivated: boolean
  isEntryCompleted: boolean
}

export interface ConsignmentSalesRoot {
  header: ConsignmentSalesHeader
  details: TransactionDetail[]
}

export interface ConsignmentSalesHeader {
  consignmentSalesId: number
  consignmentSalesNum: string
  trxDate: Date
  trxDateTime: Date
  customerId?: number
  locationId?: number
  toLocationId?: number
  currencyId?: number
  currencyRate?: number
  salesAgentId?: number
  remark: string
  typeCode: string
  businessModelType: string
  isHomeCurrency: boolean
  isItemPriceTaxInclusive: boolean
  isDisplayTaxInclusive: boolean
  maxPrecision: number
  maxPrecisionTax: number
  isEntryCompleted: boolean
  isBearPromo: boolean
  marginMode: string
}

export interface ConsignmentSalesLocation {
  locationId: number
  locationCode: string
  locationDescription: string
  customerId: number
  isPrimary: boolean
}