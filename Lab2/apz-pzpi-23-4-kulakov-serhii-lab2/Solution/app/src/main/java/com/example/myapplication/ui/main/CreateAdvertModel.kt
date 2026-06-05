package com.example.myapplication.ui.advert

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import androidx.compose.runtime.*
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.network.RetrofitClient
import com.example.myapplication.domain.enums.*
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.FileOutputStream

sealed interface CreateAdvertState {
    object Idle : CreateAdvertState
    object Loading : CreateAdvertState
    object Success : CreateAdvertState
    data class Error(val message: String) : CreateAdvertState
}

class CreateAdvertViewModel : ViewModel() {
    var title by mutableStateOf("")
    var description by mutableStateOf("")
    var address by mutableStateOf("")
    var pricePerMonth by mutableStateOf("")
    var scale by mutableStateOf("")
    var floor by mutableStateOf("")
    var selectedBuildingType by mutableStateOf(BuildingType.Бокс)
    var selectedCity by mutableStateOf(City.Київ)
    val selectedCommunications = mutableStateListOf<Communications>()
    val selectedAppliances = mutableStateListOf<HouseholdAppliances>()
    val selectedInfrastructures = mutableStateListOf<Infrastructure>()
    var selectedImageUri by mutableStateOf<Uri?>(null)
    var selectedImageName by mutableStateOf("")

    var state by mutableStateOf<CreateAdvertState>(CreateAdvertState.Idle)

    fun resetForm() {
        title = ""; description = ""; address = ""; pricePerMonth = ""; scale = ""; floor = ""
        selectedBuildingType = BuildingType.Бокс
        selectedCity = City.Київ
        selectedCommunications.clear()
        selectedAppliances.clear()
        selectedInfrastructures.clear()
        selectedImageUri = null
        selectedImageName = ""
        state = CreateAdvertState.Idle
    }

    fun createAdvert(context: Context, token: String?, onSuccess: () -> Unit) {
        if (token == null) {
            state = CreateAdvertState.Error("Користувач не авторизований")
            return
        }
        if (title.isBlank() || description.isBlank() || address.isBlank() || pricePerMonth.isBlank()) {
            state = CreateAdvertState.Error("Будь ласка, заповніть обов'язкові поля *")
            return
        }

        viewModelScope.launch {
            state = CreateAdvertState.Loading
            try {
                val textType = "text/plain".toMediaTypeOrNull()
                val titleBody = title.toRequestBody(textType)
                val descBody = description.toRequestBody(textType)
                val addressBody = address.toRequestBody(textType)
                val priceBody = pricePerMonth.toRequestBody(textType)
                val scaleBody = scale.ifBlank { "0" }.toRequestBody(textType)
                val floorBody = floor.ifBlank { "0" }.toRequestBody(textType)
                val buildingBody = selectedBuildingType.value.toString().toRequestBody(textType)
                val cityBody = selectedCity.value.toString().toRequestBody(textType)
                val imagePart = selectedImageUri?.let { uri ->
                    getFileFromUri(context, uri)?.let { file ->
                        val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                        MultipartBody.Part.createFormData("WarehouseDto.ImageFile", file.name, requestFile)
                    }
                }
                val commBodies = selectedCommunications.map {
                    MultipartBody.Part.createFormData("WarehouseDto.Communications", it.value.toString())
                }

                val appBodies = selectedAppliances.map {
                    MultipartBody.Part.createFormData("WarehouseDto.HouseholdAppliances", it.value.toString())
                }

                val infraBodies = selectedInfrastructures.map {
                    MultipartBody.Part.createFormData("WarehouseDto.Infrastructures", it.value.toString())
                }
                val response = RetrofitClient.apiService.createAdvert(
                    token = "Bearer $token",
                    title = titleBody, description = descBody, address = addressBody,
                    price = priceBody, scale = scaleBody, floor = floorBody,
                    buildingType = buildingBody, city = cityBody,
                    imageFile = imagePart,
                    communications = commBodies,
                    appliances = appBodies,
                    infrastructures = infraBodies
                )
                if (response.isSuccessful) {
                    state = CreateAdvertState.Success
                    resetForm()
                    onSuccess()
                } else {
                    state = CreateAdvertState.Error("Помилка сервера: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("CreateAdvert", "Помилка відправки", e)
                state = CreateAdvertState.Error("Мережева помилка: ${e.localizedMessage}")
            }
        }
    }

    private fun getFileFromUri(context: Context, uri: Uri): File? {
        val returnCursor = context.contentResolver.query(uri, null, null, null, null) ?: return null
        val nameIndex = returnCursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
        returnCursor.moveToFirst()
        val name = returnCursor.getString(nameIndex)
        returnCursor.close()

        val file = File(context.cacheDir, name)
        try {
            val inputStream = context.contentResolver.openInputStream(uri) ?: return null
            val outputStream = FileOutputStream(file)
            inputStream.copyTo(outputStream)
            inputStream.close()
            outputStream.close()
            return file
        } catch (e: Exception) {
            return null
        }
    }
}