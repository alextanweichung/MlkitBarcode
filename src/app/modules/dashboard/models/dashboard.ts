import { TransactionProcessingCount } from "src/app/shared/models/transaction-processing"
import { QuotationList } from "../../transactions/models/quotation"
import { SalesOrderList } from "../../transactions/models/sales-order"

export interface Dashboard {
  memo: Memo[]
  quotationReviewCount: TransactionProcessingCount
  quotationApprovalCount: TransactionProcessingCount
  salesOrderReviewCount: TransactionProcessingCount
  salesOrderApprovalCount: TransactionProcessingCount
  purchaseOrderReviewCount: TransactionProcessingCount
  purchaseOrderApprovalCount: TransactionProcessingCount
  quotationList: QuotationList[]
  salesOrderList: SalesOrderList[]
}

export interface Memo {
  header: MemoHeader
  details: MemoDetail[]
}

export interface MemoHeader {
  announcementId: number
  subject: string
  body: string
  effectiveFrom: string
  effectiveTo: string
  userGroupId: any
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: number
  modifiedBy: string
  modifiedAt: string
  deactivated: boolean
}

export interface MemoDetail {
  filesId: number
  filesName: string
  filesType: string
  filesPath: any
  filesSize: number
  controller: string
  keyId: number
  sequence: any
  createdById: any
  createdBy: any
  createdAt: any
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}

export interface AnnouncementFile {
  filesId: number,
  filesName: string,
  filesType: string
}