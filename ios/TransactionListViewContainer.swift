//
//  TransactionListViewController.swift
//  Rainbow
//
//  Created by Alexey Kureev on 28/12/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation

class TransactionListViewContainer: UIView {
  @objc var transactions: [Transaction] = [] {
    didSet {
      tableView.reloadData()
    }
  }
  @objc lazy var onItemPress: RCTBubblingEventBlock = {_ in}
  
  var bridge: RCTBridge
  var tableView: UITableView
  
  init(bridge: RCTBridge) {
    self.bridge = bridge
    self.tableView = UITableView()
    
    super.init(frame: CGRect.zero)
    
    tableView.dataSource = self
    tableView.delegate = self
    tableView.rowHeight = 60
    tableView.separatorStyle = UITableViewCell.SeparatorStyle.none
    tableView.register(UINib(nibName: "TransactionListViewCell", bundle: nil), forCellReuseIdentifier: "TransactionListViewCell")
    
    addSubview(tableView)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func layoutSubviews() {
    tableView.frame = self.bounds
  }
}

extension TransactionListViewContainer: UITableViewDataSource, UITableViewDelegate {
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return transactions.count
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let identifier = "TransactionListViewCell"
    let cell = tableView.dequeueReusableCell(withIdentifier: identifier, for: indexPath) as! TransactionListViewCell
    let transaction = transactions[indexPath.row];
    
    cell.set(transaction: transaction)
    cell.selectionStyle = .none
    
    return cell;
  }
 
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    let cell = tableView.cellForRow(at: indexPath)
    UIView.animate(withDuration: 0.1, animations: {
      cell?.transform = CGAffineTransform(scaleX: 0.95, y: 0.95)
    }, completion: { _ in
      UIView.animate(withDuration: 0.1, animations: {
        cell?.transform = CGAffineTransform(scaleX: 1.0, y: 1.0)
      })
    })
    self.onItemPress(["rowIndex": indexPath.row])
  }
  
  func tableView(_ tableView: UITableView, didHighlightRowAt indexPath: IndexPath) {
    let cell = tableView.cellForRow(at: indexPath)
    UIView.animate(withDuration: 0.1, animations: {
      cell?.transform = CGAffineTransform(scaleX: 0.95, y: 0.95)
    })
  }
  
  func tableView(_ tableView: UITableView, didUnhighlightRowAt indexPath: IndexPath) {
    let cell = tableView.cellForRow(at: indexPath)
    UIView.animate(withDuration: 0.1, animations: {
      cell?.transform = CGAffineTransform(scaleX: 1.0, y: 1.0)
    })
  }
}
