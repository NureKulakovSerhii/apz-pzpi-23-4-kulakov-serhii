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
fun LoginScreen(
    viewModel: AuthViewModel,
    onNavigateToRegister: () -> Unit,
    onLoginSuccess: () -> Unit
) {
    val isLoading = viewModel.authState is AuthState.Loading
    val errorMessage = (viewModel.authState as? AuthState.Error)?.message

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
                text = "Увійти в акаунт",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.padding(bottom = 20.dp)
            )

            if (errorMessage != null) {
                Text(
                    text = errorMessage,
                    color = Color.Red,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
            }
            Text(
                text = "Електронна пошта *",
                fontSize = 14.sp,
                color = Color.DarkGray,
                modifier = Modifier.align(Alignment.Start).padding(bottom = 4.dp)
            )
            OutlinedTextField(
                value = viewModel.loginEmail,
                onValueChange = { viewModel.loginEmail = it; viewModel.clearError() },
                placeholder = { Text("your@email.com") },
                singleLine = true,
                enabled = !isLoading,
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    focusedBorderColor = Color(0xFF3498DB),
                    unfocusedBorderColor = Color.LightGray,
                    containerColor = Color.Transparent,
                )
            )
            Text(
                text = "Пароль *",
                fontSize = 14.sp,
                color = Color.DarkGray,
                modifier = Modifier.align(Alignment.Start).padding(bottom = 4.dp)
            )
            var passwordVisible by remember { mutableStateOf(false) }
            OutlinedTextField(
                value = viewModel.loginPassword,
                onValueChange = { viewModel.loginPassword = it; viewModel.clearError() },
                placeholder = { Text("••••••••") },
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
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    focusedBorderColor = Color(0xFF3498DB),
                    unfocusedBorderColor = Color.LightGray,
                    containerColor = Color.Transparent,
                )
            )
            Text(
                text = "Немає акаунта?",
                color = Color.Gray,
                fontSize = 14.sp,
                modifier = Modifier
                    .padding(bottom = 20.dp)
                    .clickable(enabled = !isLoading) { onNavigateToRegister() }
            )
            Button(
                onClick = { viewModel.login(onLoginSuccess) },
                enabled = !isLoading,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2980B9)),
                shape = RoundedCornerShape(8.dp)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Увійти", fontSize = 16.sp, color = Color.White)
                }
            }
        }
    }
}