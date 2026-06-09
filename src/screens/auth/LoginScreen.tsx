// src/screens/auth/LoginScreen.tsx

import {
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native"

import * as AppleAuthentication
from "expo-apple-authentication"

import {
  ApiError,
} from "../../api/client"

import AmbientMap
from "../../components/common/AmbientMap"

import {
  design,
} from "../../styles/design"

type Props = {
  loginWithApple: (
    identityToken: string
  ) => Promise<void>
}

const APPLE_CLIENT_ID =
  "com.taikiyanada.roamie"

export default function LoginScreen({
  loginWithApple,
}: Props) {

  // =====================================
  // Apple Sign In
  // =====================================

  const handleAppleLogin =
    async () => {

      let tokenPayload:
        Record<string, unknown> | null =
          null

      try {

        // ================================
        // Apple popup
        // ================================

        const credential =
          await AppleAuthentication
            .signInAsync({

              requestedScopes: [

                AppleAuthentication
                  .AppleAuthenticationScope
                  .FULL_NAME,

                AppleAuthentication
                  .AppleAuthenticationScope
                  .EMAIL,
              ],
            })

        // ================================
        // token check
        // ================================

        if (
          !credential.identityToken
        ) {

          throw new Error(
            "No identity token"
          )
        }

        tokenPayload =
          logAppleTokenMetadata(
            credential.identityToken
          )

        // ================================
        // FastAPI login
        // ================================

        await loginWithApple(
          credential.identityToken
        )

      } catch (error: any) {

        // ================================
        // user canceled
        // ================================

        if (
          error.code ===
          "ERR_REQUEST_CANCELED"
        ) {
          return
        }

        console.log(
          "Apple login error",
          error
        )

        Alert.alert(
          "Login Error",
          getAppleLoginErrorMessage(
            error,
            tokenPayload
          )
        )
      }
    }

  return (

    <View style={styles.container}>

      <AmbientMap />

      <View style={styles.kicker}>
        <View style={styles.kickerDot} />
        <Text style={styles.kickerText}>
          Location personality
        </Text>
      </View>

      <Text style={styles.title}>
        Roamie
      </Text>

      <Text style={styles.subtitle}>
        A softer way to compare where you are with the places that already feel like you.
      </Text>

      <AppleAuthentication.AppleAuthenticationButton

        buttonType={
          AppleAuthentication
            .AppleAuthenticationButtonType
            .SIGN_IN
        }

        buttonStyle={
          AppleAuthentication
            .AppleAuthenticationButtonStyle
            .BLACK
        }

        cornerRadius={14}

        style={styles.appleButton}

        onPress={handleAppleLogin}
      />

    </View>
  )
}

function logAppleTokenMetadata(
  identityToken: string
): Record<string, unknown> | null {

  if (!__DEV__) {
    return null
  }

  const payload =
    decodeJwtPayload(identityToken)

  if (!payload) {
    console.log(
      "Apple identity token payload could not be decoded"
    )

    return null
  }

    console.log(
    "Apple identity token metadata",
    {
      iss: payload.iss,
      aud: payload.aud,
      exp: payload.exp,
      subPresent:
        typeof payload.sub === "string",
      emailPresent:
        typeof payload.email === "string",
      emailVerified:
        payload.email_verified,
      isPrivateEmail:
        payload.is_private_email,
      expectedAud:
        APPLE_CLIENT_ID,
    }
  )

  return payload
}

function getAppleLoginErrorMessage(
  error: unknown,
  tokenPayload: Record<string, unknown> | null
): string {

  if (
    error instanceof Error &&
    (
      error.message.includes("unknown reason") ||
      error.message.includes("authorization attempt failed") ||
      error.message.includes("authorization request") ||
      error.message.includes("AuthorizationError")
    )
  ) {
    return [
      "Appleの認可画面を完了できませんでした。",
      "Simulatorの場合は、設定アプリでApple Accountにサインインしているか確認してください。",
      "それでも失敗する場合は、実機でSign in with Apple capability付きのプロビジョニングで確認してください。",
    ].join("\n")
  }

  if (
    error instanceof ApiError &&
    error.status >= 500
  ) {

    const aud =
      typeof tokenPayload?.aud === "string"
        ? tokenPayload.aud
        : "unknown"

    return [
      "サーバー側でAppleログイン処理が失敗しています。",
      `アプリのApple token audは ${aud} です。`,
      `API側のApple Client ID / Bundle ID設定が ${APPLE_CLIENT_ID} を許可しているか確認してください。`,
    ].join("\n")
  }

  if (error instanceof ApiError) {
    return error.message
  }

  return "Appleログインに失敗しました"
}

function decodeJwtPayload(
  token: string
): Record<string, unknown> | null {

  const payload =
    token.split(".")[1]

  if (!payload) {
    return null
  }

  try {

    const normalized =
      payload
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(
          Math.ceil(payload.length / 4) * 4,
          "="
        )

    const decoded =
      globalThis.atob(normalized)

    return JSON.parse(decoded)

  } catch {

    return null
  }
}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    justifyContent: "center",

    paddingHorizontal: 24,

    backgroundColor: design.colors.paper,
  },

  kicker: {

    flexDirection: "row",

    alignItems: "center",

    alignSelf: "flex-start",

    marginTop: 34,

    paddingHorizontal: 12,

    paddingVertical: 8,

    borderRadius: design.radius.pill,

    backgroundColor: design.colors.surface,

    borderWidth: 1,

    borderColor: design.colors.softLine,
  },

  kickerDot: {

    width: 8,

    height: 8,

    borderRadius: 4,

    backgroundColor: design.colors.pink,

    marginRight: 8,
  },

  kickerText: {

    color: design.colors.greenDark,

    fontSize: 12,

    fontWeight: "800",

    textTransform: "uppercase",

    letterSpacing: 0.7,
  },

  title: {

    marginTop: 18,

    fontSize: 42,

    lineHeight: 48,

    fontWeight: "800",

    color: design.colors.ink,

    letterSpacing: 0,
  },

  subtitle: {

    marginTop: 12,

    fontSize: 16,

    lineHeight: 24,

    color: design.colors.muted,

    letterSpacing: 0,
  },

  appleButton: {

    width: "100%",

    height: 54,

    marginTop: 34,
  },
})
