import CoreLocation
import SwiftUI

final class WatchLocationModel: NSObject, ObservableObject, CLLocationManagerDelegate {
  @Published var statusText = "Ready to find your nearby feeling."
  @Published var coordinateText = "--"
  @Published var isLoading = false

  private let manager = CLLocationManager()

  override init() {
    super.init()
    manager.delegate = self
    manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
  }

  func useCurrentLocation() {
    isLoading = true
    statusText = "Checking location..."

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

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
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

  func locationManager(
    _ manager: CLLocationManager,
    didUpdateLocations locations: [CLLocation]
  ) {
    guard let location = locations.last else {
      isLoading = false
      statusText = "Location is unavailable."
      return
    }

    isLoading = false
    statusText = "Current location is ready."
    coordinateText = String(
      format: "%.4f, %.4f",
      location.coordinate.latitude,
      location.coordinate.longitude
    )
  }

  func locationManager(
    _ manager: CLLocationManager,
    didFailWithError error: Error
  ) {
    isLoading = false
    statusText = error.localizedDescription
  }
}

struct ContentView: View {
  @StateObject private var location = WatchLocationModel()

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      Text("Roamie")
        .font(.title3)
        .fontWeight(.bold)

      Text(location.statusText)
        .font(.footnote)
        .foregroundStyle(.secondary)
        .fixedSize(horizontal: false, vertical: true)

      Text(location.coordinateText)
        .font(.caption2.monospacedDigit())
        .foregroundStyle(.green)

      Button {
        location.useCurrentLocation()
      } label: {
        if location.isLoading {
          ProgressView()
        } else {
          Label("Use location", systemImage: "location.fill")
        }
      }
      .disabled(location.isLoading)
    }
    .padding()
  }
}
