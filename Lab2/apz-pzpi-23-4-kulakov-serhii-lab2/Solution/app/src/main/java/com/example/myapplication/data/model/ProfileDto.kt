package com.example.myapplication.data.model

import com.google.gson.annotations.SerializedName

data class ProfileDto(
    val id: String,
    val name: String,
    val surname: String,
    val email: String,
    val phoneNumber: String,
    @SerializedName("secondPhoneNumber") val secondPhoneNumber: String? = null,
    val userAdverts: List<Any> = emptyList()
)

data class UpdateProfileRequest(
    val name: String,
    val surname: String,
    val phoneNumber: String,
    @SerializedName("secondNumber") val secondNumber: String
)