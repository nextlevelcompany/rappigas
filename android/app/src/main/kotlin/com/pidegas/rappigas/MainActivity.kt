package com.pidegas.rappigas

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.GeolocationPermissions
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.pidegas.rappigas.ui.theme.RappiGasTheme

class MainActivity : ComponentActivity() {

    private val defaultServerUrl = "https://rappigas.nextlevel.pe/auth/login"
    private val prefsKey = "rappigas_server_url"

    private val locationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { _ ->
            // Permissions handled, webview geolocation will now use fine/coarse location
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request GPS permissions on app start for driver tracking and delivery map
        requestLocationPermissions()

        enableEdgeToEdge()
        setContent {
            RappiGasTheme {
                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .statusBarsPadding(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    RappiGasAppContainer(
                        initialUrl = getServerUrl(),
                        onSaveUrl = { newUrl -> saveServerUrl(newUrl) },
                        onDialPhone = { phone -> dialPhoneNumber(phone) },
                        onOpenExternal = { uri -> openExternalUri(uri) }
                    )
                }
            }
        }
    }

    private fun requestLocationPermissions() {
        val permissions = arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            locationPermissionLauncher.launch(missing.toTypedArray())
        }
    }

    private fun getServerUrl(): String {
        val prefs = getSharedPreferences("rappigas_prefs", Context.MODE_PRIVATE)
        val saved = prefs.getString(prefsKey, defaultServerUrl) ?: defaultServerUrl
        // Si tenía guardada una URL antigua o túneles de prueba, reemplazar por el dominio oficial
        if (saved.startsWith("http://192.168.") || saved.contains("trycloudflare.com")) {
            saveServerUrl(defaultServerUrl)
            return defaultServerUrl
        }
        return saved
    }

    private fun saveServerUrl(url: String) {
        val prefs = getSharedPreferences("rappigas_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString(prefsKey, url).apply()
    }

    private fun dialPhoneNumber(phone: String) {
        val intent = Intent(Intent.ACTION_DIAL).apply {
            data = Uri.parse("tel:$phone")
        }
        startActivity(intent)
    }

    private fun openExternalUri(uri: Uri) {
        val intent = Intent(Intent.ACTION_VIEW, uri)
        startActivity(intent)
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun RappiGasAppContainer(
    initialUrl: String,
    onSaveUrl: (String) -> Unit,
    onDialPhone: (String) -> Unit,
    onOpenExternal: (Uri) -> Unit
) {
    var currentUrl by remember { mutableStateOf(initialUrl) }
    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var progress by remember { mutableFloatStateOf(0f) }
    var isLoading by remember { mutableStateOf(true) }
    var hasError by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var inputUrl by remember { mutableStateOf(currentUrl) }

    // Intercept back button to navigate backwards in web history
    BackHandler(enabled = webViewRef?.canGoBack() == true) {
        webViewRef?.goBack()
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // Main WebView
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                WebView(context).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )

                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        databaseEnabled = true
                        setGeolocationEnabled(true)
                        allowFileAccess = true
                        loadWithOverviewMode = true
                        useWideViewPort = true
                        cacheMode = WebSettings.LOAD_DEFAULT
                        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                        userAgentString = "$userAgentString RappiGasApp/1.0"
                    }

                    webChromeClient = object : WebChromeClient() {
                        override fun onProgressChanged(view: WebView?, newProgress: Int) {
                            progress = newProgress / 100f
                            isLoading = newProgress < 100
                        }

                        override fun onGeolocationPermissionsShowPrompt(
                            origin: String?,
                            callback: GeolocationPermissions.Callback?
                        ) {
                            // Always grant location to RappiGas webview map
                            callback?.invoke(origin, true, false)
                        }
                    }

                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                            isLoading = true
                            hasError = false
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            isLoading = false
                        }

                        override fun onReceivedError(
                            view: WebView?,
                            request: WebResourceRequest?,
                            error: WebResourceError?
                        ) {
                            if (request?.isForMainFrame == true) {
                                hasError = true
                                errorMessage = error?.description?.toString() ?: "Error de red"
                            }
                        }

                        override fun shouldOverrideUrlLoading(
                            view: WebView?,
                            request: WebResourceRequest?
                        ): Boolean {
                            val uri = request?.url ?: return false
                            val scheme = uri.scheme ?: ""

                            // Handle phone calls
                            if (scheme == "tel") {
                                onDialPhone(uri.schemeSpecificPart)
                                return true
                            }

                            // Handle WhatsApp and external map URLs
                            val host = uri.host ?: ""
                            if (host.contains("wa.me") || host.contains("whatsapp.com") ||
                                host.contains("waze.com") || host.contains("maps.google.com")
                            ) {
                                onOpenExternal(uri)
                                return true
                            }

                            // Prevent returning to public web landing page
                            val path = uri.path ?: ""
                            if (path == "/" || path.isEmpty()) {
                                view?.loadUrl(initialUrl)
                                return true
                            }

                            return false
                        }
                    }

                    loadUrl(currentUrl)
                    webViewRef = this
                }
            },
            update = { webView ->
                webViewRef = webView
            }
        )

        // Loading bar at the top
        if (isLoading && progress < 1f) {
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(3.dp)
                    .align(Alignment.TopCenter),
                color = Color(0xFFFF6600), // RappiGas Orange
            )
        }

        // Connection Error Screen with Retry
        if (hasError) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "🔥 RappiGas",
                        fontSize = 28.sp,
                        color = Color(0xFFFF6600)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "No se pudo conectar con el servidor",
                        fontSize = 18.sp,
                        color = Color.Black
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "URL: $currentUrl",
                        fontSize = 13.sp,
                        color = Color.Gray
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = errorMessage,
                        fontSize = 12.sp,
                        color = Color.Red
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = {
                            hasError = false
                            webViewRef?.loadUrl(currentUrl)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF6600))
                    ) {
                        Text("🔄 Reintentar Conexión")
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    TextButton(onClick = {
                        inputUrl = currentUrl
                        showSettingsDialog = true
                    }) {
                        Text("Cambiar IP del Servidor", color = Color(0xFFFF6600))
                    }
                }
            }
        }

        // Settings Dialog to change server IP if Wi-Fi changes
        if (showSettingsDialog) {
            AlertDialog(
                onDismissRequest = { showSettingsDialog = false },
                title = { Text("Configuración de Servidor") },
                text = {
                    Column {
                        Text(
                            "Ingresa la dirección IP de tu laptop donde corre RappiGas:",
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = inputUrl,
                            onValueChange = { inputUrl = it },
                            label = { Text("URL del Servidor") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val trimmed = inputUrl.trim()
                            if (trimmed.isNotEmpty()) {
                                currentUrl = trimmed
                                onSaveUrl(trimmed)
                                hasError = false
                                webViewRef?.loadUrl(trimmed)
                            }
                            showSettingsDialog = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF6600))
                    ) {
                        Text("Guardar")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showSettingsDialog = false }) {
                        Text("Cancelar")
                    }
                }
            )
        }
    }
}
