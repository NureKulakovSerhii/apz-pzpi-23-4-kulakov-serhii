package com.example.myapplication.ui.auth

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.model.auth.LoginRequest
import com.example.myapplication.data.model.auth.RegisterRequest
import com.example.myapplication.data.repository.AuthRepository
import kotlinx.coroutines.launch



class AuthViewModel(private val repository: AuthRepository) : ViewModel() {

    var authState by mutableStateOf<AuthState>(AuthState.Idle)
        private set
    var token by mutableStateOf<String?>(repository.getToken())

    fun onLoginSuccess(newToken: String) {
        token = newToken
    }
    var loginEmail by mutableStateOf("")
    var loginPassword by mutableStateOf("")
    var regFirstName by mutableStateOf("")
    var regLastName by mutableStateOf("")
    var regEmail by mutableStateOf("")
    var regPassword by mutableStateOf("")
    var selectedAdvertId by mutableStateOf<String?>(null)
    fun login(onSuccess: () -> Unit) {
        if (loginEmail.isBlank() || loginPassword.isBlank()) {
            authState = AuthState.Error("Заповніть усі поля")
            return
        }

        viewModelScope.launch {
            authState = AuthState.Loading
            try {
                val response = repository.login(LoginRequest(loginEmail.trim(), loginPassword))
                if (response.isSuccessful) {
                    authState = AuthState.Success
                    token = repository.getToken()
                    onSuccess()
                } else {
                    authState = AuthState.Error("Невірний email або пароль")
                }
            } catch (e: Exception) {
                authState = AuthState.Error("Помилка з'єднання")
            }
        }
    }

    fun register(onSuccess: () -> Unit) {
        if (regFirstName.isBlank() || regLastName.isBlank() || regEmail.isBlank() || regPassword.isBlank()) {
            authState = AuthState.Error("Заповніть усі поля")
            return
        }
        if (regPassword.length < 6) {
            authState = AuthState.Error("Пароль має бути мінімум 6 символів")
            return
        }
        viewModelScope.launch {
            authState = AuthState.Loading
            try {
                val response = repository.register(
                    RegisterRequest(
                        firstName = regFirstName.trim(),
                        lastName = regLastName.trim(),
                        email = regEmail.trim(),
                        password = regPassword
                    )
                )
                if (response.isSuccessful) {
                    authState = AuthState.Success
                    onSuccess()
                } else {
                    authState = AuthState.Error("Помилка реєстрації. Можливо, такий email вже існує.")
                }
            } catch (e: Exception) {
                authState = AuthState.Error("Помилка з'єднання: ${e.localizedMessage}")
            }
        }
    }

    fun logout() {
        val currentToken = token
        if (currentToken != null) {
            viewModelScope.launch {
                repository.logoutUserOnServer(currentToken)
                repository.logout()
                token = null
                authState = AuthState.Idle
            }
        } else {
            repository.logout()
            token = null
            authState = AuthState.Idle
        }
    }

    fun clearError() {
        authState = AuthState.Idle
    }

    enum class CurrentScreen {
        HOME, SEARCH, FAVORITES, PROFILE, LOGIN, REGISTER,
        ADVERT_DETAIL, CREATE_ADVERT
    }

    var currentScreen by mutableStateOf(CurrentScreen.HOME)
        internal set

    fun navigateTo(screen: CurrentScreen) {
        currentScreen = screen
    }
    fun handleUnauthorized() {
        repository.logout()
        token = null
        navigateTo(CurrentScreen.LOGIN)
    }
}