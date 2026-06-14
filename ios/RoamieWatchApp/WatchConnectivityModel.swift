import Foundation
import WatchConnectivity

final class WatchConnectivityModel: NSObject, ObservableObject, WCSessionDelegate {
  @Published var hasToken = WatchAuthStore.getToken() != nil

  override init() {
    super.init()
    activate()
  }

  func activate() {
    guard WCSession.isSupported() else {
      return
    }

    let session = WCSession.default
    session.delegate = self
    session.activate()

    applyContext(session.applicationContext)
  }

  func refreshTokenState() {
    hasToken = WatchAuthStore.getToken() != nil
  }

  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    DispatchQueue.main.async {
      self.applyContext(session.applicationContext)
    }
  }

  func session(
    _ session: WCSession,
    didReceiveApplicationContext applicationContext: [String: Any]
  ) {
    DispatchQueue.main.async {
      self.applyContext(applicationContext)
    }
  }

  private func applyContext(
    _ applicationContext: [String: Any]
  ) {
    guard let token = applicationContext["access_token"] as? String else {
      hasToken = WatchAuthStore.getToken() != nil
      return
    }

    WatchAuthStore.saveToken(token)
    hasToken = !token.isEmpty
  }
}
