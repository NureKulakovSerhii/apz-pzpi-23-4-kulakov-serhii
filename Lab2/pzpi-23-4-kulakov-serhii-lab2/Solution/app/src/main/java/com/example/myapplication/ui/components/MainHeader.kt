package com.example.myapplication.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun MainHeader(
    onMenuClick: (String) -> Unit,
    onCreateAdvertClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val headerBackground = Color(0xFF87CEEB)
    val greenButtonColor = Color(0xFF2ECC71)

    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(headerBackground)
            .padding(horizontal = 4.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceAround
    ) {
        HeaderNavigationItem(icon = Icons.Default.Home, title = "Головна", onClick = { onMenuClick("home") })
        HeaderNavigationItem(icon = Icons.Default.Search, title = "Пошук", onClick = { onMenuClick("search") })
        HeaderNavigationItem(icon = Icons.Default.FavoriteBorder, title = "Обрані", onClick = { onMenuClick("favorites") })
        HeaderNavigationItem(icon = Icons.Default.Person, title = "Профіль", onClick = { onMenuClick("profile") })
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(4.dp)
        ) {
            Button(
                onClick = onCreateAdvertClick,
                colors = ButtonDefaults.buttonColors(containerColor = greenButtonColor),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                modifier = Modifier.height(38.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Додати",
                    tint = Color.White,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(2.dp))
                Text(
                    text = "Створити",
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun HeaderNavigationItem(
    icon: ImageVector,
    title: String,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clickable { onClick() }
            .padding(4.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = title,
            tint = Color(0xFF2C3E50),
            modifier = Modifier.size(22.dp)
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = title,
            fontSize = 10.sp,
            color = Color(0xFF2C3E50),
            fontWeight = FontWeight.Medium
        )
    }
}