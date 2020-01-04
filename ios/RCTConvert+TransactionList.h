//
//  RCTConvert+TransactionList.h
//  Rainbow
//
//  Created by Alexey Kureev on 04/01/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

#ifndef RCTConvert_TransactionList_h
#define RCTConvert_TransactionList_h

#import <React/RCTConvert.h>
#import "Transaction.h"

@interface RCTConvert (TransactionList)

+ (NSArray<Transaction *> *)Transactions:(id)json;

@end

@implementation RCTConvert (TransactionList)

+ (NSArray<Transaction*> *)Transactions:(id)json
{
  json = [self NSArray:json];
  NSMutableArray *result = [[NSMutableArray alloc] init];
  
  for (id t in json) {
    NSDictionary *data = [self NSDictionary:t];
    Transaction *transaction = [[Transaction alloc] init];
    transaction.type = ([data[@"type"] isEqualToString:@"send"]) ? @"Sent" : @"Received";
    if (data[@"asset"][@"icon_url"] != [NSNull null]) {
      transaction.coinImage = data[@"asset"][@"icon_url"];
    }
    transaction.coinName = data[@"asset"][@"name"];
    transaction.nativeDisplay = data[@"native"][@"display"];
    transaction.balanceDisplay = data[@"balance"][@"display"];
    
    [result addObject:transaction];
  }
  
  return result;
}

@end

#endif /* RCTConvert_TransactionList_h */
