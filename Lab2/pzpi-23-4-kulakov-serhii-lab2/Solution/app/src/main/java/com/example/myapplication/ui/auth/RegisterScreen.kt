package com.example.myapplication.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit
) {
    val isLoading = viewModel.authState is AuthState.Loading
    val errorMessage = (viewModel.authState as? AuthState.Error)?.message

    val textFieldColors = TextFieldDefaults.outlinedTextFieldColors(
        focusedBorderColor = Color(0xFF3498DB),
        unfocusedBorderColor = Color.LightGray,
        containerColor = Color.Transparent,
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Реєстрація",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            if (errorMessage != null) {
                Text(
                    text = errorMessage,
                    color = Color.Red,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }
            OutlinedTextField(
                value = viewModel.regFirstName,
                onValueChange = { viewModel.regFirstName = it; viewModel.clearError() },
                label = { Text("Ім'я") },
                singleLine = true,
                enabled = !isLoading,
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
            )
            OutlinedTextField(
                value = viewModel.regLastName,
                onValueChange = { viewModel.regLastName = it; viewModel.clearError() },
                label = { Text("Прізвище") },
                singleLine = true,
                enabled = !isLoading,
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
            )
            OutlinedTextField(
                value = viewModel.regEmail,
                onValueChange = { viewModel.regEmail = it; viewModel.clearError() },
                label = { Text("Електронна пошта") },
                singleLine = true,
                enabled = !isLoading,
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
            )
            var passwordVisible by remember { mutableStateOf(false) }
            OutlinedTextField(
                value = viewModel.regPassword,
                onValueChange = { viewModel.regPassword = it; viewModel.clearError() },
                label = { Text("Пароль") },
                singleLine = true,
                enabled = !isLoading,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    Text(
                        text = if (passwordVisible) "👁️" else "👁️‍🗨️",
                        fontSize = 18.sp,
                        modifier = Modifier
                            .padding(end = 8.dp)
                            .clickable { passwordVisible = !passwordVisible }
                    )
                },
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            )

            Text(
                text = "Вже є акаунт?",
                color = Color.Gray,
                fontSize = 14.sp,
                modifier = Modifier
                    .padding(bottom = 16.dp)
                    .clickable(enabled = !isLoading) { onNavigateToLogin() }
            )

            Button(
                onClick = { viewModel.register(onRegisterSuccess) },
                enabled = !isLoading,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2980B9)),
                shape = RoundedCornerShape(8.dp)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Зареєструватися", fontSize = 16.sp, color = Color.White)
                }
            }
        }
    }
}