import { ApprovalHistory } from "src/app/shared/models/approval-history"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface BranchReceivingRoot {
    header: BranchReceivingHeader
    details: TransactionDetail[]
    approvalHistory?: ApprovalHistory[]
}

export interface BranchReceivingHeader {
    branchReceivingId: number
    branchReceivingNum: string
    procurementAgentId: number
    trxDate: string
    trxDateTime: string
    typeCode: string
    vendorId: number
    attention: any
    locationId: number
    termPeriodId: number
    forwarderId: any
    workFlowTransactionId: number
    etaDate: any
    cancelDate: any
    countryId: number
    currencyId: number
    currencyRate: number
    branchReceivingUDField1: any
    branchReceivingUDField2: any
    branchReceivingUDField3: any
    branchReceivingUDOption1: any
    branchReceivingUDOption2: any
    branchReceivingUDOption3: any
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
    remark: any
    isItemPriceTaxInclusive: boolean
    isDisplayTaxInclusive: boolean
    isHomeCurrency: boolean
    /* #region  special to pass in precision */
    maxPrecision: number
    maxPrecisionTax: number
    /* #endregion */
    sequence: number
    createdById: number
    createdBy: string
    createdAt: string
    modifiedById: any
    modifiedBy: any
    modifiedAt: any
    deactivated: boolean
}

export interface BranchReceivingDto {
    header: BranchReceiving
    details: BranchReceivingLine[]
}

export interface BranchReceiving {
    branchReceivingId?: number
    branchReceivingNum?: string
    procurementAgentId?: number
    trxDate?: string
    trxDateTime?: string
    typeCode?: string
    vendorId?: number
    attention?: any
    locationId?: number
    termPeriodId?: number
    forwarderId?: any
    workFlowTransactionId?: number
    etaDate?: any
    cancelDate?: any
    countryId?: number
    currencyId?: number
    currencyRate?: number
    branchReceivingUDField1?: any
    branchReceivingUDField2?: any
    branchReceivingUDField3?: any
    branchReceivingUDOption1?: any
    branchReceivingUDOption2?: any
    branchReceivingUDOption3?: any
    totalGrossAmt?: number
    totalDiscAmt?: number
    totalTaxAmt?: number
    grandTotal?: number
    grandTotalExTax?: number
    localTotalGrossAmt?: number
    localTotalDiscAmt?: number
    localTotalTaxAmt?: number
    localGrandTotal?: number
    localGrandTotalExTax?: number
    printCount?: number
    externalDocNum?: any
    masterUDGroup1?: any
    masterUDGroup2?: any
    masterUDGroup3?: any
    remark?: any
    isItemPriceTaxInclusive?: boolean
    isDisplayTaxInclusive?: boolean
    sequence?: number
    createdById?: number
    createdBy?: string
    createdAt?: string
    modifiedById?: any
    modifiedBy?: any
    modifiedAt?: any
    deactivated?: boolean
}

export interface BranchReceivingLine {
    branchReceivingLineId?: number
    branchReceivingId?: number
    itemId?: number
    itemVariationXId?: number
    itemVariationYId?: number
    itemCode: string
    itemSku: string
    itemUomId?: number
    description: string
    extendedDescription: string
    qtyRequest?: number
    unitPrice?: number
    subTotal?: number
    sequence?: number
    locationId?: number
    deactivated?: boolean
}