import Foundation
import Security

enum WatchAuthStore {
  private static let service =
    "com.taikiyanada.roamie.watch"

  private static let account =
    "access_token"

  static func saveToken(_ token: String) {
    if token.isEmpty {
      clearToken()
      return
    }

    guard let data = token.data(using: .utf8) else {
      return
    }

    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
    ]

    let attributes: [String: Any] = [
      kSecValueData as String: data,
    ]

    let status = SecItemUpdate(
      query as CFDictionary,
      attributes as CFDictionary
    )

    if status == errSecItemNotFound {
      var addQuery = query
      addQuery[kSecValueData as String] = data
      SecItemAdd(addQuery as CFDictionary, nil)
    }
  }

  static func getToken() -> String? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]

    var item: CFTypeRef?
    let status = SecItemCopyMatching(
      query as CFDictionary,
      &item
    )

    guard
      status == errSecSuccess,
      let data = item as? Data
    else {
      return nil
    }

    return String(data: data, encoding: .utf8)
  }

  static func clearToken() {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
    ]

    SecItemDelete(query as CFDictionary)
  }
}
