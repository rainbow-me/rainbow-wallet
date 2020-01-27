//
//  TransactionListViewManager.m
//  Rainbow
//
//  Created by Alexey Kureev on 28/12/2019.
//

#import "React/RCTViewManager.h"
#import "RCTConvert+TransactionList.h"

@interface RCT_EXTERN_MODULE(TransactionListViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(data, TransactionData)
RCT_EXPORT_VIEW_PROPERTY(accountAddress, NSString)
RCT_EXPORT_VIEW_PROPERTY(onRequestPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onTransactionPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onReceivePress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onCopyAddressPress, RCTBubblingEventBlock)

@end

@implementation TransactionListViewManager: RCTViewManager

- (UIView *)view {
  return [[TransactionListView alloc] init];
}

@end
