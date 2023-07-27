import { ApprovalHistory } from "src/app/shared/models/approval-history"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface SalesOrderList {
  salesOrderId: number
  salesOrderNum: string
  trxDate: string
  customerName: string
  salesAgentName: string
  countryDescription: string
  currencyCode: string
  grandTotal: number
  qty: number
  otherAmountCount: number
  deactivated: boolean
  createdById: number
  
  isDraft: boolean
  draftTransactionId: number
}

export interface SalesOrderRoot {
  header: SalesOrderHeader
  details: TransactionDetail[]
  barcodeTag?: any
  otp?: any
  approvalHistory?: ApprovalHistory[]
  isWorkFlowDone?: boolean
  otherAmount?: OtherAmount[]
}

export interface SalesOrderHeader {
  salesOrderId: number
  salesOrderNum: string
  trxDate: string
  trxDateTime: string
  typeCode: string
  sourceType: string
  status: string
  customerId: number
  businessModelType: string
  salesAgentId: number
  shipAddress: any
  shipPostCode: any
  shipPhone: any
  shipFax: any
  shipEmail: any
  shipAreaId: number
  shipMethodId: number
  attention: any
  locationId: number
  toLocationId: any
  termPeriodId: number
  workFlowTransactionId: number
  countryId: number
  currencyId: number
  currencyRate: number
  salesOrderUDField1: any
  salesOrderUDField2: any
  salesOrderUDField3: any
  salesOrderUDOption1: any
  salesOrderUDOption2: any
  salesOrderUDOption3: any
  totalGrossAmt: number
  totalDiscAmt: number
  totalTaxAmt: number
  grandTotal: number
  grandTotalExTax: number
  localTotalGrossAmt: number
  localTotalDiscAmt: number
  localTotalTaxAmt: number
  localGrandTotal: number
  localGrandTotalExTax: number
  printCount: number
  externalDocNum: any
  masterUDGroup1: any
  masterUDGroup2: any
  masterUDGroup3: any
  remark: string
  isOpeningBalance: boolean
  isItemPriceTaxInclusive: boolean
  isDisplayTaxInclusive: boolean
  isHomeCurrency: boolean
  /* #region  special to pass in precision */
  maxPrecision: number
  maxPrecisionTax: number
  /* #endregion */

  isPricingApproval?: boolean
  
  isPriority?: boolean
  isPriorityDate?: Date
  
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}

export interface OtherAmount {
  lineId: number
  headerId: number
  amountCode: string
  amountDescription: string
  amountExpression: string
  currentSubtotal: number
  totalAmount: number
  cumulativeAmount: number
  sequence: number
}
