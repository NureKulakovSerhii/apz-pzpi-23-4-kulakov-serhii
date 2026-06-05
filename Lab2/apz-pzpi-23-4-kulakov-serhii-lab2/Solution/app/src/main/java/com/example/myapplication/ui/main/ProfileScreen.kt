package com.example.myapplication.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.ui.auth.AuthViewModel

@Composable
fun ProfileScreen(
    profileViewModel: ProfileViewModel,
    authViewModel: AuthViewModel
) {
    val token = authViewModel.token
    val profile = profileViewModel.profileData
    LaunchedEffect(Unit) {
        profileViewModel.loadProfile(token)
    }

    Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        if (profileViewModel.isLoading && profile == null) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        } else if (profile != null) {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (profileViewModel.isEditing) "Редагування" else "Мій Профіль",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )

                    IconButton(
                        onClick = {
                            if (profileViewModel.isEditing) {
                                profileViewModel.saveProfile(token)
                            } else {
                                profileViewModel.isEditing = true
                            }
                        }
                    ) {
                        Icon(
                            imageVector = if (profileViewModel.isEditing) Icons.Default.Check else Icons.Default.Edit,
                            contentDescription = "Дія з профілем",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
                ProfileField(label = "Ім'я", value = profileViewModel.editName, isEditing = profileViewModel.isEditing) {
                    profileViewModel.editName = it
                }
                ProfileField(label = "Прізвище", value = profileViewModel.editSurname, isEditing = profileViewModel.isEditing) {
                    profileViewModel.editSurname = it
                }
                ProfileField(label = "Email", value = profile.email, isEditing = false) {}

                ProfileField(label = "Номер телефону", value = profileViewModel.editPhone, isEditing = profileViewModel.isEditing) {
                    profileViewModel.editPhone = it
                }
                ProfileField(label = "Додатковий номер", value = profileViewModel.editSecondPhone, isEditing = profileViewModel.isEditing) {
                    profileViewModel.editSecondPhone = it
                }
                Spacer(modifier = Modifier.weight(1f))
                Button(
                    onClick = {
                        authViewModel.logout()
                        authViewModel.navigateTo(AuthViewModel.CurrentScreen.HOME)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                ) {
                    Text("Вийти з акаунту")
                }
            }
        }
    }
}

@Composable
fun ProfileField(
    label: String,
    value: String,
    isEditing: Boolean,
    onValueChange: (String) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Text(text = label, fontSize = 14.sp, color = MaterialTheme.colorScheme.outline, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(4.dp))
        if (isEditing) {
            OutlinedTextField(
                value = value,
                onValueChange = onValueChange,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
        } else {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
            ) {
                Text(
                    text = value.ifBlank { "Не вказано" },
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                    fontSize = 16.sp
                )
            }
        }
    }
}