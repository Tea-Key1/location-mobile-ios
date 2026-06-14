import AuthenticationServices
import Foundation
import LocalAuthentication

@MainActor
final class WatchAuthModel: ObservableObject {
  @Published var isLoading = false
  @Published var statusText = "Sign in on Apple Watch or iPhone."
  @Published var isSignedIn = WatchAuthStore.getToken() != nil
  @Published var canUseAppleSignIn = false

  private let api = RoamieAPI()

  func refresh() {
    isSignedIn = WatchAuthStore.getToken() != nil
    refreshAppleSignInAvailability()
  }

  func refreshAppleSignInAvailability() {
    let context = LAContext()
    var error: NSError?

    canUseAppleSignIn =
      context.canEvaluatePolicy(
        .deviceOwnerAuthentication,
        error: &error
      )

    if !isSignedIn, !canUseAppleSignIn {
      statusText =
        "Apple Watch passcode is required for Apple sign-in. Sign in on iPhone to sync, or set a passcode on a real Watch."
    }
  }

  func handleSignInResult(
    _ result: Result<ASAuthorization, Error>
  ) {
    switch result {
    case .success(let authorization):
      guard
        let credential =
          authorization.credential as? ASAuthorizationAppleIDCredential,
        let identityTokenData = credential.identityToken,
        let identityToken =
          String(data: identityTokenData, encoding: .utf8)
      else {
        statusText = "Could not read Apple sign-in."
        return
      }

      let authorizationCode =
        credential.authorizationCode.flatMap {
          String(data: $0, encoding: .utf8)
        }

      signIn(
        identityToken: identityToken,
        authorizationCode: authorizationCode
      )

    case .failure(let error):
      let nsError = error as NSError

      if nsError.domain == ASAuthorizationError.errorDomain,
        nsError.code == ASAuthorizationError.canceled.rawValue
      {
        statusText = "Sign in was canceled."
      } else {
        statusText = "Could not sign in. Try again."
      }
    }
  }

  func signOut() {
    WatchAuthStore.clearToken()
    isSignedIn = false
    statusText = "Signed out."
  }

  private func signIn(
    identityToken: String,
    authorizationCode: String?
  ) {
    guard !isLoading else {
      return
    }

    isLoading = true
    statusText = "Signing in..."

    Task {
      do {
        let response =
          try await api.loginWithApple(
            identityToken: identityToken,
            authorizationCode: authorizationCode
          )

        WatchAuthStore.saveToken(
          response.accessToken
        )
        isSignedIn = true
        statusText = "Signed in."
      } catch {
        statusText = authMessage(for: error)
      }

      isLoading = false
    }
  }

  private func authMessage(
    for error: Error
  ) -> String {
    guard let apiError = error as? RoamieAPIError else {
      return "Could not sign in. Try again."
    }

    switch apiError {
    case .responseUnavailable:
      return "Check your connection and try again."
    case .badStatus(let status):
      if status == 401 || status == 403 {
        return "Apple sign-in was not accepted."
      }

      if status == 429 {
        return "Too many sign-in attempts. Try again soon."
      }

      if status == 503 {
        return "Roamie is busy. Try again later."
      }

      return "Could not sign in. Try again."
    default:
      return apiError.localizedDescription
    }
  }
}
