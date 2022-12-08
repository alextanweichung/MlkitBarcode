import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface ConsignmentSalesList {
  otherSalesId: number
  otherSalesNum: string
  trxDate: Date
  customerName: string
  locationDesc: string
  toLocationDesc: string
  deactivated: boolean
}

export interface ConsignmentSalesRoot {
  header: ConsignmentSalesHeader
  details: TransactionDetail[]
}

export interface ConsignmentSalesHeader {
  otherSalesId: number
  otherSalesNum: string
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
}

export interface ConsignmentSalesSummary {
  otherSalesNum: string
  customerId: number
  toLocationId: number
  trxDate: Date
}