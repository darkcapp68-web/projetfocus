plugins {
    alias(libs.plugins.android.application)
}

// L'APK n'est qu'une coquille : il ouvre le site publié dans le moteur de Chrome
// (Trusted Web Activity). Toute la maintenance se fait sur le site, pas ici.
// Seule chose à adapter : l'adresse du site une fois publié sur GitHub Pages.
val siteHost = "darkcapp68-web.github.io"
val sitePath = "/projetfocus/"

android {
    namespace = "fr.projetfocus.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "fr.projetfocus.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 2
        versionName = "2.0"

    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

