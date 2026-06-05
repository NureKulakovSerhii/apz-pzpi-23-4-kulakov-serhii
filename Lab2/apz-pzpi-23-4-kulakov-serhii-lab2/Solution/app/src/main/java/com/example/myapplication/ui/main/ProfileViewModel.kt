package com.example.myapplication.ui.main

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.model.ProfileDto
import com.example.myapplication.data.model.UpdateProfileRequest
import com.example.myapplication.data.network.RetrofitClient
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {

    var profileData by mutableStateOf<ProfileDto?>(null)
        private set
    val cityOptions = listOf("Київ", "Одеса", "Львів", "Харків", "Дніпро", "Запоріжжя", "Вінниця", "Житомир", "Чернігів")
    var expanded by mutableStateOf(false)
    var isLoading by mutableStateOf(false)
        private set
    var isEditing by mutableStateOf(false)

    var editName by mutableStateOf("")
    var editSurname by mutableStateOf("")
    var editPhone by mutableStateOf("")
    var editSecondPhone by mutableStateOf("")

    fun loadProfile(token: String?, onUnauthorized: () -> Unit = {}) {
        if (token == null) return
        viewModelScope.launch {
            isLoading = true
            try {
                val response = RetrofitClient.apiService.getUserProfile("Bearer $token")
                if (response.isSuccessful && response.body() != null) {
                    val data = response.body()!!
                    profileData = data
                    editName = data.name
                    editSurname = data.surname
                    editPhone = data.phoneNumber
                    editSecondPhone = data.secondPhoneNumber ?: ""
                } else if (response.code() == 401) {
                    Log.e("ProfileViewModel", "Сесія застаріла (401)")
                    profileData = null
                    onUnauthorized()
                } else {
                    Log.e("ProfileViewModel", "Помилка завантаження профілю: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("ProfileViewModel", "Помилка мережі профілю", e)
            } finally {
                isLoading = false
            }
        }
    }

    fun saveProfile(token: String?) {
        if (token == null) return
        viewModelScope.launch {
            isLoading = true
            try {
                val request = UpdateProfileRequest(
                    name = editName.trim(),
                    surname = editSurname.trim(),
                    phoneNumber = editPhone.trim(),
                    secondNumber = editSecondPhone.trim()
                )
                val response = RetrofitClient.apiService.updateProfile("Bearer $token", request)
                if (response.isSuccessful) {
                    isEditing = false
                    loadProfile(token)
                } else {
                    Log.e("ProfileViewModel", "Помилка оновлення профілю: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("ProfileViewModel", "Помилка мережі при оновленні", e)
            } finally {
                isLoading = false
            }
        }
    }
}