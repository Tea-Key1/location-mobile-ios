import CoreLocation
import Foundation

@MainActor
final class WatchLocationModel: NSObject, ObservableObject, CLLocationManagerDelegate {
  private enum LocationAction {
    case checkSimilarity
    case setHome
  }

  @Published var statusText = "Ready to compare nearby feeling."
  @Published var currentAreaText = "--"
  @Published var homeAreaText = "--"
  @Published var scoreText = "--"
  @Published var scoreValue: Double = 0
  @Published var isLoading = false
  @Published var cooldownText: String?

  private let manager = CLLocationManager()
  private let api = RoamieAPI()
  private var retryAfter: Date?
  private var pendingAction: LocationAction = .checkSimilarity

  var canCheck: Bool {
    !isLoading
  }

  override init() {
    super.init()
    manager.delegate = self
    manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
  }

  func checkSimilarity() {
    if let retryAfter,
      retryAfter > Date()
    {
      cooldownText = cooldownMessage(
        retryAfter: retryAfter
      )
      statusText = "Roamie is rate limited."
      return
    }

    isLoading = true
    pendingAction = .checkSimilarity
    statusText = "Checking location..."
    cooldownText = nil

    switch manager.authorizationStatus {
    case .notDetermined:
      manager.requestWhenInUseAuthorization()
    case .authorizedAlways, .authorizedWhenInUse:
      manager.requestLocation()
    case .denied, .restricted:
      isLoading = false
      statusText = "Location access is disabled. Enable it in Settings."
    @unknown default:
      isLoading = false
      statusText = "Location is unavailable."
    }
  }

  func setCurrentLocationAsHome() {
    isLoading = true
    pendingAction = .setHome
    statusText = "Finding current location..."
    cooldownText = nil

    switch manager.authorizationStatus {
    case .notDetermined:
      manager.requestWhenInUseAuthorization()
    case .authorizedAlways, .authorizedWhenInUse:
      manager.requestLocation()
    case .denied, .restricted:
      isLoading = false
      statusText = "Location access is disabled. Enable it in Settings."
    @unknown default:
      isLoading = false
      statusText = "Location is unavailable."
    }
  }

  func requireSignIn() {
    statusText = "Sign in on Apple Watch or iPhone first."
  }

  nonisolated func locationManagerDidChangeAuthorization(
    _ manager: CLLocationManager
  ) {
    Task { @MainActor in
      switch manager.authorizationStatus {
      case .authorizedAlways, .authorizedWhenInUse:
        manager.requestLocation()
      case .denied, .restricted:
        isLoading = false
        statusText = "Location access is disabled. Enable it in Settings."
      case .notDetermined:
        break
      @unknown default:
        isLoading = false
        statusText = "Location is unavailable."
      }
    }
  }

  nonisolated func locationManager(
    _ manager: CLLocationManager,
    didUpdateLocations locations: [CLLocation]
  ) {
    guard let location = locations.last else {
      Task { @MainActor in
        isLoading = false
        statusText = "Location is unavailable."
      }
      return
    }

    Task { @MainActor in
      switch pendingAction {
      case .checkSimilarity:
        await loadSimilarity(
          current: location.coordinate
        )
      case .setHome:
        await saveHome(
          current: location.coordinate
        )
      }
    }
  }

  nonisolated func locationManager(
    _ manager: CLLocationManager,
    didFailWithError error: Error
  ) {
    Task { @MainActor in
      isLoading = false
      statusText = locationMessage(
        for: error
      )
    }
  }

  private func loadSimilarity(
    current: CLLocationCoordinate2D
  ) async {
    var homeForFallback: CLLocationCoordinate2D?

    do {
      statusText = "Comparing with home..."

      let profile =
        try await api.getProfile()

      guard let homeLat = profile.homeLat,
        let homeLng = profile.homeLng,
        homeLat.isFinite,
        homeLng.isFinite
      else {
        throw RoamieAPIError.homeLocationRequired
      }

      let home = CLLocationCoordinate2D(
        latitude: homeLat,
        longitude: homeLng
      )
      homeForFallback = home

      let similarity =
        try await api.getSimilarity(
          home: home,
          current: current
        )

      let score =
        max(
          0,
          min(100, Int((similarity.similarity * 100).rounded()))
        )

      scoreText = "\(score)%"
      scoreValue = Double(score) / 100
      homeAreaText = formatArea(similarity.homeArea)
      currentAreaText = formatArea(similarity.currentArea)
      statusText = label(for: similarity.similarity)
      retryAfter = nil
      cooldownText = nil

    } catch {
      if isRateLimit(error) {
        let retryAfter =
          Date().addingTimeInterval(
            retryAfterSeconds(for: error)
          )

        self.retryAfter = retryAfter
        cooldownText = cooldownMessage(
          retryAfter: retryAfter
        )
        if let home = homeForFallback {
          showFallbackSimilarity(
            home: home,
            current: current
          )
          statusText = "Area lookup is busy. Showing an estimate."
        } else {
          statusText = error.localizedDescription
        }
      } else {
        statusText = error.localizedDescription
      }
    }

    isLoading = false
  }

  private func saveHome(
    current: CLLocationCoordinate2D
  ) async {
    do {
      statusText = "Saving home location..."

      let profile =
        try await api.updateHomeLocation(
          home: current
        )

      homeAreaText =
        validCoordinateText(
          latitude: profile.homeLat,
          longitude: profile.homeLng
        ) ?? "Home saved"

      scoreText = "--"
      scoreValue = 0
      currentAreaText = "Here"
      retryAfter = nil
      cooldownText = nil
      statusText = "Home location saved."
    } catch {
      statusText = homeMessage(for: error)
    }

    isLoading = false
  }

  private func validCoordinateText(
    latitude: Double?,
    longitude: Double?
  ) -> String? {
    guard
      let latitude,
      let longitude,
      latitude.isFinite,
      longitude.isFinite
    else {
      return nil
    }

    return String(
      format: "%.4f, %.4f",
      latitude,
      longitude
    )
  }

  private func formatArea(
    _ area: AreaResponse
  ) -> String {
    let rawValues: [String?] = [
      area.prefecture,
      area.city,
      area.district,
    ]

    let values = rawValues.compactMap { value -> String? in
      guard let value, !value.isEmpty else {
        return nil
      }

      return value
    }

    return values.isEmpty
      ? "--"
      : values.joined(separator: " ")
  }

  private func label(
    for similarity: Double
  ) -> String {
    switch similarity {
    case 0.82...:
      return "Very close to home."
    case 0.62...:
      return "A familiar nearby feeling."
    case 0.42...:
      return "Some echoes of home."
    default:
      return "A different kind of place."
    }
  }

  private func locationMessage(
    for error: Error
  ) -> String {
    guard let locationError = error as? CLError else {
      return "Could not get your location. Try again."
    }

    switch locationError.code {
    case .denied:
      return "Location access is disabled. Enable it in Settings."
    case .locationUnknown:
      return "Could not get your location. Try again."
    case .network:
      return "Check your connection and try again."
    default:
      return "Location is unavailable."
    }
  }

  private func homeMessage(
    for error: Error
  ) -> String {
    guard let apiError = error as? RoamieAPIError else {
      return "Could not save home. Try again."
    }

    switch apiError {
    case .missingToken:
      return "Sign in on Apple Watch or iPhone first."
    case .badStatus(let status):
      if status == 401 || status == 403 {
        return "Sign in again to save home."
      }

      if status == 422 {
        return "This location cannot be saved."
      }

      if status == 429 {
        return "Too many updates. Try again soon."
      }

      if status == 503 {
        return "Roamie is busy. Try again later."
      }

      return "Could not save home. Try again."
    case .responseUnavailable:
      return "Check your connection and try again."
    default:
      return apiError.localizedDescription
    }
  }

  private func isRateLimit(
    _ error: Error
  ) -> Bool {
    guard let apiError = error as? RoamieAPIError else {
      return false
    }

    switch apiError {
    case .rateLimited(_):
      return true
    case .badStatus(let status):
      return status == 429
    default:
      return false
    }
  }

  private func retryAfterSeconds(
    for error: Error
  ) -> TimeInterval {
    guard let apiError = error as? RoamieAPIError else {
      return 3 * 60
    }

    switch apiError {
    case .rateLimited(let seconds):
      if let seconds,
        seconds > 0
      {
        return seconds
      }

      return 3 * 60
    default:
      return 3 * 60
    }
  }

  private func cooldownMessage(
    retryAfter: Date
  ) -> String {
    let seconds =
      max(
        1,
        retryAfter.timeIntervalSince(Date())
      )

    let minutes =
      max(
        1,
        Int(ceil(seconds / 60))
      )

    return "Try again in about \(minutes) min."
  }

  private func showFallbackSimilarity(
    home: CLLocationCoordinate2D,
    current: CLLocationCoordinate2D
  ) {
    let distanceKm =
      haversineKm(
        first: home,
        second: current
      )

    let similarity =
      max(
        0,
        min(
          1,
          exp(-distanceKm / 18)
        )
      )

    let score =
      max(
        0,
        min(
          100,
          Int((similarity * 100).rounded())
        )
      )

    scoreText = "\(score)%"
    scoreValue = Double(score) / 100
    homeAreaText = "Home"
    currentAreaText = "Here"
  }

  private func haversineKm(
    first: CLLocationCoordinate2D,
    second: CLLocationCoordinate2D
  ) -> Double {
    let earthRadiusKm =
      6371.0

    let dLat =
      degreesToRadians(
        second.latitude - first.latitude
      )

    let dLng =
      degreesToRadians(
        second.longitude - first.longitude
      )

    let firstLat =
      degreesToRadians(first.latitude)

    let secondLat =
      degreesToRadians(second.latitude)

    let value =
      pow(sin(dLat / 2), 2) +
      cos(firstLat) *
        cos(secondLat) *
        pow(sin(dLng / 2), 2)

    return earthRadiusKm *
      2 *
      atan2(
        sqrt(value),
        sqrt(1 - value)
      )
  }

  private func degreesToRadians(
    _ value: Double
  ) -> Double {
    value * .pi / 180
  }
}
