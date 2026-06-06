package com.example.myapplication.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.model.AdvertDto
import com.example.myapplication.data.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AdvertDetailViewModel : ViewModel() {

    private val _advert = MutableStateFlow<AdvertDto?>(null)
    val advert: StateFlow<AdvertDto?> = _advert
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage
    fun loadAdvert(advertId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                val response = RetrofitClient.apiService.getAdvert(advertId)
                _advert.value = response
            } catch (e: Exception) {
                _errorMessage.value = "Помилка завантаження оголошення: ${e.localizedMessage}"
                _advert.value = null
            } finally {
                _isLoading.value = false
            }
        }
    }
}