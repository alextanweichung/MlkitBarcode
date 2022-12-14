export interface PromotionMaster {
   promoEventId: number,
   description: string,
   priority: number,
   isMember: boolean,
   isStaff: boolean,
   itemType: string,
   promoRuleType: string,
   sortingSequence: string,
   isRepeat: boolean,  
   isCheckEligibleAmount: boolean,
   eligibleBillAmount: number,
   startDate: Date,
   endDate: Date,
   line?: PromotionLine[],
   itemList?: PromotionItemList[]
}

export interface PromotionLine {
   promoEventId: number,
   promoEventLineId: number,
   promoRuleType: string,
   lineItemType: string,
   rowSequence: number,
   impactId: number,    
   impactCode: string,
   impactType: string,
   impactDiscExpr: number,
   discountType: string,   
   lineItemList?: PromotionLineItemList[]
}

export interface PromotionItemList {
   promoEventItemListId: number, 
   promoEventId: number,
   isImpactOnly: boolean,
   itemId: number
}

export interface PromotionLineItemList {
   promoEventLineItemListId: number, 
   promoEventLineId: number,
   promoEventId: number,
   itemId: number
}

export interface PromotionItemInfo {
   itemId: number
   itemCode: string
   description: string
   impactOnly?: any
}