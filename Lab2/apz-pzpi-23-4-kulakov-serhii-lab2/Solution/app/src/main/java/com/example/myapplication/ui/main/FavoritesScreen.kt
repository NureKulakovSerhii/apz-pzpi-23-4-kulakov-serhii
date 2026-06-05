package com.example.myapplication.ui.main

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.myapplication.ui.components.AdvertCard

@Composable
fun FavoritesScreen(
    mainViewModel: MainViewModel,
    token: String?,
    onCardClick: (String) -> Unit
) {
    val favorites by mainViewModel.favorites.collectAsState()
    val isFavoritesLoading by mainViewModel.isFavoritesLoading.collectAsState()
    LaunchedEffect(Unit) {
        mainViewModel.loadFavorites(token)
    }

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        if (isFavoritesLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        } else if (favorites.isEmpty()) {
            Text(
                text = "У вас немає обраних оголошень",
                modifier = Modifier.align(Alignment.Center)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 8.dp)
            ) {
                items(favorites) { advert ->
                    AdvertCard(
                        advert = advert,
                        onCardClick = { onCardClick(advert.id) },
                        isFavoriteScreen = true,
                        onLikeClick = { id ->
                            mainViewModel.removeFromFavorites(id, token)
                        }
                    )
                }
            }
        }
    }
}