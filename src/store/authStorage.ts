// src/store/authStorage.ts

import * as SecureStore from "expo-secure-store"

const TOKEN_KEY = "roamie_access_token"

// ==============================================
// save token
// ==============================================

export async function saveToken(
  token: string
) {
  await SecureStore.setItemAsync(
    TOKEN_KEY,
    token
  )
}

// ==============================================
// get token
// ==============================================

export async function getToken() {

  return await SecureStore.getItemAsync(
    TOKEN_KEY
  )
}

// ==============================================
// remove token
// ==============================================

export async function removeToken() {

  await SecureStore.deleteItemAsync(
    TOKEN_KEY
  )
}

// ==============================================
// login state
// ==============================================

export async function isLoggedIn() {

  const token = await getToken()

  return !!token
}