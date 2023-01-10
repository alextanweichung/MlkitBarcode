import { Injectable } from '@angular/core';
import { MasterListDetails } from '../models/master-list-details';
import { PromotionLine, PromotionLineItemList, PromotionMaster } from '../models/promotion-engine';
import { TransactionDetail } from '../models/transaction-detail';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class PromotionEngineService {

  constructor(private commonService: CommonService) { }

  runPromotionEngine(salesBillLine: TransactionDetail[], promotionObject: PromotionMaster[], useTax: boolean, isItemPriceTaxInclusive: boolean, isDisplayTaxInclusive: boolean, roundingPrecision: number, discountGroupList: MasterListDetails[], debugFlag: boolean) {
    if (debugFlag) {
      console.log("================ START ================");
      console.log("Promotion Object: ");
      console.log(promotionObject);
    }
    //Look for PWP Discount Code
    let pwp: MasterListDetails = discountGroupList.find(x => x.attribute2 == "W");

    let totalBillAmount = salesBillLine.reduce((sum, current) => sum + current.subTotal, 0);
    //Reset all PWP calculation, Or member/employee discount scheme
    salesBillLine.forEach(line => {
      line = this.commonService.reversePromoImpact(line);
      line = this.commonService.computeDiscTaxAmount(line, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision)
    })
    //#region "First Loop - Promotion Event"
    for (let event of promotionObject) {
      //Check affected item type, sortingSequence, promoRuleType, isRepeat, isCheckDiscountCategory
      let eventItemType: string = event.itemType;                         //itemType - A: All Item, S: Specific Item
      let eventItemList: number[] = [];                                   //Affected item list
      let impactItemList: number[] = [];                                  //Affected item list for impact only
      let itemSortingSeq: string = event.sortingSequence;                 //sortingSequence - C: Cheapest First, E: Expensive First
      let itemRuleTypeCheck: string = event.promoRuleType;                //promoRuleType - Q: Quantity, A: Amount
      let isRepeat: boolean = event.isRepeat;                             //Should recursively run the rules for all item?
      let isValidateEligibleAmount: boolean = event.isCheckEligibleAmount //Should system check for total eligible Amount
      let eligibleAmt: number = event.eligibleBillAmount;                 //Eligible amount for promotion
      let eligibleAmtCheck: boolean = true;                               //Default the check result to true in case validation not required
      if (eventItemType == "S") {
        impactItemList = event.itemList.filter(x => x.isImpactOnly).map(x => x.itemId);
        eventItemList = event.itemList.filter(x => !x.isImpactOnly).map(x => x.itemId);
      } else {
        let lineImpactItemList: PromotionLineItemList[] = [];
        //If eventItemType is for All Item, look for event line, whether there is any row with specific item (If found, run for logic Buy X Impact Y)
        event.line.forEach(line => {
          if (line.lineItemType == "S") {
            lineImpactItemList = line.lineItemList;
          }
        })
        impactItemList = lineImpactItemList.map(x => x.itemId);
      }

      //Create a copy of original salesBillLine, and check whether scanned item is in itemList
      let affectedSalesBillLine: TransactionDetail[] = JSON.parse(JSON.stringify(salesBillLine));
      let onlyImpactSalesBillLine: TransactionDetail[] = [];
      if (eventItemType == "S") {
        onlyImpactSalesBillLine = affectedSalesBillLine.filter(line => impactItemList.includes(line.itemId));
        if (itemRuleTypeCheck != "A") {
          affectedSalesBillLine = affectedSalesBillLine.filter(line => eventItemList.includes(line.itemId));
        }
      } else {
        onlyImpactSalesBillLine = affectedSalesBillLine.filter(line => impactItemList.includes(line.itemId));
        //Filter affectedSalesBill, maintain those not in impactItemList only
        if (impactItemList.length > 0) {
          if (itemRuleTypeCheck != "A") {
            affectedSalesBillLine = affectedSalesBillLine.filter(line => !impactItemList.includes(line.itemId));
          }
        }
      }

      if (isValidateEligibleAmount) {
        let currentItemListAmount = affectedSalesBillLine.reduce((sum, current) => sum + current.subTotal, 0);
        if (itemRuleTypeCheck == "A") {
          if (totalBillAmount < eligibleAmt) {
            eligibleAmtCheck = false;
          }
        } else {
          if (currentItemListAmount < eligibleAmt) {
            eligibleAmtCheck = false;
          }
        }
      }

      //Only include item without promo id
      affectedSalesBillLine = affectedSalesBillLine.filter(x => x.promoEventId == null);
      if (debugFlag) {
        console.log("[Before impact] Promo Event: " + event.description)
        console.log("[Before impact] Affected Sales Bill Line: ")
        console.log(affectedSalesBillLine)
        console.log("[Before impact] Only Impact Sales Bill Line: ")
        console.log(onlyImpactSalesBillLine)
      }
      //Continue with remaining promotion calculation only when scanned item is in itemList, & passing the eligible amount checking
      if ((affectedSalesBillLine.length > 0 && eligibleAmtCheck) || (eventItemType == "A" && itemRuleTypeCheck == "Q" && eligibleAmtCheck)) {
        //Check promoRuleType is Quantity or Amount: For Quantity, start 2nd loop. For Amount, no need loop.
        if (event.line.length > 0) {
          //Check what type of condition, whether is based on total amount or quantity
          switch (itemRuleTypeCheck) {
            case "A":
              // let billImpactCode: string = event.line[0].impactCode;            //B01: Set Bill Disc Amount, B02: Set Bill Disc Percentage
              // let impactValue: number = event.line[0].impactDiscExpr;
              // switch(billImpactCode){
              //   case "B01":
              //     salesBill.billDiscId1 = pwp.objectId;
              //     salesBill.billDiscCode1 = pwp.code;
              //     salesBill.billDiscExpr1 = impactValue.toString();
              //     salesBill.billDiscExpr = impactValue.toString();
              //     salesBill.billDiscId2 = null;
              //     salesBill.billDiscCode2 = null;
              //     salesBill.billDiscExpr2 = null;
              //     salesBill.promoId = event.promoEventId;
              //     salesBill.promoDesc = event.description;
              //     break;
              //   case "B02":
              //     salesBill.billDiscId1 = pwp.objectId;
              //     salesBill.billDiscCode1 = pwp.code;
              //     salesBill.billDiscExpr1 = impactValue.toString() + '%';  
              //     salesBill.billDiscExpr = impactValue.toString() + '%';  
              //     salesBill.billDiscId2 = null;
              //     salesBill.billDiscCode2 = null;
              //     salesBill.billDiscExpr2 = null;
              //     salesBill.promoId = event.promoEventId;
              //     salesBill.promoDesc = event.description;                
              //     break;
              // }
              break;
            case "Q":
              //Sort affectedSalesBillLine based on cheapest/expensive first
              let sortedAffectedSalesBillLine: TransactionDetail[] = JSON.parse(JSON.stringify(affectedSalesBillLine));
              if (itemSortingSeq == "C") {
                sortedAffectedSalesBillLine.sort((a, b) => (a.discountedUnitPrice < b.discountedUnitPrice ? -1 : 1));
                if (onlyImpactSalesBillLine.length > 0) {
                  onlyImpactSalesBillLine.sort((a, b) => (a.discountedUnitPrice < b.discountedUnitPrice ? -1 : 1));
                }
              } else {
                sortedAffectedSalesBillLine.sort((a, b) => (a.discountedUnitPrice < b.discountedUnitPrice ? 1 : -1));
                if (onlyImpactSalesBillLine.length > 0) {
                  onlyImpactSalesBillLine.sort((a, b) => (a.discountedUnitPrice < b.discountedUnitPrice ? 1 : -1));
                }
              }

              let eventLineArray: PromotionLine[] = event.line;
              let eventLineImpactArray: PromotionLine[] = event.line.filter(x => x.impactCode != "L00");
              //Sorting of promotion line by rowSequence (Asc)
              eventLineArray.sort((a, b) => (a.rowSequence < b.rowSequence ? -1 : 1));
              //Sorting of promotion line impact by rowSequence (Desc)
              eventLineImpactArray.sort((a, b) => (a.rowSequence < b.rowSequence ? 1 : -1));
              let impactLogicType: number = 0   //1: Apply logic based on total quantity, also for L09 - Set Total Amount,  2: Apply logic based on row, 3: Apply logic for buy X impact Y
              //For salesBillLine with onlyImpactSalesBillLine, this should undergo Buy X Impact Y logic
              if (impactItemList.length > 0) {
                impactLogicType = 3;
                //For onlyImpactSalesBillLine is empty, undergo logic type 1 or 2
              } else {
                if (eventLineImpactArray.length > 0) {
                  switch (eventLineImpactArray[0].impactCode) {
                    //Set Row Disc Amount
                    case "L01":
                      impactLogicType = 2;
                      break;
                    //Set Row Disc % 
                    case "L02":
                      impactLogicType = 2;
                      break;
                    //Set Total Disc Amount
                    case "L03":
                      impactLogicType = 1;
                      break;
                    //Set Total Disc %
                    case "L04":
                      impactLogicType = 1;
                      break;
                    //Add Row Disc Amount
                    case "L05":
                      impactLogicType = 2;
                      break;
                    //Add Row Disc %
                    case "L06":
                      impactLogicType = 2;
                      break;
                    //Add Total Disc Amount
                    case "L07":
                      impactLogicType = 1;
                      break;
                    //Add Total Disc %
                    case "L08":
                      impactLogicType = 1;
                      break;
                    //Set Total Amount
                    case "L09":
                      impactLogicType = 1;
                      break;
                  }
                }
              }
              if (debugFlag) {
                console.log("Impact Logic Type: " + impactLogicType)
              }
              //Execute two different logic type, based on whether is impact to all quantity, or impact to row
              switch (impactLogicType) {
                //1: Impact to all quantity, 2: Impact to row, 3: Impact to 'Buy X Impact Y'
                case 1:
                  //#region "Second Loop - Condition Array"
                  let i: number = 0;
                  let pwpApplied: boolean = false;
                  for (let eventLineImpact of eventLineImpactArray) {
                    let rowNumber: number = eventLineImpact.rowSequence;
                    let currentLineQty: number = sortedAffectedSalesBillLine.reduce((sum, current) => sum + current.qtyRequest, 0);
                    let modRemainder: number = currentLineQty % rowNumber;
                    let numberOfEntitlement: number = (currentLineQty - modRemainder) / rowNumber;
                    //If promotion only allow to execute once, set number of entitlement to 1
                    if (!isRepeat && numberOfEntitlement > 1) {
                      numberOfEntitlement = 1;
                    }
                    let totalEntitlementQty: number = numberOfEntitlement * rowNumber;
                    // To handle logic of row 999, apply the discount for all item qty
                    if (eventLineImpactArray[i + 1] && rowNumber == 999) {

                      let previousRowNumber: number = eventLineImpactArray[i + 1].rowSequence;
                      i++;
                      if (currentLineQty >= previousRowNumber) {
                        totalEntitlementQty = currentLineQty;
                      }
                      if (debugFlag) {
                        console.log("Max Row 999. Total Entitlement Qty: " + totalEntitlementQty);
                      }
                    }
                    let lineImpactCode: string = eventLineImpact.impactCode;
                    let lineImpactValue: number = eventLineImpact.impactDiscExpr;
                    //Calculate total discount based on entitlement
                    let cumulatedQty: number = 0;
                    let remainingQty: number = totalEntitlementQty;
                    let cumulatedAmt: number = 0;
                    //Create a copy in order to use by 'Set Total Amount'
                    let duplicateSortedAffectedSalesBillLine: TransactionDetail[] = JSON.parse(JSON.stringify(sortedAffectedSalesBillLine));
                    if (debugFlag) {
                      console.log("[Setting of Total Qty] Current Line Qty | Row number | Entitlement Qty | No. Entitlement: " + currentLineQty + " | " + rowNumber + " | " + totalEntitlementQty + " | " + numberOfEntitlement)
                    }
                    //#region "Third Loop - Affected SalesBillLine"
                    for (let line of sortedAffectedSalesBillLine) {
                      if (debugFlag) {
                        console.log("=== Current loop is for: [Row " + rowNumber + "] " + line.itemCode + " ===")
                      }
                      if (cumulatedQty != totalEntitlementQty && line.qtyRequest != 0) {
                        //Look for SalesBillLine to apply discount
                        let impactedLine: TransactionDetail = salesBillLine.find(originalLine => originalLine.uuid == line.uuid);
                        let unitPrice = isItemPriceTaxInclusive ? line.unitPrice : line.unitPriceExTax;
                        //If qtyRequest is less than or equals to remainingQty, take the entire qtyRequest
                        if (line.qtyRequest <= remainingQty) {
                          cumulatedQty += line.qtyRequest;
                          remainingQty = remainingQty - line.qtyRequest;
                          cumulatedAmt += (unitPrice * line.qtyRequest);
                          let promoDisc: number = 0;
                          let impactType: number = 0;   //0: Do not execute, 1: Replace Disc, 2: Add Disc
                          //Based on impact code to determine what will be the discount
                          switch (lineImpactCode) {
                            //Set Row Disc Amount
                            case "L01":
                              impactType = 0;
                              break;
                            //Set Row Disc % 
                            case "L02":
                              impactType = 0;
                              break;
                            //Set Total Disc Amount
                            case "L03":
                              promoDisc = lineImpactValue * line.qtyRequest;
                              impactType = 1;
                              break;
                            //Set Total Disc %
                            case "L04":
                              promoDisc = unitPrice * line.qtyRequest * lineImpactValue / 100;
                              impactType = 1;
                              break;
                            //Add Row Disc Amount
                            case "L05":
                              impactType = 0;
                              break;
                            //Add Row Disc %
                            case "L06":
                              impactType = 0;
                              break;
                            //Add Total Disc Amount
                            case "L07":
                              promoDisc = lineImpactValue * line.qtyRequest;
                              impactType = 2;
                              break;
                            //Add Total Disc %
                            case "L08":
                              promoDisc = line.discountedUnitPrice * line.qtyRequest * lineImpactValue / 100;
                              impactType = 2;
                              break;
                            //Set Total Amount
                            case "L09":
                              impactType = 0;
                              break;
                          }
                          if (impactType == 1) {
                            impactedLine = this.replacePromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                          } else if (impactType == 2) {
                            impactedLine = this.addPromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                          }
                          //Set qtyRequest to 0, to exclude from further calculation, as entire list already got the correct impact
                          line.qtyRequest = 0;
                          if (debugFlag) {
                            console.log("[After impact qtyRequest<= remainingQty] Cumulated Qty | Remaining Qty: " + cumulatedQty + " | " + remainingQty)
                          }
                          //If qtyRequest is more than remainingQty, take the entire remainingQty
                        } else if (line.qtyRequest > remainingQty) {
                          cumulatedQty += remainingQty;
                          cumulatedAmt += (unitPrice * remainingQty);
                          let promoDisc: number = 0;
                          let impactType: number = 0;   //0: Do not execute, 1: Replace Disc, 2: Add Disc
                          //Based on impact code to determine what will be the discount
                          switch (lineImpactCode) {
                            //Set Row Disc Amount
                            case "L01":
                              impactType = 0;
                              break;
                            //Set Row Disc % 
                            case "L02":
                              impactType = 0;
                              break;
                            //Set Total Disc Amount
                            case "L03":
                              promoDisc = lineImpactValue * remainingQty;
                              impactType = 1;
                              break;
                            //Set Total Disc %
                            case "L04":
                              promoDisc = unitPrice * remainingQty * lineImpactValue / 100;
                              impactType = 1;
                              break;
                            //Add Row Disc Amount
                            case "L05":
                              impactType = 0;
                              break;
                            //Add Row Disc %
                            case "L06":
                              impactType = 0;
                              break;
                            //Add Total Disc Amount
                            case "L07":
                              promoDisc = lineImpactValue * remainingQty;
                              impactType = 2;
                              break;
                            //Add Total Disc %
                            case "L08":
                              promoDisc = line.discountedUnitPrice * remainingQty * lineImpactValue / 100;
                              impactType = 2;
                              break;
                            //Set Total Amount
                            case "L09":
                              impactType = 0;
                              break;
                          }
                          if (impactType == 1) {
                            impactedLine = this.replacePromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                          } else if (impactType == 2) {
                            impactedLine = this.addPromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                          }
                          //Set qtyRequest to qty not yet go through promotion impact, for next loop calculation
                          line.qtyRequest = line.qtyRequest - remainingQty;
                          remainingQty = 0;
                          if (debugFlag) {
                            console.log("[After impact qtyRequest>remainingQty] Cumulated Qty | Line Qty: " + cumulatedQty + " | " + line.qtyRequest);
                          }
                        }
                      }
                    }
                    //#endregion "Third Loop - Affected SalesBillLine"

                    //#region "Third Loop - Affected SalesBillLine To Set Total Amount"
                    //This loop is only meant to set the total discount amount for PWP: Set Total Amount To
                    //As we need to get the cumulated amount from previous loop, then only assign in current loop.
                    if (lineImpactCode == "L09") {
                      //Calculate total discount based on entitlement
                      let cumulatedQty2: number = 0;
                      let remainingQty2: number = totalEntitlementQty;
                      let totalDiscApplied: number = 0;
                      let totalDiscToApply: number = this.commonService.roundToPrecision((cumulatedAmt - (lineImpactValue * numberOfEntitlement)), roundingPrecision);
                      let lastLineIndex = numberOfEntitlement * rowNumber;
                      let unaffectedQty: number = 0;
                      if (numberOfEntitlement == 0 && currentLineQty > totalEntitlementQty) {
                        unaffectedQty = currentLineQty - totalEntitlementQty;

                      }
                      if (debugFlag) {
                        console.log("[Setting of Total Amount] Discount to apply: " + totalDiscToApply);
                        console.log("[Setting of Total Amount] Unaffected Qty: " + unaffectedQty);
                      }
                      duplicateSortedAffectedSalesBillLine.forEach((line, index) => {
                        //Look for SalesBillLine to apply discount
                        let impactedLine: TransactionDetail = salesBillLine.find(originalLine => originalLine.uuid == line.uuid);
                        if (cumulatedQty2 != totalEntitlementQty && line.qtyRequest != 0) {
                          let unitPrice = isItemPriceTaxInclusive ? line.unitPrice : line.unitPriceExTax;
                          //If qtyRequest is less than or equals to remainingQty2, take the entire qtyRequest
                          if (line.qtyRequest <= remainingQty2) {
                            cumulatedQty2 += line.qtyRequest;
                            remainingQty2 = remainingQty2 - line.qtyRequest;
                            // let promoDisc: number = this.commonService.roundToTwoDecimal((cumulatedAmt - lineImpactValue) / rowNumber * line.qtyRequest);
                            let promoDisc: number = 0;
                            if (cumulatedQty2 == lastLineIndex) {
                              //If it is last item, get the total discount by subtraction
                              promoDisc = this.commonService.roundToPrecision((totalDiscToApply - totalDiscApplied), roundingPrecision);
                            } else {
                              //Calculate pro rated promotion discount
                              promoDisc = this.commonService.roundToPrecision((totalDiscToApply * line.qtyRequest * unitPrice / cumulatedAmt), roundingPrecision);
                              totalDiscApplied += promoDisc;
                            }
                            if (promoDisc < 0) {
                              promoDisc = 0;
                            }
                            pwpApplied = true;
                            impactedLine = this.replacePromoDiscAmt(impactedLine, promoDisc, event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp);

                            //Set qtyRequest to 0, to exclude from further calculation, as entire list already got the correct impact
                            line.qtyRequest = 0;
                            //If qtyRequest is more than remainingQty2, take the entire remainingQty2
                          } else if (line.qtyRequest > remainingQty2) {
                            cumulatedQty2 += remainingQty2;
                            //let promoDisc: number = this.commonService.roundToTwoDecimal((cumulatedAmt - lineImpactValue) / rowNumber * remainingQty2);
                            let promoDisc: number = 0;
                            if (cumulatedQty2 == lastLineIndex) {
                              //If it is last item, get the total discount by subtraction
                              promoDisc = this.commonService.roundToPrecision((totalDiscToApply - totalDiscApplied), roundingPrecision);
                            } else {
                              //Calculate pro rated promotion discount
                              promoDisc = this.commonService.roundToPrecision((totalDiscToApply * remainingQty2 * unitPrice / cumulatedAmt), roundingPrecision);
                              totalDiscApplied += promoDisc;
                            }
                            if (promoDisc < 0) {
                              promoDisc = 0;
                            }
                            pwpApplied = true;
                            impactedLine = this.replacePromoDiscAmt(impactedLine, promoDisc, event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp);
                            //Set qtyRequest to qty not yet go through promotion impact, for next loop calculation
                            line.qtyRequest = line.qtyRequest - remainingQty2;
                            remainingQty2 = 0;
                          }
                        } else {
                          let unitPrice = isItemPriceTaxInclusive ? line.unitPrice : line.unitPriceExTax;
                          let lineDiscAmount: number = unitPrice - line.discountedUnitPrice
                          if (lineDiscAmount > 0 && unaffectedQty > 0 && pwpApplied && impactedLine.qtyRequest > 1) {
                            let additionalDisc = lineDiscAmount * unaffectedQty;
                            impactedLine = this.replacePromoDiscAmt(impactedLine, additionalDisc, event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp);
                          }
                        }
                      })
                    }
                    //#endregion "Third Loop - Affected SalesBillLine To Set Total Amount"
                  }
                  //#endregion "Second Loop - Condition Array"
                  break;
                //1: Impact to all quantity, 2: Impact to row, 3: Impact to 'Buy X Impact Y'
                case 2:
                  //#region "Second Loop - Condition Array"
                  for (let eventLineImpact of eventLineImpactArray) {
                    let maxRowNum: number = eventLineImpact.rowSequence;
                    let currentLineQty: number = sortedAffectedSalesBillLine.reduce((sum, current) => sum + current.qtyRequest, 0);
                    let totalEntitlementQty: number;
                    let numberOfEntitlement: number
                    let cumulatedQty: number = 0;
                    let remainingQty: number = 0;
                    //Create a discount array based on number of entitlement by looping through all event line array
                    let discountArray: number[] = [];
                    let discountArrayType: string = "";      //A: Amount, P: Percentage
                    let discountArrayOperation: string = ""; //R: Replace discount, A: Add discount
                    //Create a copy for data manipulation
                    let duplicateEventLineArray: PromotionLine[] = JSON.parse(JSON.stringify(eventLineArray));
                    //To handle impacts that will be applied for onwards item
                    if (maxRowNum === 999) {
                      if (debugFlag) {
                        console.log("Max Row 999")
                      }
                      //Find previous line of Row 999 to get rowSequence
                      let currentIndex: number = eventLineArray.findIndex(x => x.rowSequence == maxRowNum);
                      let previousEventLine = eventLineArray[currentIndex - 1];
                      let previousMaxRowNum = previousEventLine.rowSequence;
                      let loopCount: number = 0;
                      //Use currentLineQty to calculate number of last rule to repeat
                      if (previousMaxRowNum < currentLineQty) {
                        numberOfEntitlement = 1;
                        totalEntitlementQty = currentLineQty;
                        remainingQty = totalEntitlementQty;
                        loopCount = currentLineQty - previousMaxRowNum;
                        //Push additional discount for item scanned onwards
                        for (let i = 1; i < loopCount; i++) {
                          duplicateEventLineArray.push(eventLineImpact);
                        }
                        //Sorting of promotion line impact (all) by rowSequence (Desc)
                        duplicateEventLineArray.sort((a, b) => (a.rowSequence < b.rowSequence ? 1 : -1));
                      } else {
                        numberOfEntitlement = 0;
                      }
                      //To handle normal row item impact
                    } else {
                      if (debugFlag) {
                        console.log("Max Row is normal number");
                      }
                      let modRemainder: number = currentLineQty % maxRowNum;
                      numberOfEntitlement = (currentLineQty - modRemainder) / maxRowNum;
                      //If promotion only allow to execute once, set number of entitlement to 1
                      if (!isRepeat && numberOfEntitlement > 1) {
                        numberOfEntitlement = 1;
                      }
                      totalEntitlementQty = numberOfEntitlement * maxRowNum;
                      remainingQty = totalEntitlementQty;
                      let currentIndex: number = eventLineArray.findIndex(x => x.rowSequence == maxRowNum);
                      duplicateEventLineArray.splice(currentIndex + 1, eventLineArray.length - currentIndex - 1);
                      //Sorting of promotion line impact (all) by rowSequence (Desc)
                      duplicateEventLineArray.sort((a, b) => (a.rowSequence < b.rowSequence ? 1 : -1));
                      if (isRepeat) {
                        let repeatEventLineArray: PromotionLine[] = [];
                        let repeatNumber: number = Math.floor(currentLineQty / maxRowNum);
                        if (modRemainder > 0 && repeatNumber >= 1) {
                          numberOfEntitlement = 1;
                          repeatEventLineArray = [...repeatEventLineArray, ...duplicateEventLineArray];
                          if (repeatNumber > 1) {
                            for (let i = 1; i < repeatNumber; i++) {
                              repeatEventLineArray = [...repeatEventLineArray, ...duplicateEventLineArray];
                            }
                          }
                          let copyEventArray: PromotionLine[] = JSON.parse(JSON.stringify(duplicateEventLineArray));
                          let remainingData: PromotionLine[] = copyEventArray.splice(copyEventArray.length - modRemainder, modRemainder);
                          if (remainingData.length == 1 && remainingData[0].impactCode == 'L00') {
                            // Do nothing if the first line is for no impact
                          } else {
                            repeatEventLineArray = [...repeatEventLineArray, ...remainingData];
                            totalEntitlementQty += modRemainder;
                            remainingQty = totalEntitlementQty;
                          }
                          duplicateEventLineArray = repeatEventLineArray;
                        }
                      }
                    }
                    //#region "Third Loop - Duplicate Event Array"
                    if (debugFlag) {
                      console.log("[Setting of Row Impact ] Duplicate event array: ")
                      console.log(duplicateEventLineArray)
                    }
                    for (let eventLine of duplicateEventLineArray) {
                      let lineImpactCode: string = eventLine.impactCode;
                      let lineImpactValue: number = eventLine.impactDiscExpr;
                      //Based on impact code to determine what will be the discount
                      switch (lineImpactCode) {
                        //No impact
                        case "L00":
                          for (let i = 0; i < numberOfEntitlement; i++) {
                            discountArray.push(-1);
                          }
                          break;
                        //Set Row Disc Amount
                        case "L01":
                          discountArrayType = "A";
                          discountArrayOperation = "R";
                          for (let i = 0; i < numberOfEntitlement; i++) {
                            discountArray.push(lineImpactValue);
                          }
                          break;
                        //Set Row Disc % 
                        case "L02":
                          discountArrayType = "P";
                          discountArrayOperation = "R";
                          for (let i = 0; i < numberOfEntitlement; i++) {
                            discountArray.push(lineImpactValue);
                          }
                          break;
                        //Set Total Disc Amount
                        case "L03":
                          break;
                        //Set Total Disc %
                        case "L04":
                          break;
                        //Add Row Disc Amount
                        case "L05":
                          discountArrayType = "A";
                          discountArrayOperation = "A";
                          for (let i = 0; i < numberOfEntitlement; i++) {
                            discountArray.push(lineImpactValue);
                          }
                          break;
                        //Add Row Disc %
                        case "L06":
                          discountArrayType = "P";
                          discountArrayOperation = "A";
                          for (let i = 0; i < numberOfEntitlement; i++) {
                            discountArray.push(lineImpactValue);
                          }
                          break;
                        //Add Total Disc Amount
                        case "L07":
                          break;
                        //Add Total Disc %
                        case "L08":
                          break;
                        //Set Total Amount
                        case "L09":
                          break;
                      }
                    }
                    //#endregion "Third Loop - Duplicate Event Array"                    
                    if (discountArray.length > 0) {
                      //Sorting of discount array (Desc)
                      discountArray.sort((a, b) => (a < b ? 1 : -1));
                      if (debugFlag) {
                        console.log("[Setting of Row Impact ] Discount array: ")
                        console.log(discountArray)
                      }
                      //#region "Third Loop - Affected SalesBillLine - Set Row Impact"
                      for (let line of sortedAffectedSalesBillLine) {
                        if (cumulatedQty != totalEntitlementQty && line.qtyRequest != 0) {
                          //Look for SalesBillLine to apply discount
                          let impactedLine: TransactionDetail = salesBillLine.find(originalLine => originalLine.uuid == line.uuid);
                          let unitPrice = isItemPriceTaxInclusive ? line.unitPrice : line.unitPriceExTax;
                          if (line.qtyRequest <= remainingQty) {
                            cumulatedQty += line.qtyRequest;
                            remainingQty = remainingQty - line.qtyRequest;
                            let promoDisc: number = this.computeDiscAmtFromDiscArray(line, discountArray, discountArrayOperation, discountArrayType, line.qtyRequest, isItemPriceTaxInclusive);
                            line.qtyRequest = 0;
                            if (debugFlag) {
                              console.log("[Setting of Row Impact ] Current discount: " + promoDisc);
                            }
                            //Apply impact when promotion discount is not 0   
                            if (promoDisc != 0) {
                              if (discountArrayOperation == "R") {
                                impactedLine = this.replacePromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                              } else if (discountArrayOperation == "A") {
                                impactedLine = this.addPromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                              }
                              //Assign promotion id when promotion discount is 0, as the line is consider as trigger item line
                            } else {
                              if (line.promoEventId == null) {
                                line.qtyRequest = 0;
                                let conditionLine: TransactionDetail = salesBillLine.find(originalLine => originalLine.uuid == line.uuid);
                                conditionLine = this.assignPromoIdToSalesBillLine(conditionLine, event);
                              }
                            }

                          } else if (line.qtyRequest > remainingQty) {
                            cumulatedQty += remainingQty;
                            //Set qtyRequest to qty not yet go through promotion impact, for next loop calculation
                            line.qtyRequest = line.qtyRequest - remainingQty;
                            let promoDisc: number = this.computeDiscAmtFromDiscArray(line, discountArray, discountArrayOperation, discountArrayType, remainingQty, isItemPriceTaxInclusive);
                            remainingQty = 0;
                            if (debugFlag) {
                              console.log("[Setting of Row Impact ] Current discount: " + promoDisc);
                            }
                            //Apply impact when promotion discount is not 0   
                            if (promoDisc != 0) {
                              if (discountArrayOperation == "R") {
                                impactedLine = this.replacePromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                              } else if (discountArrayOperation == "A") {
                                impactedLine = this.addPromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                              }
                              //Assign promotion id when promotion discount is 0, as the line is consider as trigger item line
                            } else {
                              if (line.promoEventId == null) {
                                line.qtyRequest = 0;
                                let conditionLine: TransactionDetail = salesBillLine.find(originalLine => originalLine.uuid == line.uuid);
                                conditionLine = this.assignPromoIdToSalesBillLine(conditionLine, event);
                              }
                            }
                          }
                        }
                      }
                      //End the loop if discount got applied
                      break;
                      //#endregion "Third Loop - Affected SalesBillLine - Set Row Impact"
                    }
                  }
                  //#endregion "Second loop - Condition Array"                          
                  break;
                //1: Impact to all quantity, 2: Impact to row, 3: Impact to 'Buy X Impact Y'
                case 3:
                  //1. Look for max row with specific item
                  //2. Step backward, check whether is all item or specific item
                  //3. If all item, then splice entire array as first occurance. Sort the array after that
                  //4. Continue to look, whether there is any row with specific item
                  //5. If found, repeat the logic
                  //6. The final array will contain few sets of occurance.
                  //7. Loop through these occurance:
                  //   - Split into two types of Array: Condition Array & Impact Array, to determine numberOfEntitlement
                  //   - Based on numberOfEntitlement, compute the discountArray
                  //   - Apply the impact to onlyImpactSalesBillLine  
                  //   - Set promoId to salesBillLine which causing the impact                
                  if (onlyImpactSalesBillLine.length == 0) {
                    break;
                  }
                  //Create a copy for data manipulation
                  let duplicateSortedAffectedSalesBillLine: TransactionDetail[] = JSON.parse(JSON.stringify(sortedAffectedSalesBillLine));
                  let sortedEventLineArray: PromotionLine[] = JSON.parse(JSON.stringify(eventLineArray));
                  let eventContainer: PromotionLine[][] = [];
                  //Sorting of promotion line impact by rowSequence (Desc)
                  sortedEventLineArray.sort((a, b) => (a.rowSequence < b.rowSequence ? 1 : -1));

                  if (sortedEventLineArray.length == 1) {
                    eventContainer.push(sortedEventLineArray);
                  } else {
                    for (let eventLineImpact of sortedEventLineArray) {
                      if (eventLineImpact.lineItemType == "S") {
                        let currentIndex: number = eventLineArray.findIndex(x => x.rowSequence == eventLineImpact.rowSequence);
                        //If next line is specific item, stop current loop
                        if (currentIndex + 1 < eventLineArray.length) {
                          if (eventLineArray[currentIndex + 1].lineItemType == "S") {
                            continue;
                          }
                        }
                        //Loop currentIndex backward, until line with All Item type is found. Then splice the array and push to container
                        for (let i = currentIndex - 1; i >= 0; i--) {
                          if (eventLineArray[i].lineItemType == "A") {
                            let newEventSet: PromotionLine[] = JSON.parse(JSON.stringify(eventLineArray));
                            newEventSet.splice(currentIndex + 1, eventLineArray.length - currentIndex - 1);
                            eventContainer.push(newEventSet);
                            break;
                          }
                        }
                      }
                    }
                  }

                  if (debugFlag) {
                    console.log("[Buy X Impact Y] Event Container: ")
                    console.log(eventContainer);
                  }
                  let eventExecuted: boolean = false;
                  for (let filteredEvent of eventContainer) {
                    let triggerEvent: PromotionLine[] = filteredEvent.filter(x => x.lineItemType == "A");
                    let impactEvent: PromotionLine[] = filteredEvent.filter(x => x.lineItemType == "S");
                    let triggerQty: number = triggerEvent.length;
                    //Assign triggerQty as 1, to cater buy all item, specific item get discount
                    if (triggerQty == 0) {
                      triggerQty = 1;
                    }
                    let impactQty: number = impactEvent.length;
                    let currentLineQty: number = duplicateSortedAffectedSalesBillLine.filter(x => x.promoEventId == null).reduce((sum, current) => sum + current.qtyRequest, 0);
                    let impactLineQty: number = onlyImpactSalesBillLine.filter(x => x.promoEventId == null).reduce((sum, current) => sum + current.qtyRequest, 0);
                    let triggerModRemainder: number = currentLineQty % triggerQty;
                    let impactModRemainder: number = impactLineQty % impactQty;
                    let triggerEntitlement: number = (currentLineQty - triggerModRemainder) / triggerQty;
                    let impactEntitlement: number = (impactLineQty - impactModRemainder) / impactQty;
                    let numberOfEntitlement: number = 0;
                    //Assign numberOfEntitlement based on impactEntitlement/triggerEntitlement, whichever lower
                    if (triggerEntitlement >= impactEntitlement) {
                      numberOfEntitlement = impactEntitlement;
                    } else {
                      numberOfEntitlement = triggerEntitlement;
                    }
                    //Assign numberOfEntitlement as 1, to cater buy all item, specific item get discount
                    if (triggerEvent.length == 0 && numberOfEntitlement == 0) {
                      numberOfEntitlement = 1;
                    }
                    if (debugFlag) {
                      console.log("[Buy X Impact Y] currentLineQty | impactLineQty | triggerModRemainder | impactModRemainder | triggerEntitlement | impactEntitlement | numberOfEntitlement");
                      console.log(currentLineQty + " | " + impactLineQty + " | " + triggerModRemainder + " | " + impactModRemainder + " | " + triggerEntitlement + " | " + impactEntitlement + " | " + numberOfEntitlement);
                    }
                    //Break the loop if no impact recurrance
                    if (numberOfEntitlement == 0) {
                      continue;
                    }

                    //If promotion only allow to execute once, set number of entitlement to 1
                    if (!isRepeat && numberOfEntitlement > 1) {
                      numberOfEntitlement = 1;
                    }
                    let totalTriggerQty: number = numberOfEntitlement * triggerQty
                    let totaImpactQty: number = numberOfEntitlement * impactQty;
                    let cumulatedQty: number = 0;
                    let remainingQty: number = totaImpactQty;
                    //Create a discount array based on number of entitlement by looping through all event line array
                    let discountArray: number[] = [];
                    let discountArrayType: string = "";      //A: Amount, P: Percentage
                    let discountArrayOperation: string = ""; //R: Replace discount, A: Add discount
                    for (let eventLine of impactEvent) {
                      let lineImpactCode: string = eventLine.impactCode;
                      let lineImpactValue: number = eventLine.impactDiscExpr;
                      //Based on impact code to determine what will be the discount
                      switch (lineImpactCode) {
                        //No impact
                        case "L00":
                          for (let i = 0; i < numberOfEntitlement; i++) {
                            discountArray.push(-1);
                          }
                          break;
                        //Set Row Disc Amount
                        case "L01":
                          discountArrayType = "A";
                          discountArrayOperation = "R";
                          for (let i = 0; i < numberOfEntitlement; i++) {
                            discountArray.push(lineImpactValue);
                          }
                          break;
                        //Set Row Disc % 
                        case "L02":
                          discountArrayType = "P";
                          discountArrayOperation = "R";
                          for (let i = 0; i < numberOfEntitlement; i++) {
                            discountArray.push(lineImpactValue);
                          }
                          break;
                        //Set Total Disc Amount
                        case "L03":
                          break;
                        //Set Total Disc %
                        case "L04":
                          break;
                        //Add Row Disc Amount
                        case "L05":
                          discountArrayType = "A";
                          discountArrayOperation = "A";
                          for (let i = 0; i < numberOfEntitlement; i++) {
                            discountArray.push(lineImpactValue);
                          }
                          break;
                        //Add Row Disc %
                        case "L06":
                          discountArrayType = "P";
                          discountArrayOperation = "A";
                          for (let i = 0; i < numberOfEntitlement; i++) {
                            discountArray.push(lineImpactValue);
                          }
                          break;
                        //Add Total Disc Amount
                        case "L07":
                          break;
                        //Add Total Disc %
                        case "L08":
                          break;
                        //Set Total Amount
                        case "L09":
                          break;
                      }
                      discountArray.reverse();
                    }

                    if (discountArray.length > 0) {
                      //Sorting of discount array (Desc)
                      discountArray.sort((a, b) => (a < b ? 1 : -1));
                      if (debugFlag) {
                        console.log("[Setting of Row Impact ] Discount array: ")
                        console.log(discountArray)
                      }
                      //#region "Third Loop - Affected SalesBillLine - Set Row Impact"
                      for (let line of onlyImpactSalesBillLine) {
                        let unitPrice = isItemPriceTaxInclusive ? line.unitPrice : line.unitPriceExTax;
                        if (cumulatedQty != totaImpactQty && line.qtyRequest != 0) {
                          //Look for SalesBillLine to apply discount
                          let impactedLine: TransactionDetail = salesBillLine.find(originalLine => originalLine.uuid == line.uuid);
                          if (line.qtyRequest <= remainingQty) {
                            cumulatedQty += line.qtyRequest;
                            remainingQty = remainingQty - line.qtyRequest;
                            let promoDisc: number = this.computeDiscAmtFromDiscArray(line, discountArray, discountArrayOperation, discountArrayType, line.qtyRequest, isItemPriceTaxInclusive);
                            line.qtyRequest = 0;
                            if (debugFlag) {
                              console.log("[Setting of Row Impact ] Current discount: " + promoDisc);
                            }
                            //Apply impact when promotion discount is not 0   
                            if (promoDisc != 0) {
                              eventExecuted = true;
                              if (discountArrayOperation == "R") {
                                impactedLine = this.replacePromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                              } else if (discountArrayOperation == "A") {
                                impactedLine = this.addPromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                              }
                            }
                          } else if (line.qtyRequest > remainingQty) {
                            let unaffectedQty: number = line.qtyRequest - remainingQty;
                            if (unaffectedQty > 0) {
                              for (let i = 0; i < unaffectedQty; i++) {
                                discountArray.push(-1);
                              }
                              discountArray.sort((a, b) => (a < b ? 1 : -1));
                            }
                            cumulatedQty += remainingQty;
                            //Set qtyRequest to qty not yet go through promotion impact, for next loop calculation
                            line.qtyRequest = line.qtyRequest - remainingQty;
                            let promoDisc: number = this.computeDiscAmtFromDiscArray(line, discountArray, discountArrayOperation, discountArrayType, (remainingQty + unaffectedQty), isItemPriceTaxInclusive);
                            remainingQty = 0;
                            if (debugFlag) {
                              console.log("[Setting of Row Impact ] Current discount: " + promoDisc);
                            }
                            //Apply impact when promotion discount is not 0   
                            if (promoDisc != 0) {
                              eventExecuted = true;
                              if (discountArrayOperation == "R") {
                                impactedLine = this.replacePromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                              } else if (discountArrayOperation == "A") {
                                impactedLine = this.addPromoDiscAmt(impactedLine, this.commonService.roundToPrecision(promoDisc, roundingPrecision), event, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision, pwp)
                              }
                            }

                          }
                        }
                      }
                      //#endregion "Third Loop - Affected SalesBillLine - Set Row Impact"
                    }
                    //Only execute Buy X Impact Y once
                    if (eventExecuted) {
                      //Assign promotion id to condition item
                      let conditionRemainingQty: number = totalTriggerQty;
                      let conditionCumulatedQty: number = 0;
                      //Assign conditionRemainingQty as duplicateSortedAffectedSalesBillLine total qtyRequest, to cater buy all item, specific item get discount
                      if (eventItemType == "A") {
                        duplicateSortedAffectedSalesBillLine.forEach(line => {
                          let originalLine: TransactionDetail = salesBillLine.find(x => x.uuid == line.uuid);
                          line = this.assignPromoIdToSalesBillLine(line, event);
                          originalLine = this.assignPromoIdToSalesBillLine(originalLine, event);
                        })
                      } else {
                        duplicateSortedAffectedSalesBillLine.forEach(line => {
                          let originalLine: TransactionDetail = salesBillLine.find(x => x.uuid == line.uuid);
                          if (conditionCumulatedQty != totalTriggerQty && totalTriggerQty != 0 && line.promoEventId == null) {
                            if (line.qtyRequest <= conditionRemainingQty) {
                              if (debugFlag) {
                                console.log("[qtyRequest < EntitlementQty] Condition remaining qty: " + conditionRemainingQty)
                              }
                              conditionCumulatedQty += line.qtyRequest;
                              conditionRemainingQty = conditionRemainingQty - line.qtyRequest;
                              line = this.assignPromoIdToSalesBillLine(line, event);
                              originalLine = this.assignPromoIdToSalesBillLine(originalLine, event);
                            } else if (line.qtyRequest > conditionRemainingQty) {
                              if (debugFlag) {
                                console.log("[qtyRequest > EntitlementQty] Condition remaining qty: " + conditionRemainingQty)
                              }
                              conditionCumulatedQty += conditionRemainingQty;
                              conditionRemainingQty = 0;
                              line = this.assignPromoIdToSalesBillLine(line, event);
                              originalLine = this.assignPromoIdToSalesBillLine(originalLine, event);
                            }
                          }
                        });
                      }
                      //break;
                    }
                  }
                  break;
              }
              break;
          }
        } else {
          //Stop the loop due to no eventLine available
          break;
        }
      }
    }
    //#endregion "First Loop - Promotion Event"
  }

  computeDiscAmtFromDiscArray(line: TransactionDetail, discountArray: number[], discountArrayOperation: string, discountArrayType: string, loopCount: number, isItemPriceTaxInclusive: boolean) {
    let unitPrice = isItemPriceTaxInclusive ? line.unitPrice : line.unitPriceExTax;
    let promoDisc: number = 0;
    for (let i = 0; i < loopCount; i++) {
      if (discountArray.length > 0) {
        let discountValue = discountArray.shift();
        if (discountArrayType == "A") {
          if (discountArrayOperation == "R") {
            if (discountValue != -1) {
              promoDisc += discountValue;
            } else {
              if (loopCount == 1) {
                promoDisc = 0;
              } else {
                promoDisc += unitPrice - line.discountedUnitPrice;
              }
            }
          } else if (discountArrayOperation == "A") {
            if (discountValue != -1) {
              promoDisc += discountValue;
            } else {
              promoDisc += 0;
            }
          }
        } else if (discountArrayType == "P") {
          if (discountArrayOperation == "R") {
            //-1 represent getting of original discount
            if (discountValue != -1) {
              promoDisc += unitPrice * discountValue / 100;
            } else {
              if (loopCount == 1) {
                promoDisc = 0;
              } else {
                promoDisc += unitPrice - line.discountedUnitPrice;
              }
            }
          } else if (discountArrayOperation == "A") {
            //-1 represent getting of original discount
            if (discountValue != -1) {
              promoDisc += line.discountedUnitPrice * discountValue / 100;
            } else {
              promoDisc += 0;
            }
          }
        }
      }
    }
    return promoDisc;
  }

  assignPromoIdToSalesBillLine(salesBillLine: TransactionDetail, promoObject: PromotionMaster) {
    salesBillLine.promoEventId = promoObject.promoEventId;
    //salesBillLine.promoDesc = promoObject.description;
    return salesBillLine;
  }

  //20221110 To double check on this
  addPromoDiscAmt(salesBillLine: TransactionDetail, newDiscExpr: number, promoObject: PromotionMaster, useTax: boolean, isItemPriceTaxInclusive: boolean, isDisplayTaxInclusive: boolean, roundingPrecision: number, pwp: MasterListDetails) {
    if (salesBillLine.discountGroupCode == pwp.code) {
      let split = salesBillLine.discountExpression.split("/")
      let currentDisc: number = parseFloat(split[1]);
      currentDisc = this.commonService.roundToPrecision((currentDisc + newDiscExpr), roundingPrecision);
      if (salesBillLine.discountExpression) {
        salesBillLine.discountExpression = salesBillLine.discountExpression + '/' + currentDisc.toString();
      } else {
        salesBillLine.discountExpression = currentDisc.toString();
      }

    } else {
      if (salesBillLine.discountExpression) {
        salesBillLine.discountExpression = salesBillLine.discountExpression + '/' + newDiscExpr.toString();
      } else {
        salesBillLine.discountExpression = newDiscExpr.toString();
      }
    }
    salesBillLine.discountGroupCode = pwp.code;
    salesBillLine.promoEventId = promoObject.promoEventId;
    //salesBillLine.promoDesc = promoObject.description;
    salesBillLine.isPromoImpactApplied = true;
    salesBillLine = this.commonService.computeDiscTaxAmount(salesBillLine, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision)
    return salesBillLine;
  }

  replacePromoDiscAmt(salesBillLine: TransactionDetail, newDiscExpr: number, promoObject: PromotionMaster, useTax: boolean, isItemPriceTaxInclusive: boolean, isDisplayTaxInclusive: boolean, roundingPrecision: number, pwp: MasterListDetails) {
    if (salesBillLine.discountGroupCode == pwp.code) {
      let currentDisc: number = parseFloat(salesBillLine.discountExpression);
      currentDisc = this.commonService.roundToPrecision((currentDisc + newDiscExpr), roundingPrecision);
      salesBillLine.discountExpression = currentDisc.toString();
    } else {
      salesBillLine.discountExpression = newDiscExpr.toString();
    }
    salesBillLine.discountGroupCode = pwp.code;

    salesBillLine.promoEventId = promoObject.promoEventId;
    //salesBillLine.promoDesc = promoObject.description;
    salesBillLine.isPromoImpactApplied = true;
    salesBillLine = this.commonService.computeDiscTaxAmount(salesBillLine, useTax, isItemPriceTaxInclusive, isDisplayTaxInclusive, roundingPrecision)
    return salesBillLine;
  }

}
