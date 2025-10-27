# 🎾 Pickle Auth Setup - Quick Guide

## What You Have

✅ **Custom Resend email template** with beautiful Pickle branding  
✅ **Universal Links (iOS)** + **App Links (Android)** - Opens app directly  
✅ **Smart web fallback** - Works on desktop or when app not installed  
✅ **All configured for jpickle.win**

## How It Works

1. **User enters email** → Clicks "Send login link"
2. **Resend sends beautiful email** → Custom Pickle-branded template 🎾
3. **User clicks link** → `https://jpickle.win/auth/verify?token=...`
4. **Magic happens:**
   - **iOS with app** → Universal Links open app automatically
   - **Android with app** → App Links open app automatically
   - **Desktop/No app** → Web page with "Open App" button + deep link fallback
5. **App opens** → Auto-signs in, redirects to home

## Setup Steps

### 1. Install Resend SDK

```bash
npm install resend
```

### 2. Set Resend API Key in Convex

Go to your Convex dashboard and add:

```
AUTH_RESEND_KEY=re_your_api_key_here
```

Get your API key from [Resend Dashboard](https://resend.com/api-keys)

### 3. Verify Domain in Resend

In Resend, verify `jpickle.win` so you can send from `onboarding@jpickle.win`

### 4. Deploy to Vercel

```bash
# Build web version
npx expo export -p web

# Deploy (make sure it's connected to jpickle.win)
vercel --prod
```

### 5. Verify These URLs Work

Test in your browser:
- ✅ `https://jpickle.win/.well-known/apple-app-site-association` (should return JSON)
- ✅ `https://jpickle.win/.well-known/assetlinks.json` (should return JSON)

### 6. Android SHA256 (Android Only)

Get your SHA256 fingerprint:

```bash
cd android
./gradlew signingReport
```

Copy the SHA256 and update `public/.well-known/assetlinks.json`:

```json
"sha256_cert_fingerprints": [
  "YOUR_SHA256_HERE"
]
```

Then redeploy: `npx expo export -p web && vercel --prod`

### 7. Rebuild Your App

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## Test It! 🚀

1. Open app
2. Enter your email
3. Check inbox for beautiful Pickle email
4. Click "Sign In to Pickle" button
5. App opens automatically
6. You're logged in!

## Files Created

```
convex/
  └── ResendOTPPasswordless.ts    # Custom provider with email template

app/
  ├── +html.tsx                    # HTML wrapper with Apple Smart Banner
  └── auth/
      ├── verify.tsx               # Native app auth handler
      └── verify+html.tsx          # Web landing page with app opener

public/
  └── .well-known/
      ├── apple-app-site-association   # iOS Universal Links config
      └── assetlinks.json              # Android App Links config
```

## Troubleshooting

### Emails not sending?
- Check `AUTH_RESEND_KEY` is set in Convex dashboard
- Verify `jpickle.win` is verified in Resend
- Check Convex logs for errors

### Universal Links not working on iOS?
- Delete app and reinstall (iOS caches AASA on install)
- Verify AASA file is accessible at the URL above
- Clear Safari data: Settings → Safari → Clear History

### App Links not working on Android?
- Make sure SHA256 fingerprint matches
- Check assetlinks.json is accessible
- Try clearing app data

### Link opens browser instead of app?
- First time may open browser (expected!)
- The web page will try to open the app
- After verification, future links should open app directly

## What's Different From Before?

**Before:** Plain Resend provider
- ❌ Basic email template
- ❌ No branding
- ❌ Link opened app but not seamlessly

**Now:** Custom solution
- ✅ Beautiful branded emails
- ✅ Universal/App Links for seamless app opening
- ✅ Web fallback that works everywhere
- ✅ Smart redirect logic
- ✅ Works on iOS, Android, and web

## Production Checklist

- [ ] `npm install resend` completed
- [ ] Resend API key set in Convex
- [ ] Domain verified in Resend
- [ ] Website deployed to jpickle.win
- [ ] AASA file accessible
- [ ] Android SHA256 updated (if supporting Android)
- [ ] App rebuilt with new config
- [ ] Tested on real device

---

You're ready to go! 🚀 Deploy and test it out!


