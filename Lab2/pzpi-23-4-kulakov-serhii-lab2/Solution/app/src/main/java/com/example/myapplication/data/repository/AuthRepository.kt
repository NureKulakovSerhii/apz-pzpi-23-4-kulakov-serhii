package com.example.myapplication.data.repository

import android.content.Context
import com.example.myapplication.data.model.auth.*
import com.example.myapplication.data.network.ApiService
import com.example.myapplication.data.network.AuthApiService
import retrofit2.Response

class AuthRepository(
    private val apiService: AuthApiService,
    context: Context
) {
    private val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)

    suspend fun login(request: LoginRequest): Response<LoginResponse> {
        val response = apiService.loginUser(request)
        if (response.isSuccessful) {
            response.body()?.let { saveTokens(it.jwtToken, it.refreshToken) }
        }
        return response
    }

    suspend fun register(request: RegisterRequest): Response<RegisterResponse> {
        return apiService.registerUser(request)
    }

    suspend fun logoutUserOnServer(token: String): Boolean {
        return try {
            val response = apiService.logoutUser("Bearer $token")
            response.isSuccessful
        } catch (e: Exception) {
            false
        }
    }

    fun saveTokens(accessToken: String, refreshToken: String) {
        prefs.edit().apply {
            putString("access_token", accessToken)
            putString("refresh_token", refreshToken)
            apply()
        }
    }

    fun getToken(): String? = prefs.getString("access_token", null)

    fun isAuthenticated(): Boolean = getToken() != null

    fun logout() {
        prefs.edit().clear().apply()
    }
}