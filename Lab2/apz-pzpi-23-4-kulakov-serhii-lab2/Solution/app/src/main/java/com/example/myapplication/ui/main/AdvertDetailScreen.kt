package com.example.myapplication.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.myapplication.data.model.AdvertDto
import com.example.myapplication.domain.enums.*

@Composable
fun AdvertDetailScreen(advert: AdvertDto) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(text = advert.title, style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(8.dp))

        Text(text = "Ціна: ${advert.warehouse.pricePerMonth} грн/міс", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
        Text(text = "Місто: ${City.fromInt(advert.warehouse.city).toString()}", style = MaterialTheme.typography.bodyLarge)
        Text(text = "Адреса: ${advert.warehouse.address}", style = MaterialTheme.typography.bodyLarge)

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Характеристики складу", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "Тип будівлі: ${advert.warehouse.buildingType}")
                Text(text = "Площа: ${advert.warehouse.scale} м²")
                Text(text = "Поверх: ${advert.warehouse.floor}")
            }
        }

        Text(text = "Опис", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = advert.description, style = MaterialTheme.typography.bodyMedium)

        Spacer(modifier = Modifier.height(16.dp))
        AdvertDetailSectionChipRow("Комунікації", advert.warehouse.communications.map { Communications.fromInt(it).toString() })
        AdvertDetailSectionChipRow("Інфраструктура", advert.warehouse.infrastructures.map { Infrastructure.fromInt(it).toString() })
        AdvertDetailSectionChipRow("Побутова техніка", advert.warehouse.householdAppliances.map { HouseholdAppliances.fromInt(it).toString() })

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Контакти автора", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "Email: ${advert.author.email}")
                Text(text = "Телефон: ${advert.author.phone}")
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AdvertDetailSectionChipRow(title: String, items: List<String>) {
    if (items.isNotEmpty()) {
        Text(text = title, style = MaterialTheme.typography.titleSmall, modifier = Modifier.padding(top = 8.dp))
        FlowRow(
            modifier = Modifier.padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items.forEach { item ->
                AssistChip(onClick = {}, label = { Text(item) })
            }
        }
    }
}