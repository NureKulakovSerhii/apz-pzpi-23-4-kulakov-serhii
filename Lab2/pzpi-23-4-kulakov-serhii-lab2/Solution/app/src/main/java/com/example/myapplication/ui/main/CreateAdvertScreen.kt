package com.example.myapplication.ui.advert

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.domain.enums.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateAdvertScreen(
    viewModel: CreateAdvertViewModel,
    token: String?,
    onAdvertCreated: () -> Unit
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val textFieldColors = TextFieldDefaults.outlinedTextFieldColors(
        focusedBorderColor = Color(0xFF3498DB),
        unfocusedBorderColor = Color.LightGray,
        containerColor = Color.Transparent
    )

    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            viewModel.selectedImageUri = uri
            viewModel.selectedImageName = "Зображення готове для завантаження"
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Нове оголошення",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.padding(top = 8.dp, bottom = 20.dp)
            )

            if (viewModel.state is CreateAdvertState.Error) {
                Text(
                    text = (viewModel.state as CreateAdvertState.Error).message,
                    color = Color.Red,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
            }
            OutlinedTextField(
                value = viewModel.title,
                onValueChange = { viewModel.title = it },
                label = { Text("Назва оголошення *") },
                colors = textFieldColors,
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
            )
            OutlinedTextField(
                value = viewModel.description,
                onValueChange = { viewModel.description = it },
                label = { Text("Опис складу *") },
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().height(120.dp).padding(bottom = 12.dp)
            )
            OutlinedTextField(
                value = viewModel.address,
                onValueChange = { viewModel.address = it },
                label = { Text("Адреса *") },
                colors = textFieldColors,
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
            )
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = viewModel.pricePerMonth,
                    onValueChange = { viewModel.pricePerMonth = it },
                    label = { Text("Ціна/міс *") },
                    colors = textFieldColors,
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = viewModel.scale,
                    onValueChange = { viewModel.scale = it },
                    label = { Text("Площа м²") },
                    colors = textFieldColors,
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = viewModel.floor,
                    onValueChange = { viewModel.floor = it },
                    label = { Text("Поверх") },
                    colors = textFieldColors,
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
            }
            var cityExpanded by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = cityExpanded,
                onExpandedChange = { cityExpanded = !cityExpanded },
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
            ) {
                OutlinedTextField(
                    value = viewModel.selectedCity.name,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Місто") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = cityExpanded) },
                    colors = textFieldColors,
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(
                    expanded = cityExpanded,
                    onDismissRequest = { cityExpanded = false }
                ) {
                    City.values().forEach { city ->
                        DropdownMenuItem(
                            text = { Text(city.name) },
                            onClick = {
                                viewModel.selectedCity = city
                                cityExpanded = false
                            }
                        )
                    }
                }
            }
            var buildingExpanded by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = buildingExpanded,
                onExpandedChange = { buildingExpanded = !buildingExpanded },
                modifier = Modifier.fillMaxWidth().padding(bottom = 20.dp)
            ) {
                OutlinedTextField(
                    value = viewModel.selectedBuildingType.name,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Тип будівлі") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = buildingExpanded) },
                    colors = textFieldColors,
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(
                    expanded = buildingExpanded,
                    onDismissRequest = { buildingExpanded = false }
                ) {
                    BuildingType.values().forEach { type ->
                        DropdownMenuItem(
                            text = { Text(type.name) },
                            onClick = {
                                viewModel.selectedBuildingType = type
                                buildingExpanded = false
                            }
                        )
                    }
                }
            }
            Text(
                text = "Комунікації",
                modifier = Modifier.align(Alignment.Start).padding(bottom = 4.dp),
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
            Communications.values().forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            if (viewModel.selectedCommunications.contains(item)) viewModel.selectedCommunications.remove(item)
                            else viewModel.selectedCommunications.add(item)
                        },
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = viewModel.selectedCommunications.contains(item),
                        onCheckedChange = null
                    )
                    Text(text = item.name, modifier = Modifier.padding(start = 8.dp))
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Побутова техніка / Обладнання",
                modifier = Modifier.align(Alignment.Start).padding(bottom = 4.dp),
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
            HouseholdAppliances.values().forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            if (viewModel.selectedAppliances.contains(item)) viewModel.selectedAppliances.remove(item)
                            else viewModel.selectedAppliances.add(item)
                        },
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = viewModel.selectedAppliances.contains(item),
                        onCheckedChange = null
                    )
                    Text(text = item.name, modifier = Modifier.padding(start = 8.dp))
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Інфраструктура",
                modifier = Modifier.align(Alignment.Start).padding(bottom = 4.dp),
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
            Infrastructure.values().forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            if (viewModel.selectedInfrastructures.contains(item)) viewModel.selectedInfrastructures.remove(item)
                            else viewModel.selectedInfrastructures.add(item)
                        },
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = viewModel.selectedInfrastructures.contains(item),
                        onCheckedChange = null
                    )
                    Text(text = item.name, modifier = Modifier.padding(start = 8.dp))
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
            Button(
                onClick = { imagePickerLauncher.launch("image/*") },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7F8C8D)),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth().height(44.dp)
            ) {
                Text(if (viewModel.selectedImageName.isEmpty()) "🖼️ Додати фото складу" else "✅ ${viewModel.selectedImageName}", color = Color.White)
            }

            Spacer(modifier = Modifier.height(24.dp))
            Button(
                onClick = { viewModel.createAdvert(context, token, onAdvertCreated) },
                enabled = viewModel.state !is CreateAdvertState.Loading,
                modifier = Modifier.fillMaxWidth().height(50.dp).padding(bottom = 12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2980B9)),
                shape = RoundedCornerShape(8.dp)
            ) {
                if (viewModel.state is CreateAdvertState.Loading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Опублікувати оголошення", fontSize = 16.sp, color = Color.White)
                }
            }
        }
    }
}