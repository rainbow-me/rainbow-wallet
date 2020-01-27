//
//  TransactionViewModelTransactionRequestItem.swift
//  Rainbow
//
//  Created by Alexey Kureev on 24/01/2020.
//

import Foundation

class TransactionViewModelTransactionRequestItem : TransactionViewModelProtocol {
  var sections: [TransactionSectionProtocol]
  var onItemPress: (Dictionary<AnyHashable, Any>) -> Void = { _ in }
  var type: TransactionSectionTypes = .requests
  
  init(requests: [TransactionRequest]) {
    self.sections = [TransactionRequestSection(data: requests)]
  }
}
