# Microphone Troubleshooting Guide

## Common Errors and Solutions

### Error: "not-allowed"
**Cause:** Browser doesn't have permission to access the microphone.

**Solutions:**
1. **Chrome/Edge/Brave:**
   - Click the 🔒 lock icon or camera icon in the address bar
   - Find "Microphone" and change from "Block" to "Allow"
   - Refresh the page

2. **Firefox:**
   - Click the microphone icon in the address bar
   - Select "Allow" from the dropdown
   - Check "Remember this decision"

3. **Safari:**
   - Safari → Settings → Websites → Microphone
   - Find your site and set to "Allow"

### Error: "audio-capture"
**Cause:** No microphone detected.

**Solutions:**
- Check if your microphone is plugged in
- Check system settings to ensure microphone is enabled
- Try a different microphone
- On Mac: System Settings → Privacy & Security → Microphone
- On Windows: Settings → Privacy → Microphone

### Error: "no-speech"
**Cause:** No speech was detected.

**Solutions:**
- Speak louder and clearer
- Check microphone volume in system settings
- Ensure microphone isn't muted
- Test microphone in other apps

### Error: "network"
**Cause:** Network connection issue (speech recognition requires internet).

**Solutions:**
- Check your internet connection
- Try refreshing the page
- Wait and try again

## Browser Compatibility

✅ **Supported:**
- Chrome (desktop & mobile)
- Edge (desktop)
- Safari (desktop & iOS)
- Samsung Internet

❌ **Not Supported:**
- Firefox (no Web Speech API support yet)
- Opera (limited support)

## HTTPS Requirement

⚠️ **Important:** Microphone access requires HTTPS (secure connection).

- Works on: https://yoursite.com
- Doesn't work on: http://yoursite.com
- Exception: localhost (works for development)

## Alternative: Type Instead

If voice input doesn't work, you can always type your questions! Voice is optional.

## Testing Your Microphone

1. Open Settings in Jurisly
2. Enable "Voice Settings"
3. Click the microphone button in the message input
4. Say something
5. Your speech should appear as text

## Still Having Issues?

Try these:
1. Restart your browser
2. Clear browser cache
3. Update your browser to the latest version
4. Try a different browser
5. Check if microphone works in other apps (Zoom, Google Meet, etc.)

## Production Deployment Notes

For production, consider:
- Using a cloud speech-to-text service (Google Cloud Speech, Azure Speech)
- These are more reliable and work across all browsers
- Better accuracy and language support
- No HTTPS requirement for API calls
