import Combine
import CoreLocation
import Foundation

enum RoamieAPIError: LocalizedError {
  case missingToken
  case invalidURL
  case homeLocationRequired
  case rateLimited(TimeInterval?)
  case serviceUnavailable
  case responseUnavailable
  case responseFormatChanged
  case badStatus(Int)

  var errorDescription: String? {
    switch self {
    case .missingToken:
      return "Sign in on Apple Watch or iPhone first."
    case .invalidURL:
      return "Roamie API URL is invalid."
    case .homeLocationRequired:
      return "Home location needs to be set."
    case .rateLimited(let retryAfter):
      if let retryAfter,
        retryAfter > 0
      {
        let minutes =
          max(
            1,
            Int(ceil(retryAfter / 60))
          )

        return "Too many checks. Try again in about \(minutes) min."
      }

      return "Too many checks. Try again in a moment."
    case .serviceUnavailable:
      return "Roamie is busy. Try again later."
    case .responseUnavailable:
      return "Roamie could not read the response."
    case .responseFormatChanged:
      return "Update Roamie on iPhone and Apple Watch."
    case .badStatus(let status):
      if status == 401 || status == 403 {
        return "Sign in again to refresh Roamie."
      }

      if status == 422 {
        return "Home location needs to be set."
      }

      if status == 429 {
        return "Too many checks. Try again in a moment."
      }

      if status == 503 {
        return "Roamie is busy. Try again later."
      }

      return "Could not check similarity. Try again."
    }
  }
}

struct AppleLoginRequest: Encodable {
  let identityToken: String
  let authorizationCode: String?

  enum CodingKeys: String, CodingKey {
    case identityToken = "identity_token"
    case authorizationCode = "authorization_code"
  }
}

struct AppleLoginResponse: Decodable {
  let accessToken: String
  let tokenType: String?
  let profileCompleted: Bool?

  enum CodingKeys: String, CodingKey {
    case accessToken = "access_token"
    case tokenType = "token_type"
    case profileCompleted = "profile_completed"
  }
}

struct ProfileResponse: Decodable {
  let ageGroup: String?
  let gender: String?
  let homeLat: Double?
  let homeLng: Double?
  let calm: Double
  let vivid: Double
  let roamer: Double
  let luxury: Double
  let nature: Double
  let nightlife: Double
  let local: Double
  let creative: Double

  enum CodingKeys: String, CodingKey {
    case ageGroup = "age_group"
    case gender
    case homeLat = "home_lat"
    case homeLng = "home_lng"
    case calm
    case vivid
    case roamer
    case luxury
    case nature
    case nightlife
    case local
    case creative
  }
}

struct UpdateHomeRequest: Encodable {
  let homeLat: Double
  let homeLng: Double

  enum CodingKeys: String, CodingKey {
    case homeLat = "home_lat"
    case homeLng = "home_lng"
  }
}

private struct ProfileEnvelopeResponse: Decodable {
  let profile: ProfileResponse
}

private struct ProfileUpdateResponse: Decodable {
  let profile: ProfileResponse

  init(from decoder: Decoder) throws {
    if let direct =
      try? ProfileResponse(from: decoder)
    {
      profile = direct
      return
    }

    let envelope =
      try ProfileEnvelopeResponse(from: decoder)
    profile = envelope.profile
  }
}

struct AreaResponse: Decodable {
  let prefecture: String?
  let city: String?
  let district: String?
}

struct SimilarityResponse: Decodable {
  let similarity: Double
  let homeArea: AreaResponse
  let currentArea: AreaResponse

  enum CodingKeys: String, CodingKey {
    case similarity
    case homeArea = "home_area"
    case currentArea = "current_area"
  }
}

struct SimilarityRequest: Encodable {
  let homeLat: Double
  let homeLng: Double
  let currentLat: Double
  let currentLng: Double
  let source: String?

  enum CodingKeys: String, CodingKey {
    case homeLat = "home_lat"
    case homeLng = "home_lng"
    case currentLat = "current_lat"
    case currentLng = "current_lng"
    case source
  }
}

enum SimilarityRankingPeriod: String, CaseIterable, Codable, Identifiable {
  case week
  case month
  case year

  var id: String {
    rawValue
  }

  var title: String {
    switch self {
    case .week:
      return "Week"
    case .month:
      return "Month"
    case .year:
      return "Year"
    }
  }
}

struct SimilarityRankingItem: Decodable, Identifiable {
  let rank: Int
  let area: AreaResponse
  let homeArea: AreaResponse?
  let currentArea: AreaResponse?
  let lat: Double?
  let lng: Double?
  let averageSimilarity: Double
  let bestSimilarity: Double?
  let checkCount: Int
  let latestCheckedAt: String?

  var id: String {
    "\(rank)-\(formatIDArea(homeArea))-\(formatIDArea(currentRankingArea))"
  }

  var currentRankingArea: AreaResponse {
    currentArea ?? area
  }

  private func formatIDArea(
    _ area: AreaResponse?
  ) -> String {
    guard let area else {
      return ""
    }

    return "\(area.prefecture ?? "")-\(area.city ?? "")-\(area.district ?? "")"
  }

  enum CodingKeys: String, CodingKey {
    case rank
    case area
    case homeArea = "home_area"
    case currentArea = "current_area"
    case lat
    case lng
    case averageSimilarity = "average_similarity"
    case bestSimilarity = "best_similarity"
    case checkCount = "check_count"
    case latestCheckedAt = "latest_checked_at"
  }
}

struct SimilarityRankingResponse: Decodable {
  let period: SimilarityRankingPeriod
  let items: [SimilarityRankingItem]
}

final class RoamieAPI {
  private let baseURL =
    URL(string: "https://location-platform.onrender.com")!

  private let decoder = JSONDecoder()

  func loginWithApple(
    identityToken: String,
    authorizationCode: String?
  ) async throws -> AppleLoginResponse {
    let payload = AppleLoginRequest(
      identityToken: identityToken,
      authorizationCode: authorizationCode
    )

    let body = try JSONEncoder().encode(payload)

    return try await request(
      path: "/auth/apple",
      method: "POST",
      body: body,
      requiresToken: false
    )
  }

  func getProfile() async throws -> ProfileResponse {
    do {
      return try await request(
        path: "/profiles/me",
        method: "GET",
        body: Optional<Data>.none
      )
    } catch let error as RoamieAPIError {
      if case .badStatus(let status) = error,
        (400..<500).contains(status),
        status != 401,
        status != 403
      {
        throw RoamieAPIError.homeLocationRequired
      }

      throw error
    }
  }

  func updateHomeLocation(
    home: CLLocationCoordinate2D
  ) async throws -> ProfileResponse {
    let payload = UpdateHomeRequest(
      homeLat: home.latitude,
      homeLng: home.longitude
    )

    let body = try JSONEncoder().encode(payload)

    let response: ProfileUpdateResponse =
      try await request(
        path: "/profiles/me",
        method: "PATCH",
        body: body
      )

    return response.profile
  }

  func getSimilarity(
    home: CLLocationCoordinate2D,
    current: CLLocationCoordinate2D
  ) async throws -> SimilarityResponse {
    let payload = SimilarityRequest(
      homeLat: home.latitude,
      homeLng: home.longitude,
      currentLat: current.latitude,
      currentLng: current.longitude,
      source: "device"
    )

    let body = try JSONEncoder().encode(payload)

    return try await request(
      path: "/similarity",
      method: "POST",
      body: body
    )
  }

  func getSimilarityRankings(
    period: SimilarityRankingPeriod
  ) async throws -> SimilarityRankingResponse {
    try await request(
      path: "/similarity/rankings?period=\(period.rawValue)",
      method: "GET",
      body: Optional<Data>.none
    )
  }

  private func request<T: Decodable>(
    path: String,
    method: String,
    body: Data?,
    requiresToken: Bool = true
  ) async throws -> T {
    let token = WatchAuthStore.getToken()

    if requiresToken, token == nil {
      throw RoamieAPIError.missingToken
    }

    guard let url = URL(string: path, relativeTo: baseURL) else {
      throw RoamieAPIError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = method
    if let token {
      request.setValue(
        "Bearer \(token)",
        forHTTPHeaderField: "Authorization"
      )
    }
    request.setValue(
      "application/json",
      forHTTPHeaderField: "Content-Type"
    )
    request.httpBody = body

    let data: Data
    let response: URLResponse

    do {
      (data, response) =
        try await URLSession.shared.data(for: request)
    } catch {
      throw RoamieAPIError.responseUnavailable
    }

    guard let httpResponse = response as? HTTPURLResponse else {
      throw RoamieAPIError.badStatus(-1)
    }

    guard (200..<300).contains(httpResponse.statusCode) else {
      if httpResponse.statusCode == 429 {
        throw RoamieAPIError.rateLimited(
          retryAfterSeconds(
            from: httpResponse,
            data: data
          )
        )
      }

      throw RoamieAPIError.badStatus(httpResponse.statusCode)
    }

    do {
      return try decoder.decode(T.self, from: data)
    } catch {
      throw RoamieAPIError.responseFormatChanged
    }
  }

  private func retryAfterSeconds(
    from response: HTTPURLResponse,
    data: Data
  ) -> TimeInterval? {
    if let value =
      parseRetryAfter(
        response.value(
          forHTTPHeaderField: "Retry-After"
        )
      )
    {
      return value
    }

    guard
      let object =
        try? JSONSerialization.jsonObject(
          with: data
        ) as? [String: Any]
    else {
      return nil
    }

    return parseRetryAfter(
      object["retry_after"] ??
      object["retry_after_seconds"]
    )
  }

  private func parseRetryAfter(
    _ value: Any?
  ) -> TimeInterval? {
    if let number = value as? NSNumber {
      return max(0, number.doubleValue)
    }

    guard let string = value as? String,
      !string.isEmpty
    else {
      return nil
    }

    if let seconds = TimeInterval(string) {
      return max(0, seconds)
    }

    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "EEE',' dd MMM yyyy HH':'mm':'ss z"

    guard let date = formatter.date(from: string) else {
      return nil
    }

    return max(0, date.timeIntervalSinceNow)
  }
}

@MainActor
final class WatchRankingModel: ObservableObject {
  @Published var period: SimilarityRankingPeriod = .week
  @Published var items: [SimilarityRankingItem] = []
  @Published var statusText = "Loading rankings..."
  @Published var isLoading = false

  private let api = RoamieAPI()

  func select(
    _ nextPeriod: SimilarityRankingPeriod
  ) {
    guard nextPeriod != period else {
      return
    }

    period = nextPeriod
    loadRankings()
  }

  func loadRankings() {
    guard !isLoading else {
      return
    }

    isLoading = true
    statusText = "Loading rankings..."

    Task {
      do {
        let response =
          try await api.getSimilarityRankings(
            period: period
          )

        items = response.items

        statusText = response.items.isEmpty
          ? "Check similarity in a few places first."
          : "Best towns for \(period.title.lowercased())."

      } catch {
        items = []
        statusText = rankingMessage(
          for: error
        )
      }

      isLoading = false
    }
  }

  private func rankingMessage(
    for error: Error
  ) -> String {
    guard let apiError = error as? RoamieAPIError else {
      return "Could not load rankings. Try again."
    }

    switch apiError {
    case .missingToken:
      return "Open Roamie on iPhone and sign in first."
    case .rateLimited(_):
      return apiError.localizedDescription
    case .badStatus(let status):
      if status == 401 || status == 403 {
        return "Sign in again on iPhone."
      }

      if status == 404 {
        return "Ranking history is not ready yet."
      }

      if status == 422 {
        return "Choose a valid period."
      }

      if status == 429 {
        return "Too many refreshes. Try again soon."
      }

      if status == 503 {
        return "Roamie is busy. Try again later."
      }

      return "Could not load rankings. Try again."
    case .responseUnavailable:
      return "Check your connection and try again."
    default:
      return apiError.localizedDescription
    }
  }
}
