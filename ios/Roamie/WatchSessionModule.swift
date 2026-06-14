import Foundation
import React
import WatchConnectivity

@objc(WatchSessionModule)
final class WatchSessionModule: NSObject, WCSessionDelegate {
  private var session: WCSession?

  override init() {
    super.init()
    activateSession()
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc
  func sendAccessToken(
    _ token: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    guard let session = activeSession() else {
      reject("watch_unavailable", "WatchConnectivity is not available.", nil)
      return
    }

    do {
      try session.updateApplicationContext([
        "access_token": token,
      ])

      resolve(true)
    } catch {
      reject("watch_sync_failed", error.localizedDescription, error)
    }
  }

  @objc
  func clearAccessToken(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    guard let session = activeSession() else {
      resolve(false)
      return
    }

    do {
      try session.updateApplicationContext([
        "access_token": "",
      ])

      resolve(true)
    } catch {
      reject("watch_clear_failed", error.localizedDescription, error)
    }
  }

  private func activeSession() -> WCSession? {
    activateSession()
    return session
  }

  private func activateSession() {
    guard WCSession.isSupported() else {
      return
    }

    if session == nil {
      session = WCSession.default
      session?.delegate = self
      session?.activate()
    }
  }

  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {}

  func sessionDidBecomeInactive(_ session: WCSession) {}

  func sessionDidDeactivate(_ session: WCSession) {
    session.activate()
  }
}
