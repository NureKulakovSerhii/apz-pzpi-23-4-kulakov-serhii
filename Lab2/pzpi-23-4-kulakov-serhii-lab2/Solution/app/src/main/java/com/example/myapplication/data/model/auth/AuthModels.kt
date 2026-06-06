package com.example.myapplication.data.model.auth

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("userEmail") val email: String,
    @SerializedName("userPassword") val password: String
)

data class LoginResponse(
    @SerializedName("jwtToken") val jwtToken: String,
    @SerializedName("refreshToken") val refreshToken: String
)

data class RegisterRequest(
    @SerializedName("userName") val firstName: String,
    @SerializedName("userLastName") val lastName: String,
    @SerializedName("userEmail") val email: String,
    @SerializedName("userPassword") val password: String
)

data class RegisterResponse(
    @SerializedName("userName") val firstName: String,
    @SerializedName("userLastName") val lastName: String,
    @SerializedName("userEmail") val email: String
)