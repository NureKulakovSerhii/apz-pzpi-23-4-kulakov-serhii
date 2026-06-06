package com.example.myapplication.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.example.myapplication.ui.main.SearchViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CityDropdown(viewModel: SearchViewModel) {
    ExposedDropdownMenuBox(
        expanded = viewModel.expanded,
        onExpandedChange = { viewModel.expanded = !viewModel.expanded }
    ) {
        OutlinedTextField(
            value = viewModel.selectedCity.value ?: "--",
            onValueChange = {},
            readOnly = true,
            label = { Text("Місто") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = viewModel.expanded) },
            modifier = Modifier
                .menuAnchor()
                .fillMaxWidth()
        )

        ExposedDropdownMenu(
            expanded = viewModel.expanded,
            onDismissRequest = { viewModel.expanded = false }
        ) {
            DropdownMenuItem(
                text = { Text("--") },
                onClick = {
                    viewModel.selectedCity.value = null
                    viewModel.expanded = false
                },
                contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding
            )

            viewModel.cityOptions.forEach { city ->
                DropdownMenuItem(
                    text = { Text(city) },
                    onClick = {
                        viewModel.selectedCity.value = city
                        viewModel.expanded = false
                    },
                    contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding
                )
            }
        }
    }
}