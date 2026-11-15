# FoodRescue — Share Food, Save Tomorrow

FoodRescue is an Android-first Progressive Web App (PWA) and surplus food management platform connecting food donors (restaurants, hostels, caterers), receivers, NGOs, and platform administrators to reduce food waste and fight hunger.

## Download Through GitHub

You can download and install FoodRescue from GitHub in four ways:

### 1. Download Source Code (ZIP)
Click the green **Code** button on GitHub and select **Download ZIP**, or clone the repository:
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
npm run dev
```

### 2. Download Built Web App or Android APK (GitHub Releases)
This repository includes automated GitHub Actions workflows in `.github/workflows/`:
- **`.github/workflows/deploy-and-release.yml`**: Builds the production PWA, deploys it to **GitHub Pages**, and publishes `foodrescue-web-app.zip` to **GitHub Releases** on version tags (`v*`).
- **`.github/workflows/build-android-apk.yml`**: Packages the app with Capacitor into a downloadable **`FoodRescue-debug.apk`** Android installer under **Actions Artifacts** and **GitHub Releases**.

To download the latest release directly from GitHub:
1. Open the repository's **Releases** tab (or **Actions** → **Build Downloadable Android APK**).
2. Download `FoodRescue-debug.apk` (for Android devices) or `foodrescue-web-app.zip` (for self-hosting).

### 3. Install Directly as an App (PWA via GitHub Pages)
Once GitHub Pages is enabled (**Settings → Pages → Source: GitHub Actions**):
1. Open your GitHub Pages URL (`https://<your-username>.github.io/<your-repo>/`) on Android Chrome, desktop Chrome/Edge, or iOS Safari.
2. Tap **Install App** inside the app (Profile → App & GitHub Downloads, or on the Welcome screen) to install FoodRescue onto your home screen with offline caching.

---

## Publishing This Project to Your GitHub Repository

1. Initialize Git and push to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: FoodRescue app with PWA and GitHub release workflows"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. Enable **GitHub Pages** in your repository:
   - Go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Create a downloadable Release (including the Android APK and Web ZIP):
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   GitHub Actions will automatically build `FoodRescue-debug.apk` and `foodrescue-web-app.zip` and attach them to your `v1.0.0` Release.

---

## Local Development Scripts

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run lint         # TypeScript typecheck (tsc --noEmit)
npm run build        # Production build (dist/)
npm run preview      # Preview production build
```

## License

Licensed under the [Apache License 2.0](./LICENSE).
