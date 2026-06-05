package com.example.myapplication.ui.main

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.model.AdvertDto
import com.example.myapplication.data.network.RetrofitClient
import kotlinx.coroutines.launch

class SearchViewModel : ViewModel() {
    var searchResults = mutableStateListOf<AdvertDto>()
    var isLoading = mutableStateOf(false)
    var expanded by mutableStateOf(false)
    val cityOptions = listOf("Київ", "Одеса", "Львів", "Харків", "Дніпро", "Запоріжжя", "Вінниця", "Житомир", "Чернігів")
    // Поля фільтрів
    var minPrice = mutableStateOf("")
    var maxPrice = mutableStateOf("")
    var minScale = mutableStateOf("")
    var maxScale = mutableStateOf("")
    var minFloor = mutableStateOf("")
    var maxFloor = mutableStateOf("")
    var selectedCity = mutableStateOf<String?>(null)
    var selectedBuildingType = mutableStateOf<String?>(null)
    val selectedCommunications = mutableStateListOf<String>()

    fun performSearch() {
        viewModelScope.launch {
            isLoading.value = true
            try {
                val response = RetrofitClient.apiService.searchAdverts(
                    minPrice = minPrice.value.toIntOrNull(),
                    maxPrice = maxPrice.value.toIntOrNull(),
                    minScale = minScale.value.toIntOrNull(),
                    maxScale = maxScale.value.toIntOrNull(),
                    minFloor = minFloor.value.toIntOrNull(),
                    maxFloor = maxFloor.value.toIntOrNull(),
                    buildingType = selectedBuildingType.value,
                    city = selectedCity.value,
                    communications = selectedCommunications.toList()
                )
                if (response.isSuccessful) {
                    searchResults.clear()
                    searchResults.addAll(response.body() ?: emptyList())
                }
            } catch (e: Exception) {
                Log.e("SearchViewModel", "Помилка пошуку", e)
            } finally {
                isLoading.value = false
            }
        }
    }
}