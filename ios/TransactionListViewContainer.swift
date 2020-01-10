//
//  TransactionListViewController.swift
//  Rainbow
//
//  Created by Alexey Kureev on 28/12/2019.
//

import Foundation

fileprivate struct TransactionSection {
  var header: Date
  var transactions: [Transaction]
}

class TransactionListViewContainer: UIView {
  @objc var accountAddress: String? = nil {
    didSet {
      header.accountAddress.text = accountAddress
    }
  }
  @objc var transactions: [Transaction] = [] {
    /// Every time we receive a new set of transactions, regroup by mind_at in the format "MMMM yyyy"
    /// Then, re-render tableView with the new data
    didSet {
      var groups: [Date: [Transaction]] = [:]
      let calendar = Calendar.current
      
      for transaction in transactions {
        var date = groupByDate(transaction.minedAt)
        
        if calendar.isDateInToday(date) || calendar.isDateInYesterday(date) {
          if groups[date] == nil {
            groups[date] = []
          }
          groups[date]!.append(transaction)
        } else {
          let dateComponents = calendar.dateComponents([.year, .month], from: date)
          date = calendar.date(from: dateComponents)!
          
          if groups[date] == nil {
            groups[date] = []
          }
          
          groups[date]!.append(transaction)
        }
      }
      
      sections = groups.map(TransactionSection.init(header:transactions:))
      sections.sort { (lhs, rhs) in lhs.header > rhs.header }
      tableView.reloadData()
    }
  }
  @objc lazy var onItemPress: RCTBubblingEventBlock = { _ in }
  
  fileprivate var sections = [TransactionSection]()
  
  let tableView = UITableView()
  let header: TransactionListViewHeader = TransactionListViewHeader.fromNib()
  let headerSeparator = UIView()
  
  override init(frame: CGRect) {
    super.init(frame: CGRect.zero)
    
    tableView.dataSource = self
    tableView.delegate = self
    tableView.rowHeight = 60
    tableView.separatorStyle = UITableViewCell.SeparatorStyle.none
    tableView.register(UINib(nibName: "TransactionListViewCell", bundle: nil), forCellReuseIdentifier: "TransactionListViewCell")
    
    header.backgroundColor = .white
    header.addSubview(headerSeparator)
    
    headerSeparator.backgroundColor = UIColor(red:0.8, green:0.8, blue:0.8, alpha:1.0)
    tableView.tableHeaderView = header
    
    addSubview(tableView)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  /// React Native is known to re-render only first-level subviews. Since our tableView is a custom view that we add as a second-level subview, we need to relayout it manually
  override func layoutSubviews() {
    tableView.frame = self.bounds
    header.frame = CGRect(x: 0, y: 0, width: tableView.bounds.width, height: 200)
    headerSeparator.frame = CGRect(x: 20, y: header.frame.size.height - 1, width: tableView.bounds.width - 20, height: 1)
  }
  
  private func groupByDate(_ date: Date) -> Date {
    let calendar = Calendar.current
    let components = calendar.dateComponents([.year, .month, .day], from: date)
    return calendar.date(from: components)!
  }
}

extension TransactionListViewContainer: UITableViewDataSource, UITableViewDelegate {
  func numberOfSections(in tableView: UITableView) -> Int {
    return sections.count
  }
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    let section = self.sections[section]
    return section.transactions.count
  }
  
  func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
    return 40
  }
  
  func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
    let view = UIView(frame: CGRect(x: 0, y: 0, width: frame.width, height: 40))
    let label = UILabel(frame: CGRect(x: 20, y: 0, width: view.frame.width, height: view.frame.height))
    let calendar = Calendar.current
    
    if calendar.isDateInToday(sections[section].header) {
      label.text = "Today"
    } else if calendar.isDateInYesterday(sections[section].header) {
      label.text = "Yesterday"
    } else {
      let dateFormatter = DateFormatter()
      dateFormatter.dateFormat = "MMMM yyyy"
      label.text = dateFormatter.string(from: sections[section].header)
    }
    
    label.font = .boldSystemFont(ofSize: 18)
    view.backgroundColor = .white
    view.addSubview(label)
    
    return view
  }
  
  /// Sets a cell for a row at indexPath based on the active section
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let identifier = "TransactionListViewCell"
    let cell = tableView.dequeueReusableCell(withIdentifier: identifier, for: indexPath) as! TransactionListViewCell
    
    let section = sections[indexPath.section]
    let transaction = section.transactions[indexPath.row]
    
    cell.set(transaction: transaction)
    cell.selectionStyle = .none
    
    return cell;
  }
  
  /// Show incoming transactions green and outgoing transactions gray with minus sign in front of it
  func tableView(_ tableView: UITableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
    let transaction = transactions[indexPath.row];
    let listViewCell = cell as! TransactionListViewCell
    
    switch transaction.status {
    case "Sent":
      listViewCell.nativeDisplay.textColor = UIColor(red:0.15, green:0.16, blue:0.18, alpha:1.0)
      listViewCell.nativeDisplay.text = "- " + transaction.nativeDisplay
      break
    case "Self":
      listViewCell.nativeDisplay.textColor = UIColor(red:0.63, green:0.65, blue:0.67, alpha:1.0)
      break
    default:
      listViewCell.nativeDisplay.textColor = UIColor(red:0.25, green:0.80, blue:0.09, alpha:1.0)
      break
    }
    
  }
  
  /// Play the select animation and propogate the event to JS runtime (so onItemPress property can receive a nativeEvent with rowIndex in it)
  func tableView(_ tableView: UITableView, willSelectRowAt indexPath: IndexPath) -> IndexPath? {
    let cell = tableView.cellForRow(at: indexPath)
    UIView.animate(withDuration: 0.15, animations: {
      cell?.transform = CGAffineTransform(scaleX: 0.95, y: 0.95)
    }, completion: { _ in
      UIView.animate(withDuration: 0.15, animations: {
        cell?.transform = CGAffineTransform(scaleX: 1.0, y: 1.0)
      })
    })
    let transaction = transactions[indexPath.row]
    self.onItemPress(["rowIndex": indexPath.row, "hash": transaction.tHash as String])
    return indexPath
  }
  
  func tableView(_ tableView: UITableView, didHighlightRowAt indexPath: IndexPath) {
    let cell = tableView.cellForRow(at: indexPath)
    UIView.animate(withDuration: 0.15, animations: {
      cell?.transform = CGAffineTransform(scaleX: 0.95, y: 0.95)
    })
  }
  
  func tableView(_ tableView: UITableView, didUnhighlightRowAt indexPath: IndexPath) {
    let cell = tableView.cellForRow(at: indexPath)
    UIView.animate(withDuration: 0.15, animations: {
      cell?.transform = CGAffineTransform(scaleX: 1.0, y: 1.0)
    })
  }
}
