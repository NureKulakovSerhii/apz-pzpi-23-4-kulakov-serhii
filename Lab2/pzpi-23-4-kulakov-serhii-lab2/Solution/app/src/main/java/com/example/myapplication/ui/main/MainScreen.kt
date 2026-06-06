package com.example.myapplication.ui.main

import android.util.Log
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.myapplication.data.network.RetrofitClient
import com.example.myapplication.ui.auth.AuthViewModel
import com.example.myapplication.ui.auth.AuthViewModel.CurrentScreen
import com.example.myapplication.ui.auth.AuthState
import com.example.myapplication.ui.auth.LoginScreen
import com.example.myapplication.ui.auth.RegisterScreen
import com.example.myapplication.ui.components.AdvertCard
import com.example.myapplication.ui.components.MainHeader
import com.example.myapplication.ui.advert.CreateAdvertScreen
import com.example.myapplication.ui.advert.CreateAdvertViewModel

@Composable
fun MainScreen(
    modifier: Modifier = Modifier,
    mainViewModel: MainViewModel = viewModel(),
    profileViewModel: ProfileViewModel = viewModel()
) {
    val context = LocalContext.current
    val searchViewModel: SearchViewModel = viewModel()
    val detailViewModel: AdvertDetailViewModel = viewModel()
    val createAdvertViewModel: CreateAdvertViewModel = viewModel()
    val authViewModelFactory = remember(context) {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val repository = com.example.myapplication.data.repository.AuthRepository(
                    apiService = RetrofitClient.authApiService,
                    context = context
                )
                return AuthViewModel(repository) as T
            }
        }
    }

    val authViewModel: AuthViewModel = viewModel(factory = authViewModelFactory)

    val adverts by mainViewModel.adverts.collectAsState()
    val isLoading by mainViewModel.isLoading.collectAsState()
    val currentScreen = authViewModel.currentScreen
    val isAuthorized = authViewModel.token != null
    LaunchedEffect(authViewModel.token) {
        if (authViewModel.token != null) {
            mainViewModel.loadFavorites(authViewModel.token)
        }
    }

    Scaffold(
        topBar = {
            MainHeader(
                onMenuClick = { target ->
                    when (target) {
                        "home" -> authViewModel.navigateTo(CurrentScreen.HOME)
                        "search" -> authViewModel.navigateTo(CurrentScreen.SEARCH)
                        "favorites", "profile" -> {
                            if (authViewModel.token != null) {
                                val destination = if (target == "profile") CurrentScreen.PROFILE else CurrentScreen.FAVORITES

                                if (destination == CurrentScreen.FAVORITES) {
                                    mainViewModel.loadFavorites(authViewModel.token, onUnauthorized = { authViewModel.handleUnauthorized() })
                                }
                                if (destination == CurrentScreen.PROFILE) {
                                    profileViewModel.loadProfile(authViewModel.token, onUnauthorized = { authViewModel.handleUnauthorized() })
                                }

                                authViewModel.navigateTo(destination)
                            } else {
                                authViewModel.navigateTo(CurrentScreen.LOGIN)
                            }
                        }
                    }
                },
                onCreateAdvertClick = {
                    if (authViewModel.token != null) {
                        Log.d("MainScreen", "Відкриваємо створення оголошення")
                        authViewModel.navigateTo(CurrentScreen.CREATE_ADVERT)
                    } else {
                        authViewModel.navigateTo(CurrentScreen.LOGIN)
                    }
                }
            )
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->

        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentScreen) {
                CurrentScreen.HOME -> {
                    LaunchedEffect(Unit) {
                        mainViewModel.loadAdverts()
                    }

                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                    } else if (adverts.isEmpty()) {
                        Text(text = "Оголошень не знайдено", modifier = Modifier.align(Alignment.Center))
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize().padding(horizontal = 8.dp)
                        ) {
                            items(adverts) { advert ->
                                AdvertCard(
                                    advert = advert,
                                    onCardClick = { id ->
                                        authViewModel.selectedAdvertId = id
                                        authViewModel.navigateTo(CurrentScreen.ADVERT_DETAIL)
                                    },
                                    onLikeClick = { id ->
                                        mainViewModel.toggleFavorite(id, authViewModel.token)
                                    }
                                )
                            }
                        }
                    }
                }

                CurrentScreen.LOGIN -> LoginScreen(
                    viewModel = authViewModel,
                    onNavigateToRegister = { authViewModel.navigateTo(CurrentScreen.REGISTER) },
                    onLoginSuccess = {
                        profileViewModel.loadProfile(authViewModel.token)
                        mainViewModel.loadFavorites(authViewModel.token)
                        authViewModel.navigateTo(CurrentScreen.CREATE_ADVERT)
                    }
                )

                CurrentScreen.REGISTER -> RegisterScreen(
                    viewModel = authViewModel,
                    onNavigateToLogin = { authViewModel.navigateTo(CurrentScreen.LOGIN) },
                    onRegisterSuccess = { authViewModel.navigateTo(CurrentScreen.PROFILE) }
                )

                CurrentScreen.SEARCH -> {
                    SearchScreen(
                        viewModel = searchViewModel,
                        onCardClick = { id ->
                            authViewModel.selectedAdvertId = id
                            authViewModel.navigateTo(CurrentScreen.ADVERT_DETAIL)
                        },
                        onLikeClick = { id ->
                            mainViewModel.toggleFavorite(id, authViewModel.token)
                        }
                    )
                }

                CurrentScreen.FAVORITES -> {
                    if (authViewModel.token == null) {
                        LaunchedEffect(Unit) { authViewModel.navigateTo(CurrentScreen.LOGIN) }
                    } else {
                        LaunchedEffect(Unit) {
                            mainViewModel.loadFavorites(authViewModel.token)
                        }

                        val favoritesList by mainViewModel.favorites.collectAsState()

                        FavoritesScreen(
                            mainViewModel = mainViewModel,
                            token = authViewModel.token,
                            onCardClick = { id ->
                                authViewModel.selectedAdvertId = id
                                authViewModel.navigateTo(CurrentScreen.ADVERT_DETAIL)
                            }
                        )
                    }
                }

                CurrentScreen.PROFILE -> {
                    if (authViewModel.token == null) {
                        LaunchedEffect(Unit) { authViewModel.navigateTo(CurrentScreen.LOGIN) }
                    } else {
                        ProfileScreen(
                            profileViewModel = profileViewModel,
                            authViewModel = authViewModel
                        )
                    }
                }

                CurrentScreen.ADVERT_DETAIL -> {
                    val advertDetail by detailViewModel.advert.collectAsState()
                    val isDetailLoading by detailViewModel.isLoading.collectAsState()
                    val errorMsg by detailViewModel.errorMessage.collectAsState()

                    LaunchedEffect(authViewModel.selectedAdvertId) {
                        authViewModel.selectedAdvertId?.let { id ->
                            detailViewModel.loadAdvert(id)
                        }
                    }

                    if (isDetailLoading) {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                    } else if (errorMsg != null) {
                        Text(text = errorMsg ?: "Невідома помилка", modifier = Modifier.align(Alignment.Center))
                    } else {
                        advertDetail?.let { advert ->
                            AdvertDetailScreen(advert = advert)
                        } ?: Text(text = "Дані оголошення порожні", modifier = Modifier.align(Alignment.Center))
                    }
                }
                CurrentScreen.CREATE_ADVERT -> {
                    if (authViewModel.token == null) {
                        LaunchedEffect(Unit) { authViewModel.navigateTo(CurrentScreen.LOGIN) }
                    } else {
                        CreateAdvertScreen(
                            viewModel = createAdvertViewModel,
                            token = authViewModel.token,
                            onAdvertCreated = {
                                authViewModel.navigateTo(CurrentScreen.HOME)
                            }
                        )
                    }
                }
            }
        }
    }
}