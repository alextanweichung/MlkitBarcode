export interface PosBillRoot {
   header: PosBillHeader
   details: PosBillDetail[]
   payment: PosBillPayment[]
 }
 
 export interface PosBillHeader {
   posBillId: number
   posDatabaseId: number
   posRunningNum: number
   posBillNum: string
   posBillType: string
   referenceId: any
   referenceNum: any
   trxDate: string
   trxDateTime: string
   locationId: number
   locationCode: string
   stationNum: number
   promoterId: number
   promoterName: string
   posMemberId: any
   posMemberName: any
   posMemberSegmentId: any
   posEmployeeId: any
   posEmployeeName: any
   posEmployeeSegmentId: any
   grossAmt: number
   discountGroupId1: any
   discountGroupCode1: any
   discountGroupId2: any
   discountGroupCode2: any
   discountExpression: any
   billDiscountExpression1: any
   billDiscountExpression2: any
   discountAmt: number
   totalLineDiscAmt: number
   taxAmt: number
   roundingAmt: number
   adjustmentAmt: number
   totalAmt: number
   changeAmt: number
   voucherAdjustmentAmt: number
   attrStr01: any
   attrStr02: any
   attrStr03: any
   attrStr04: any
   attrStr05: any
   attrNum01: any
   attrNum02: any
   attrNum03: any
   attrNum04: any
   attrNum05: any
   totalQty: number
   promotionId: any
   promotionDesc: any
   posOfferId: any
   posOfferCode: any
   posOfferCodeExpression: any
   deactivatedType: string
   deactivatedReason: any
   deactivatedAt: any
   deactivatedBy: any
   employeeBalanceLimit: any
   permissionOverrideFor: any
   permissionOverrideById: any
   permissionOverrideByName: any
   printCount: any
   isMultiOffer: any
   posMultiOfferId: any
   posMultiOfferCode: any
   billToName: any
   billToAddress: any
   billToContact: any
   billToTaxNum: any
   billToRemark: any
   posOfferRefNum: any
   pointBalance: any
   pointToEarn: any
   serviceLevelRateId: any
   sequence: any
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
 }
 
 export interface PosBillDetail {
   posBillLineId: number
   posBillId: number
   posDatabaseLineId: number
   uuid: string
   posDatabaseId: number
   itemId: number
   itemCode: string
   imgUrl: string
   description: string
   itemVariationXId: number
   itemVariationYId: any
   itemVariationXDesc: string
   itemVariationYDesc: any
   itemSku: string
   itemBarcode: string
   itemBrandId: number
   itemGroupId: number
   itemCategoryId: number
   itemDepartmentId: any
   itemSeasonId: any
   qtyRequest: number
   unitPrice: number
   discountGroupId1: string
   discountGroupCode1: string
   discountGroupId2: any
   discountGroupCode2: any
   discountExpression: any
   discountExpression1: any
   discountExpression2: any
   discountAmt: number
   discountedUnitPrice: number
   taxId: any
   taxPct: number
   taxAmt: number
   totalAmt: number
   promoId: any
   posOfferId: any
   posOfferCode: any
   posOfferCodeExpression: any
   isPriceOverride: any
   isDiscOverride: any
   attrStr01: any
   attrStr02: any
   attrStr03: any
   attrStr04: any
   attrStr05: any
   attrNum01: any
   attrNum02: any
   attrNum03: any
   attrNum04: any
   attrNum05: any
   promotionDesc: any
   oriUnitPrice: number
   oriDiscountGroupId1: number
   oriDiscountGroupCode1: string
   oriDiscountGroupId2: any
   oriDiscountGroupCode2: any
   oriDiscountExpression: any
   oriDiscountExpression1: any
   oriDiscountExpression2: any
   oriDiscountAmt: number
   oriLineAmt: number
   isPromoImpactApplied: any
   promoImpactedQty: any
   promoImpactedType: any
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
 }
 
 export interface PosBillPayment {
   posBillPaymentId: number
   posBillId: number
   posDatabasePaymentId: number
   posDatabaseId: number
   paymentTypeId: number
   paymentTypeCategory: string
   paymentTypeDesc: string
   cardMerchantId: any
   cardMerchantCode: any
   totalAmt: number
   offsetAmt: number
   refNo01: any
   refNo02: any
   refNo03: any
   refNo04: any
   refNo05: any
   salesDepositId: any
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
 }
 