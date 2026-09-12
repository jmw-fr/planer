# Planer Sport App

## Role of the application

The Flutter application in this package is the mobile and web client for the Planer Sport ecosystem. It is the user-facing layer used to present schedules, planning data, training sessions, and future athlete/coaching workflows built on top of the Rust backend.

In the current foundation phase, the app is intentionally light: it validates the project structure, confirms the shared Flutter package is wired correctly, and provides a stable base for the feature work that will follow. The long-term role is to provide a single Flutter experience for both mobile and web interfaces, while the backend exposes the business logic and data services through the Rust API.

## Application structure

This repository is organized as a multi-package Flutter workspace:

```text
rust-flutter/
├── backend/              # Rust workspace and API services
├── app/
│   ├── pubspec.yaml      # workspace configuration for Melos
│   ├── packages/
│   │   ├── shared/       # reusable domain/data/theme utilities
│   │   └── planer_sport_app/  # application shell and screens
│   └── README.md
└── README.md
```

### Packages

- `shared`: common logic, shared models, reusable UI/theme helpers, and cross-platform utilities that both the web and mobile app can consume.
- `planer_sport_app`: the main user-facing Flutter app package. This is where the Material app, screens, navigation, and business features are introduced over time.

### Current app shell

The app currently contains a minimal entry point and placeholder screen to confirm that the workspace and shared dependency are working correctly:

- `lib/main.dart` initializes the app and renders the root Material app.
- `lib/` is the place where future pages, navigation, feature modules, and flows will be added.
- `android/`, `ios/`, and `web/` contain the platform-specific Flutter project files.

## Running the app locally

From the workspace root:

```powershell
cd rust-flutter\app
flutter pub get
flutter run
```

If you want to target a specific device or browser:

```powershell
flutter devices
flutter run -d chrome
flutter run -d android
```

## Development flow

The project is following a foundation-first approach:

1. Validate the workspace and shared package dependencies.
2. Build the app shell and base navigation.
3. Add feature-specific modules and business screens.
4. Connect the Flutter app to the Rust API.
5. Prepare release builds for test and production environments.

This means the current placeholder screen is not the final product. It is a foundation proving that the architecture is stable before feature work begins.

## Manual publication of a test version to the Android Play Store

This section explains how to publish a test build manually for internal or open testing on Google Play.

> The general flow is: generate a signed Android App Bundle, upload it to Google Play Console, and publish it to an internal or closed testing track.

### 1. Prepare the signing key

Create a keystore if you do not already have one:

```powershell
keytool -genkeypair -v -keystore C:\path\to\upload-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

Keytool is part of JDK.
If you have Android Studio, it is located here : `C:\Program Files\Android\Android Studio\jbr\bin`.

Then configure the Android signing properties in `android/key.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=upload
storeFile=C:/path/to/upload-keystore.jks
```

Make sure the signing configuration is enabled in `android/app/build.gradle` for release builds.

### 2. Update the app version

Set a new version before building the release artifact:

```yaml
version: 1.0.1+2
```

- `1.0.1` = semantic version shown to users
- `2` = Android `versionCode`, incremented for each release

### 3. Build the Android App Bundle

From the app package directory:

```powershell
cd rust-flutter\app\packages\planer_sport_app
flutter clean
flutter pub get
flutter build appbundle --release --build-name=1.0.1 --build-number=2
```

The generated file is usually here:

```text
build/app/outputs/bundle/release/app-release.aab
```

You can also generate it with Gradle if needed:

```powershell
cd android
./gradlew bundleRelease
```

### 4. Upload to Google Play Console

1. Open the Google Play Console.
2. Select the app.
3. Go to `Release` > `Testing`.
4. Choose a test track such as `Internal testing` or `Closed testing`.
5. Click `Create new release`.
6. Upload the generated `.aab` file.
7. Add release notes.
8. Review the app details and submit the release.

### 5. Publish to testers

After upload, Google Play usually validates the package and then lets you publish the release to the selected testing track. You can then share the testing link with internal testers or a closed test group.

### 6. Recommended checklist before publishing

- Version name and code are updated.
- The signing key is valid and stored securely.
- The app bundle is built in release mode.
- Release notes are written clearly.
- Features are tested on at least one real Android device.
- The app is assigned to the correct testing track.

## Notes

This README is intentionally focused on the current foundation stage of the project. As the application evolves, this document should be expanded with feature documentation, architecture details, API contracts, and release procedures for web and mobile environments.
