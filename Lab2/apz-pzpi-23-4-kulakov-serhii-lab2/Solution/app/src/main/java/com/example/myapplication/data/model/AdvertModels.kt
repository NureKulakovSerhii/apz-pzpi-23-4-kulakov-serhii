package com.example.myapplication.data.model

import com.google.gson.annotations.SerializedName

data class AuthorDto(
    val id: String,
    val email: String,
    val phone: String,
    val createdAt: String
)

data class WarehouseDto(
    val address: String,
    val pricePerMonth: Int,
    val scale: Int,
    val floor: Int,
    val buildingType: String,
    val city: Int,
    val imageUrl: String?,
    val communications: List<Int>,
    val householdAppliances: List<Int>,
    val infrastructures: List<Int>
)

data class AdvertDto(
    val id: String,
    val title: String,
    val description: String,
    val createdAt: String,
    val isActive: Boolean,
    val author: AuthorDto,
    val warehouse: WarehouseDto,
    val isFavorite: Boolean = false
)