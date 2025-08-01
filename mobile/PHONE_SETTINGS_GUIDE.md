# Phone Settings Guide for Critical Alerts

For the app to provide continuous beeping alerts (like clock alarms) when your phone screen is off, you need to configure specific phone settings. This ensures critical log notifications wake your phone and beep continuously until you stop them.

## Required Phone Settings

### Android Settings

#### 1. App-Specific Settings
**Path:** Settings → Apps → Starthbourne Partners → Permissions

**Required Permissions:**
- ✅ **Display over other apps** - Allows full-screen critical alerts
- ✅ **Modify system settings** - Controls alarm volume and screen wake
- ✅ **Notifications** - Enable all notification types
- ✅ **Device admin apps** - For screen wake functionality

#### 2. Battery Optimization
**Path:** Settings → Battery → Battery Optimization

**Actions:**
- Find "Starthbourne Partners" in the list
- Select "Don't optimize" or "No restrictions"
- This prevents Android from limiting background alarm functionality

#### 3. Do Not Disturb Settings
**Path:** Settings → Sound → Do Not Disturb → Apps

**Actions:**
- Add "Starthbourne Partners" to priority apps
- Allow notifications to break through Do Not Disturb
- Enable "Override Do Not Disturb" for the app

#### 4. Alarm & Timer Settings
**Path:** Settings → Sound → Alarm volume

**Actions:**
- Set alarm volume to maximum
- Ensure "Use volume buttons for media" is disabled
- Enable "Vibrate for alarms"

#### 5. Lock Screen Settings
**Path:** Settings → Security → Lock screen

**Actions:**
- Enable "Show all notification content"
- Allow "Wake screen for notifications"
- Disable "Hide sensitive content"

### iOS Settings

#### 1. Notification Settings
**Path:** Settings → Notifications → Starthbourne Partners

**Required Settings:**
- ✅ **Allow Notifications** - ON
- ✅ **Critical Alerts** - ON (if available)
- ✅ **Sounds** - ON
- ✅ **Lock Screen** - ON
- ✅ **Notification Center** - ON
- ✅ **Banners** - Set to "Persistent"

#### 2. Focus/Do Not Disturb
**Path:** Settings → Focus → Do Not Disturb

**Actions:**
- Add "Starthbourne Partners" to allowed apps
- Enable "Time Sensitive Notifications"
- Allow "Critical Alerts" to break through

#### 3. Screen Time Settings
**Path:** Settings → Screen Time → App Limits

**Actions:**
- Remove any app limits for "Starthbourne Partners"
- Add to "Always Allowed" list

#### 4. Sounds & Haptics
**Path:** Settings → Sounds & Haptics

**Actions:**
- Set "Ringer and Alerts" volume to maximum
- Enable "Change with Buttons" for easier control
- Test notification sounds work

## Phone Brand-Specific Settings

### Samsung Galaxy
**Additional Settings:**
- **Smart Manager → Battery → App Power Management**
  - Add app to "Never sleeping apps"
- **Advanced Features → Motions and Gestures**
  - Enable "Lift to wake" for faster response

### OnePlus/Oxygen OS
**Additional Settings:**
- **Battery → Battery Optimization**
  - Set to "Don't optimize"
- **Privacy → Special App Access → Display over other apps**
  - Enable for Starthbourne Partners

### Xiaomi/MIUI
**Additional Settings:**
- **Security → Manage Apps → Starthbourne Partners**
  - Enable "Auto-start"
  - Enable "Display pop-up windows while running in background"
- **Additional Settings → Privacy → Special App Access**
  - Enable all permissions

### Huawei/EMUI
**Additional Settings:**
- **Phone Manager → Protected Apps**
  - Add Starthbourne Partners to protected apps
- **Settings → Apps & Notifications → Special Access**
  - Enable "Display over other apps"

## Testing the Critical Alert System

### Test Procedure:
1. **Configure all settings above**
2. **Lock your phone and wait 30 seconds**
3. **Send a test beep log via API:**
   ```bash
   curl -X POST [your-api-url]/api/logs \
     -H "Content-Type: application/json" \
     -d '{"message": "TEST CRITICAL ALERT", "beepType": "beep", "source": "test"}'
   ```
4. **Expected behavior:**
   - Phone screen turns on immediately
   - Full-screen alert appears
   - Continuous alarm sound plays
   - Vibration continues
   - Alert persists until manually stopped

### If Alerts Don't Work:
1. **Check all permissions again** - Android often resets them
2. **Disable power saving modes** temporarily
3. **Test with phone plugged in** to rule out battery restrictions
4. **Try different Do Not Disturb settings**
5. **Restart phone** after changing settings

## How It Works Technically

### Normal Notifications vs Critical Alerts

**Normal Push Notifications:**
- Single beep/vibration
- May not wake screen when off
- Respects Do Not Disturb settings
- Limited by OS power management

**Critical Alert System:**
- **Wake Lock:** Keeps phone responsive
- **System Alert Window:** Shows over lock screen
- **Alarm Category:** Uses alarm priority (bypasses DND)
- **Exact Alarm Scheduling:** Repeats every 30 seconds
- **Full Screen Intent:** Takes over entire screen
- **Persistent Notification:** Cannot be swiped away easily

### Why These Permissions Are Needed

- **Display over other apps:** Shows urgent alerts above lock screen
- **System alert window:** Creates full-screen takeover like incoming calls
- **Exact alarm scheduling:** Ensures reliable timing even in deep sleep
- **Modify audio settings:** Overrides volume restrictions for critical alerts
- **Wake lock:** Prevents phone from entering deep sleep during alerts

## Privacy & Security Notes

**What the app CAN do with these permissions:**
- Wake your phone for critical log alerts
- Show urgent notifications over lock screen
- Play alarm sounds that bypass Do Not Disturb
- Keep phone responsive during active alerts

**What the app CANNOT do:**
- Access other apps or personal data
- Make calls or send messages
- Change permanent phone settings
- Access files, contacts, or location
- Work when you manually stop alerts

All critical alert functionality is only used for log monitoring purposes and can be stopped instantly by opening the app and tapping "Stop Urgent Alert".

## Troubleshooting Common Issues

### "Permissions keep getting reset"
- Some Android versions automatically reset permissions
- Go to **Settings → Privacy → Permission manager → Special app access**
- Set each permission to "Allow" instead of "Ask every time"

### "Screen doesn't turn on"
- Enable **Settings → Display → Ambient display**
- Check **Settings → Security → Smart Lock** isn't interfering
- Ensure phone isn't in extreme power saving mode

### "No sound during alerts"
- Check **Settings → Sound → Separate app sound**
- Ensure media and alarm volumes are up
- Test system alarm app works first

### "Alerts stop after a few minutes"
- Add app to battery optimization whitelist
- Disable **Settings → Device care → Auto optimization**
- Check **Settings → Apps → Special access → Optimize battery usage**

Remember: These settings give the app the same power as your built-in Clock/Alarm app to ensure critical monitoring alerts can wake you when needed.