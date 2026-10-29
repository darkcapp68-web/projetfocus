plugins {
    alias(libs.plugins.android.application)
}

// L'APK n'est qu'une coquille : il ouvre le site publié dans le moteur de Chrome
// (Trusted Web Activity). Toute la maintenance se fait sur le site, pas ici.
// Seule chose à adapter : l'adresse du site une fois publié sur GitHub Pages.
val siteHost = "TON-COMPTE.github.io"
val sitePath = "/projetfocus/"

android {
    namespace = "fr.projetfocus.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "fr.projetfocus.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        manifestPlaceholders["hostName"] = siteHost
        manifestPlaceholders["defaultUrl"] = "https://$siteHost$sitePath"
        // Lien de confiance avec le site (voir android/README.md, « assetlinks.json »).
        resValue(
            "string", "asset_statements",
            """[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"web","site":"https://$siteHost"}}]""",
        )
    }

    buildFeatures {
        resValues = true
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

dependencies {
    implementation(libs.androidbrowserhelper)
}
