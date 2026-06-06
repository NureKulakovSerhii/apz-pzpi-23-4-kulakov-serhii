package com.example.myapplication.domain.enums

enum class BuildingType(val value: Int) {
    Бокс(0), Ангар(1), Офіснийсклад(2);
    companion object { fun fromInt(i: Int) = values().find { it.value == i } ?: Бокс }
}

enum class City(val value: Int) {
    Київ(0), Одеса(1), Львів(2), Харків(3), Дніпро(4), Запоріжжя(5), Вінниця(6), Житомир(7), Чернігів(8);
    companion object { fun fromInt(i: Int) = values().find { it.value == i } ?: Київ }
}

enum class Communications(val value: Int) {
    Електрика(0), Водопостачання(1), Каналізація(2), Опалення(3), Вентиляція(4), Інтернет(5);
    companion object { fun fromInt(i: Int) = values().find { it.value == i } ?: Електрика }
}

enum class HouseholdAppliances(val value: Int) {
    Кондиціонер(0), Охороннасистема(1), Відеоспостереження(2), Вогнегасники(3);
    companion object { fun fromInt(i: Int) = values().find { it.value == i } ?: Кондиціонер }
}

enum class Infrastructure(val value: Int) {
    Парковка(0), Вантажнийліфт(1), Рампа(2), Охорона(3), Душові(4), Їдальня(5);
    companion object { fun fromInt(i: Int) = values().find { it.value == i } ?: Парковка }
}
data class CreateAdvertResponse(
    val id: String,
    val title: String,
    val description: String,
    val createdAt: String,
    val isActive: Boolean,
    val warehouse: WarehouseResponse
)

data class WarehouseResponse(
    val address: String,
    val pricePerMonth: Int,
    val scale: Int,
    val floor: Int,
    val buildingType: Int,
    val city: Int,
    val imageUrl: String
)