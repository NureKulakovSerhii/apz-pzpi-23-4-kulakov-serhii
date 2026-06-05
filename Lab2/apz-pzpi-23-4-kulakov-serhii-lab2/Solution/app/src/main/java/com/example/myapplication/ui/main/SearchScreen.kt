package com.example.myapplication.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.myapplication.ui.components.AdvertCard
import com.example.myapplication.ui.components.CityDropdown

@Composable
fun SearchScreen(
    viewModel: SearchViewModel,
    onCardClick: (String) -> Unit,
    onLikeClick: (String) -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        LazyColumn(modifier = Modifier.weight(1f)) {
            item {
                Text("Фільтри пошуку", style = MaterialTheme.typography.titleLarge)
                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = viewModel.minPrice.value,
                        onValueChange = { viewModel.minPrice.value = it },
                        label = { Text("Мін. ціна") },
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    OutlinedTextField(
                        value = viewModel.maxPrice.value,
                        onValueChange = { viewModel.maxPrice.value = it },
                        label = { Text("Макс. ціна") },
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
                    OutlinedTextField(
                        value = viewModel.minScale.value,
                        onValueChange = { viewModel.minScale.value = it },
                        label = { Text("Мін. площа") },
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    OutlinedTextField(
                        value = viewModel.maxScale.value,
                        onValueChange = { viewModel.maxScale.value = it },
                        label = { Text("Макс. площа") },
                        modifier = Modifier.weight(1f)
                    )
                }

                CityDropdown(viewModel = viewModel)
            }

            items(viewModel.searchResults) { advert ->
                AdvertCard(
                    advert = advert,
                    onCardClick = onCardClick,
                    onLikeClick = onLikeClick
                )
            }
        }

        Button(
            onClick = { viewModel.performSearch() },
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
        ) {
            Text("Знайти")
        }
    }
}