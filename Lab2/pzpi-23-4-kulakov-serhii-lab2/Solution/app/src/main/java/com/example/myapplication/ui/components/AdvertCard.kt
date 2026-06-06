package com.example.myapplication.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.myapplication.data.model.AdvertDto

@Composable
fun AdvertCard(
    advert: AdvertDto,
    onCardClick: (String) -> Unit,
    onLikeClick: (String) -> Unit,
    isFavoriteScreen: Boolean = false,
    modifier: Modifier = Modifier
) {
    val placeholderUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"
    val imageUrl = advert.warehouse.imageUrl ?: placeholderUrl

    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFFE5E5E5)),
        shape = RoundedCornerShape(12.dp),
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp, horizontal = 12.dp)
            .clickable { onCardClick(advert.id) }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            AsyncImage(
                model = imageUrl,
                contentDescription = advert.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(110.dp)
                    .clip(RoundedCornerShape(8.dp))
            )

            Spacer(modifier = Modifier.width(12.dp))
            Column(
                modifier = Modifier
                    .weight(1f)
                    .align(Alignment.CenterVertically)
            ) {
                Text(
                    text = advert.title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = advert.description,
                    fontSize = 14.sp,
                    color = Color.DarkGray,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(vertical = 2.dp)
                )
                Text(
                    text = advert.warehouse.address,
                    fontSize = 13.sp,
                    color = Color.Gray
                )
                Text(
                    text = "${advert.warehouse.scale} кв.м.",
                    fontSize = 13.sp,
                    color = Color.Black,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
            Column(
                horizontalAlignment = Alignment.End,
                modifier = Modifier
                    .fillMaxHeight()
                    .padding(start = 4.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "${advert.warehouse.pricePerMonth} грн/міс",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Text(
                        text = "Договірна",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))
                IconButton(onClick = { onLikeClick(advert.id) }) {
                    if (isFavoriteScreen) {
                        Icon(
                            imageVector = Icons.Default.Clear,
                            contentDescription = "Видалити з обраного",
                            tint = Color.Black
                        )
                    } else {
                        Icon(
                            imageVector = if (advert.isFavorite) Icons.Default.Favorite else Icons.Outlined.FavoriteBorder,
                            contentDescription = if (advert.isFavorite) "Видалити з обраного" else "Додати в обране",
                            tint = if (advert.isFavorite) Color.Red else Color.Gray
                        )
                    }
                }
            }
        }
    }
}