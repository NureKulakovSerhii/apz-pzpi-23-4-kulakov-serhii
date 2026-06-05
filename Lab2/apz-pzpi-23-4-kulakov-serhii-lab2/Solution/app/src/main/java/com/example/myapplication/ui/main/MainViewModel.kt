package com.example.myapplication.ui.main

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.model.AdvertDto
import com.example.myapplication.data.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {
    private val _adverts = MutableStateFlow<List<AdvertDto>>(emptyList())
    val adverts: StateFlow<List<AdvertDto>> = _adverts
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading
    private val _favorites = MutableStateFlow<List<AdvertDto>>(emptyList())
    val favorites: StateFlow<List<AdvertDto>> = _favorites
    private val _isFavoritesLoading = MutableStateFlow(false)
    val isFavoritesLoading: StateFlow<Boolean> = _isFavoritesLoading

    fun loadFavorites(token: String?, onUnauthorized: () -> Unit = {}) {
        if (token == null) return
        viewModelScope.launch {
            _isFavoritesLoading.value = true
            try {
                val response = RetrofitClient.apiService.getUserFavorites("Bearer $token")
                if (response.isSuccessful) {
                    _favorites.value = response.body() ?: emptyList()
                } else if (response.code() == 401) {
                    Log.e("MainViewModel", "Сесія застаріла (401)")
                    _favorites.value = emptyList()
                    onUnauthorized()
                } else {
                    Log.e("MainViewModel", "Помилка завантаження обраного: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("MainViewModel", "Помилка мережі при завантаженні обраного", e)
            } finally {
                _isFavoritesLoading.value = false
            }
        }
    }

    fun loadAdverts() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = RetrofitClient.apiService.getAllAdverts()
                if (response.isSuccessful) {
                    _adverts.value = response.body() ?: emptyList()
                } else {
                    Log.e("MainViewModel", "Помилка завантаження оголошень: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("MainViewModel", "Помилка мережі при завантаженні оголошень", e)
            } finally {
                _isLoading.value = false
            }
        }
    }
    fun toggleFavorite(advertId: String, token: String?) {
        if (token == null) {
            Log.d("MainViewModel", "Користувач не авторизований!")
            return
        }
        viewModelScope.launch {
            val isFav = _favorites.value.any { it.id == advertId }

            if (isFav) {
                removeFromFavorites(advertId, token)
            } else {
                addToFavorites(advertId, token)
            }
        }
    }
    private suspend fun addToFavorites(advertId: String, token: String) {
        try {
            val response = RetrofitClient.apiService.addToFavorites("Bearer $token", advertId)
            if (response.isSuccessful) {
                Log.d("MainViewModel", "Успішно додано в обране")
                loadFavorites(token)
            }
        } catch (e: Exception) {
            Log.e("MainViewModel", "Помилка додавання в обране", e)
        }
    }
    fun removeFromFavorites(advertId: String, token: String?) {
        if (token == null) return
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.deleteFromFavorites("Bearer $token", advertId)
                if (response.isSuccessful) {
                    Log.d("MainViewModel", "Успішно видалено з обраного")
                    _favorites.value = _favorites.value.filter { it.id != advertId }
                }
            } catch (e: Exception) {
                Log.e("MainViewModel", "Помилка видалення з обраного", e)
            }
        }
    }
}