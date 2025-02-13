import fetch from "node-fetch";
import fs from "fs";
import gplay from "google-play-scraper";

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1325773765036216460/uhxD0DspNGEDihk6BHMaaszVmG2C9e_0JEBfocRS8CimDXg0VhkfAfx7u1zKo5gekfci";
const VERSION_FILE = "version.json";
const WINDOWS_API = "https://clientsettings.roblox.com/v2/client-version/WindowsPlayer";

async function getAndroidVersion() {
    try {
        const app = await gplay.app({ appId: "com.roblox.client" });
        return app.version || "Not found";
    } catch (error) {
        console.error("Error fetching Android version:", error);
        return "Error";
    }
}

async function getIOSVersion() {
    try {
        const response = await fetch("https://itunes.apple.com/lookup?id=431946152&country=US");
        const data = await response.json();
        return data.results.length > 0 ? data.results[0].version : "Not found";
    } catch (error) {
        console.error("Error fetching iOS version:", error);
        return "Error";
    }
}

async function getWindowsVersion() {
    try {
        const response = await fetch(WINDOWS_API);
        const data = await response.json();
        return data.clientVersionUpload || "Not found";
    } catch (error) {
        console.error("Error fetching Windows version:", error);
        return "Error";
    }
}

async function sendToDiscord(platform, version) {
    const embed = {
        title: `\ud83d\udd14 Roblox ${platform} Version Updated \ud83d\udd14`,
        description: `### \ud83d\udcda The Roblox version has been updated to ${version}\n\n\u26a0\ufe0f If the executor doesn't work, please wait for it to be patched from the executor.`,
        color: 65535
    };

    const payload = { embeds: [embed] };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        console.log(`✅ Sent Roblox ${platform} update notification to Discord!`);
    } catch (error) {
        console.error(`❌ Error sending webhook for ${platform}:`, error);
    }
}

async function checkRobloxUpdates() {
    const versions = {
        Windows: await getWindowsVersion(),
        Android: await getAndroidVersion(),
        iOS: await getIOSVersion()
    };

    let oldVersions = {};

    if (fs.existsSync(VERSION_FILE)) {
        oldVersions = JSON.parse(fs.readFileSync(VERSION_FILE, "utf8"));
    }

    if (oldVersions.Windows !== versions.Windows) {
        await sendToDiscord("Windows", versions.Windows);
    }
    if (oldVersions.Android !== versions.Android) {
        await sendToDiscord("Android", versions.Android);
    }
    if (oldVersions.iOS !== versions.iOS) {
        await sendToDiscord("iOS", versions.iOS);
    }

    if (
        oldVersions.Windows !== versions.Windows ||
        oldVersions.Android !== versions.Android ||
        oldVersions.iOS !== versions.iOS
    ) {
        fs.writeFileSync(VERSION_FILE, JSON.stringify(versions, null, 2));
    } else {
        console.log("⚡ No version changes detected, skipping Discord notification.");
    }
}

setInterval(checkRobloxUpdates, 5 * 60 * 1000);

checkRobloxUpdates();
