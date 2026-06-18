import AuthenticationServices
import SwiftUI

struct ContentView: View {
  @StateObject private var connectivity =
    WatchConnectivityModel()

  @StateObject private var location =
    WatchLocationModel()

  @StateObject private var auth =
    WatchAuthModel()

  @StateObject private var rankings =
    WatchRankingModel()

  private var hasToken: Bool {
    connectivity.hasToken || auth.isSignedIn
  }

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 8) {
        HStack(alignment: .firstTextBaseline) {
          Text("Roamie")
            .font(.headline)
            .fontWeight(.bold)

          Spacer()

          Text(location.scoreText)
            .font(.title2)
            .fontWeight(.bold)
            .monospacedDigit()
        }

        Text(location.statusText)
          .font(.footnote)
          .foregroundStyle(.secondary)
          .fixedSize(horizontal: false, vertical: true)

        if let cooldownText = location.cooldownText {
          Text(cooldownText)
            .font(.caption2)
            .foregroundStyle(.orange)
            .fixedSize(horizontal: false, vertical: true)
        }

        ProgressView(value: location.scoreValue)
          .tint(.green)

        Button {
          if hasToken {
            location.checkSimilarity()
          } else {
            location.requireSignIn()
          }
        } label: {
          if location.isLoading {
            ProgressView()
              .frame(maxWidth: .infinity)
          } else {
            Label("Check", systemImage: "location.fill")
              .frame(maxWidth: .infinity)
          }
        }
        .buttonStyle(.borderedProminent)
        .controlSize(.large)
        .tint(.green)
        .disabled(!location.canCheck)

        if !hasToken, auth.canUseAppleSignIn {
          SignInWithAppleButton(
            .signIn,
            onRequest: { request in
              request.requestedScopes = []
            },
            onCompletion: { result in
              auth.handleSignInResult(result)
            }
          )
          .signInWithAppleButtonStyle(.white)
          .frame(height: 38)
          .disabled(auth.isLoading)
        } else if !hasToken {
          Text("Sign in on iPhone, then open Roamie on Apple Watch.")
            .font(.caption2)
            .foregroundStyle(.secondary)
            .fixedSize(horizontal: false, vertical: true)
        }

        Text(auth.statusText)
          .font(.caption2)
          .foregroundStyle(.secondary)
          .fixedSize(horizontal: false, vertical: true)

        Button {
          if hasToken {
            location.setCurrentLocationAsHome()
          } else {
            location.requireSignIn()
          }
        } label: {
          Label("Set Home", systemImage: "house.fill")
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.bordered)
        .tint(.green)
        .disabled(!location.canCheck)

        VStack(alignment: .leading, spacing: 3) {
          areaLine(
            title: "Home",
            value: location.homeAreaText
          )

          areaLine(
            title: "Here",
            value: location.currentAreaText
          )
        }

        Divider()
          .padding(.vertical, 4)

        rankingView
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(.horizontal, 12)
      .padding(.vertical, 10)
    }
    .task {
      auth.refresh()
      connectivity.refreshTokenState()

      if hasToken {
        rankings.loadRankings()
      }
    }
    .onChange(of: connectivity.hasToken) { _, hasToken in
      if hasToken {
        auth.refresh()
        rankings.loadRankings()
      }
    }
    .onChange(of: auth.isSignedIn) { _, isSignedIn in
      connectivity.refreshTokenState()

      if isSignedIn {
        rankings.loadRankings()
      }
    }
  }

  private func areaLine(
    title: String,
    value: String
  ) -> some View {
    HStack(alignment: .firstTextBaseline) {
      Text(title)
        .font(.caption2)
        .foregroundStyle(.secondary)
        .frame(width: 36, alignment: .leading)

      Text(value)
        .font(.caption2)
        .lineLimit(2)
    }
  }

  private var rankingView: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text("Best towns")
        .font(.headline)

      HStack(spacing: 4) {
        ForEach(SimilarityRankingPeriod.allCases) { period in
          Button {
            rankings.select(period)
          } label: {
            Text(period.title)
              .font(.caption2)
              .lineLimit(1)
              .minimumScaleFactor(0.7)
          }
          .buttonStyle(.bordered)
          .tint(
            rankings.period == period
              ? .green
              : .secondary
          )
        }
      }
      .disabled(!hasToken)

      Text(rankings.statusText)
        .font(.caption2)
        .foregroundStyle(.secondary)
        .fixedSize(horizontal: false, vertical: true)

      if rankings.isLoading {
        ProgressView()
      }

      ForEach(rankings.items.prefix(5)) { item in
        rankingRow(item)
      }

      Button {
        rankings.loadRankings()
      } label: {
        Label("Refresh", systemImage: "arrow.clockwise")
      }
      .disabled(rankings.isLoading || !hasToken)
    }
  }

  private func rankingRow(
    _ item: SimilarityRankingItem
  ) -> some View {
    HStack(alignment: .firstTextBaseline) {
      Text("#\(item.rank)")
        .font(.caption)
        .fontWeight(.bold)
        .foregroundStyle(.green)
        .frame(width: 28, alignment: .leading)

      VStack(alignment: .leading, spacing: 2) {
        Text(formatRankingPair(item))
          .font(.caption)
          .lineLimit(2)

        Text(rankingMeta(item))
          .font(.caption2)
          .foregroundStyle(.secondary)
          .lineLimit(2)
      }

      Spacer(minLength: 4)

      Text("\(rankingScore(item))%")
        .font(.caption)
        .fontWeight(.bold)
        .monospacedDigit()
    }
  }

  private func rankingScore(
    _ item: SimilarityRankingItem
  ) -> Int {
    max(
      0,
      min(
        100,
        Int((item.averageSimilarity * 100).rounded())
      )
    )
  }

  private func rankingMeta(
    _ item: SimilarityRankingItem
  ) -> String {
    var values = [
      "Current \(formatArea(item.currentRankingArea))",
      "\(item.checkCount) checks",
    ]

    if let bestSimilarity = item.bestSimilarity {
      let bestScore = max(
        0,
        min(
          100,
          Int((bestSimilarity * 100).rounded())
        )
      )

      values.append("best \(bestScore)%")
    }

    if let latest =
      formatLatestCheckedAt(
        item.latestCheckedAt
      )
    {
      values.append(latest)
    }

    return values.joined(separator: " · ")
  }

  private func formatLatestCheckedAt(
    _ value: String?
  ) -> String? {
    guard let value,
      !value.isEmpty
    else {
      return nil
    }

    return String(value.prefix(10))
  }

  private func formatRankingPair(
    _ item: SimilarityRankingItem
  ) -> String {
    let home =
      item.homeArea.map(formatArea) ?? "Unknown"

    let current =
      formatArea(item.currentRankingArea)

    if home == "Unknown" {
      return current
    }

    return "\(home) -> \(current)"
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
      ? "Unknown"
      : values.joined(separator: " ")
  }
}
