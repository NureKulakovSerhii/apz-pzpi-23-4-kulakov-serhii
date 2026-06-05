package com.example.myapplication.data.network

import com.example.myapplication.data.model.auth.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface AuthApiService {

    @POST("api/Auth/login-user")
    suspend fun loginUser(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @POST("api/Auth/register-user")
    suspend fun registerUser(
        @Body request: RegisterRequest
    ): Response<RegisterResponse>

    @POST("api/Auth/logout")
    suspend fun logoutUser(
        @Header("Authorization") token: String
    ): Response<okhttp3.ResponseBody>
}