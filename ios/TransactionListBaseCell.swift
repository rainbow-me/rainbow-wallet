//
//  TransactionListBaseCell.swift
//  Rainbow
//
//  Created by Alexey Kureev on 27/01/2020.
//

import Foundation

class TransactionListBaseCell : UITableViewCell {
  internal let duration = 0.1
  internal let hapticType = "select"
  
  var onItemPress: (Dictionary<AnyHashable, Any>) -> Void = { _ in }
  var row: Int? = nil
  var scaleTo: CGFloat = 0.97
  
  func addShadowLayer(_ view: UIView) {
    let shadowLayer = CAShapeLayer()
    let secondShadowLayer = CAShapeLayer()
    let radius = view.frame.width / 2.0
    let circle = UIBezierPath(arcCenter: view.center, radius: radius, startAngle: 0, endAngle: 2 * CGFloat.pi, clockwise: true)
    
    shadowLayer.fillColor = UIColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0).cgColor
    shadowLayer.opacity = 0.04
    shadowLayer.path = circle.cgPath
    shadowLayer.shadowColor = UIColor(red: 0.15, green: 0.16, blue: 0.18, alpha: 1.0).cgColor
    shadowLayer.shadowOffset = CGSize(width: 0, height: 3)
    shadowLayer.shadowOpacity = 1.0
    shadowLayer.shadowRadius = 3
    shadowLayer.zPosition = -1
    
    secondShadowLayer.fillColor = UIColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0).cgColor
    secondShadowLayer.opacity = 0.08
    secondShadowLayer.path = circle.cgPath
    secondShadowLayer.shadowColor = UIColor(red: 0.15, green: 0.16, blue: 0.18, alpha: 1.0).cgColor
    secondShadowLayer.shadowOffset = CGSize(width: 0, height: 1)
    secondShadowLayer.shadowOpacity = 1.0
    secondShadowLayer.shadowRadius = 1.5
    secondShadowLayer.zPosition = -2
    
    layer.addSublayer(shadowLayer)
    layer.addSublayer(secondShadowLayer)
  }

  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    animateTapStart(
      duration: duration,
      scale: scaleTo
    )
  }
  
  override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
    animateTapEnd(duration: duration, useHaptic: "selection")
    if row != nil {
      onItemPress(["index":row!])
    }
  }
  
  override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
    animateTapEnd(duration: duration)
  }
  
  func generateTextImage(_ text: String) -> UIImage? {
    let frame = CGRect(x: 0, y: 0, width: 120, height: 120)
    
    let nameLabel = MyBoundedLabel(frame: frame)
    nameLabel.textAlignment = .center
    nameLabel.backgroundColor = UIColor(red: 0.23, green: 0.24, blue: 0.32, alpha: 1.0)
    nameLabel.textColor = .white
    nameLabel.font = .systemFont(ofSize: 42, weight: .regular)
    nameLabel.text = text
    nameLabel.adjustsFontSizeToFitWidth = true
    
    UIGraphicsBeginImageContext(frame.size)
    if let currentContext = UIGraphicsGetCurrentContext() {
      nameLabel.layer.render(in: currentContext)
      return UIGraphicsGetImageFromCurrentImageContext()
    }
    return nil
  }
}
