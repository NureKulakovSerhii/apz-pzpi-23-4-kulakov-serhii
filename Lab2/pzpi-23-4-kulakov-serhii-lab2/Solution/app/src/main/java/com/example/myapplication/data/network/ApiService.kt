package com.example.myapplication.data.network

import com.example.myapplication.data.model.AdvertDto
import com.example.myapplication.data.model.ProfileDto
import com.example.myapplication.data.model.UpdateProfileRequest
import com.example.myapplication.domain.enums.CreateAdvertResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @GET("api/Advert/all-adverts")
    suspend fun getAllAdverts(): Response<List<AdvertDto>>
    @GET("api/Advert/get-favorites")
    suspend fun getUserFavorites(
        @Header("Authorization") token: String
    ): Response<List<AdvertDto>>

    @POST("api/Advert/{advertId}/add-to-favorites")
    suspend fun addToFavorites(
        @Header("Authorization") token: String,
        @Path("advertId") advertId: String
    ): Response<ResponseBody>

    @DELETE("api/Advert/{advertId}/delete-from-favorites")
    suspend fun deleteFromFavorites(
        @Header("Authorization") token: String,
        @Path("advertId") advertId: String
    ): Response<ResponseBody>

    @GET("api/Profile/get-my-user-profile")
    suspend fun getUserProfile(
        @Header("Authorization") token: String
    ): Response<ProfileDto>

    @PATCH("api/Profile/update-profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: UpdateProfileRequest
    ): Response<okhttp3.ResponseBody>

    @GET("api/Advert/search")
    suspend fun searchAdverts(
        @Query("pricePerMonthMin") minPrice: Int? = null,
        @Query("pricePerMonthMax") maxPrice: Int? = null,
        @Query("minScale") minScale: Int? = null,
        @Query("maxScale") maxScale: Int? = null,
        @Query("minFloor") minFloor: Int? = null,
        @Query("maxFloor") maxFloor: Int? = null,
        @Query("BuildingType") buildingType: String? = null,
        @Query("City") city: String? = null,
        @Query("Communications") communications: List<String>? = null,
        @Query("HouseholdAppliances") appliances: List<String>? = null,
        @Query("Infrastructures") infrastructure: List<String>? = null
    ): Response<List<AdvertDto>>

    @GET("api/Advert/get-advert")
    suspend fun getAdvert(
        @Query("advertId") advertId: String
    ): AdvertDto

    @Multipart
    @POST("api/Advert/create-advert")
    suspend fun createAdvert(
        @Header("Authorization") token: String,
        @Part("Title") title: RequestBody,
        @Part("Description") description: RequestBody,
        @Part("WarehouseDto.Address") address: RequestBody,
        @Part("WarehouseDto.PricePerMonth") price: RequestBody,
        @Part("WarehouseDto.Scale") scale: RequestBody,
        @Part("WarehouseDto.Floor") floor: RequestBody,
        @Part("WarehouseDto.BuildingType") buildingType: RequestBody,
        @Part("WarehouseDto.City") city: RequestBody,
        @Part imageFile: MultipartBody.Part?,
        @Part communications: List<MultipartBody.Part>,
        @Part appliances: List<MultipartBody.Part>,
        @Part infrastructures: List<MultipartBody.Part>
    ): Response<CreateAdvertResponse>
}