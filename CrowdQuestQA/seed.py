import requests

API = "http://127.0.0.1:8000"

# ── Dummy users ───────────────────────────────────────────────────────────────
DUMMY_USERS = [
    {"username": "Kavindu Perera",        "email": "kavindu.perera@gmail.com",      "password": "seed1234"},
    {"username": "Dilshan Fernando",      "email": "dilshan.fernando@gmail.com",    "password": "seed1234"},
    {"username": "Thisara Silva",         "email": "thisara.silva@gmail.com",       "password": "seed1234"},
    {"username": "Sachith Jayawardena",   "email": "sachith.jayawardena@gmail.com", "password": "seed1234"},
    {"username": "Nuwan Bandara",         "email": "nuwan.bandara@gmail.com",       "password": "seed1234"},
    {"username": "Malisha Dissanayake",   "email": "malisha.dissanayake@gmail.com", "password": "seed1234"},
    {"username": "Sandun Kumara",         "email": "sandun.kumara@gmail.com",       "password": "seed1234"},
]

# ── Register or look up dummy users ──────────────────────────────────────────
user_ids = {}
for u in DUMMY_USERS:
    r = requests.post(f"{API}/users/register", json=u)
    if r.ok:
        uid = r.json()["id"]
        user_ids[u["username"]] = uid
        print(f"  Created {u['username']} (id={uid})")
    else:
        login = requests.post(f"{API}/users/login", json={"email": u["email"], "password": u["password"]})
        if login.ok:
            uid = login.json()["user"]["id"]
            user_ids[u["username"]] = uid
            print(f"  Found {u['username']} (id={uid})")
        else:
            print(f"  Could not resolve {u['username']}")

def submit(user_id, report, status, points=None, quality=None):
    r = requests.post(f"{API}/reports?user_id={user_id}", json=report)
    if not r.ok:
        print(f"    Failed to submit: {r.json()}")
        return
    rid = r.json()["id"]
    patch = {"status": status}
    if points:   patch["points_awarded"] = points
    if quality:  patch["quality_score"]  = quality
    requests.patch(f"{API}/reports/{rid}/status", json=patch)
    print(f"    Report #{rid} '{report['title'][:50]}' => {status} (+{points or 0} pts)")

# ── Dami's 3 submissions (user_id=1) ─────────────────────────────────────────
print("\nDami's submissions:")
DAMI_ID = 1

submit(DAMI_ID, {
    "title": "Markdown table alignment breaks when a cell contains an emoji",
    "description": "When any cell in a markdown table contains an emoji character, the column alignment shifts and the table renders incorrectly in the preview pane. The raw markdown is valid and renders correctly on other platforms such as GitLab and VS Code.",
    "steps_to_reproduce": "1. Open a new GitHub Issue or Pull Request\n2. Add a markdown table with an emoji in any cell\n3. Switch to the Preview tab\n4. Table columns are misaligned — emoji cell causes the whole row to shift",
    "severity": "medium",
    "website_name": "GitHub",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "github.com",
}, status="accepted", points=50, quality=8.5)

submit(DAMI_ID, {
    "title": "Shuffle mode repeatedly plays the same 5 tracks from large playlists",
    "description": "When shuffle is enabled on a playlist with more than 100 songs, only a small subset of around 5 tracks are played in rotation. Other tracks are never selected. The issue persists after toggling shuffle off and on again.",
    "steps_to_reproduce": "1. Open any playlist with 100+ songs\n2. Enable Shuffle mode\n3. Play through 20+ tracks\n4. The same 5 tracks repeat — remaining tracks are never selected",
    "severity": "medium",
    "website_name": "Spotify",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "1.2.31",
}, status="accepted", points=50, quality=7.5)

submit(DAMI_ID, {
    "title": "Inline code blocks lose syntax highlighting after page switch",
    "description": "Code blocks in Notion pages lose their syntax highlighting when navigating away from the page and returning. The highlight state is not preserved between navigation events, requiring users to manually re-select the language on each visit.",
    "steps_to_reproduce": "1. Open a Notion page containing a code block with syntax highlighting\n2. Navigate to a different page using the sidebar\n3. Navigate back to the original page\n4. Observe the code block — language selection resets to 'Plain text'",
    "severity": "low",
    "website_name": "Notion",
    "environment": "Web",
    "device_browser": "Firefox 125",
    "version": "notion.so",
}, status="under_review")

# ── Other users' submissions ──────────────────────────────────────────────────
print("\nOther users' submissions:")

# Kavindu Perera — 3 accepted = 150 pts (rank 1)
submit(user_ids.get("Kavindu Perera"), {
    "title": "Checkout page crashes when cart contains more than 10 items",
    "description": "An unhandled exception is thrown when proceeding to checkout with more than 10 items in the cart. The page goes blank and all cart data is lost on recovery. Reproducible on both guest and signed-in accounts.",
    "steps_to_reproduce": "1. Add 11 or more items to the cart\n2. Click 'Proceed to Checkout'\n3. Page goes blank with no error message\n4. Navigating back shows an empty cart",
    "severity": "critical",
    "website_name": "Amazon",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "amazon.com",
}, status="accepted", points=50, quality=9.5)
submit(user_ids.get("Kavindu Perera"), {
    "title": "Saved payment method disappears after session timeout",
    "description": "After a user's shopping session times out and they log back in, saved payment methods previously stored in their account are no longer displayed. Revisiting account settings and refreshing confirms the cards are gone. The issue correlates with extended session timeouts.",
    "steps_to_reproduce": "1. Add a credit card to your Amazon account\n2. Leave the browser idle until the session times out\n3. Log back in and go to Account > Payment Methods\n4. Previously saved cards are no longer listed",
    "severity": "high",
    "website_name": "Amazon",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "amazon.com",
}, status="accepted", points=50, quality=8.8)
submit(user_ids.get("Kavindu Perera"), {
    "title": "Product images fail to load on slow 3G connections",
    "description": "When browsing product listings on a throttled 3G mobile connection, product thumbnail images fail to load and display as broken image icons. Switching to WiFi resolves the issue, suggesting a missing fallback or timeout threshold for slow connections.",
    "steps_to_reproduce": "1. Throttle browser network to 'Slow 3G'\n2. Navigate to any product category page on Amazon\n3. Product thumbnails show broken image icons\n4. Images do not load even after an extended wait",
    "severity": "medium",
    "website_name": "Amazon",
    "environment": "Web",
    "device_browser": "Chrome 124 (Mobile)",
    "version": "amazon.com",
}, status="accepted", points=50, quality=8.2)

# Dilshan Fernando — 2 accepted + 1 under_review = 120 pts (rank 2)
submit(user_ids.get("Dilshan Fernando"), {
    "title": "Sign-in verification code emails not delivered to Outlook addresses",
    "description": "Users with Microsoft Outlook accounts never receive the two-factor authentication email when signing in from a new device. The issue is isolated to Outlook — Gmail and Yahoo addresses receive the code within seconds. No bounce is reported.",
    "steps_to_reproduce": "1. Sign out of your Google account\n2. Attempt to sign back in on a new device\n3. Enter an Outlook email address when prompted for verification\n4. Verification code email is never received — check inbox and spam",
    "severity": "high",
    "website_name": "Google",
    "environment": "Web",
    "device_browser": "Edge 124",
    "version": "accounts.google.com",
}, status="accepted", points=50, quality=9.0)
submit(user_ids.get("Dilshan Fernando"), {
    "title": "Calendar event invites display wrong local time for recipients in other timezones",
    "description": "When a Google Calendar event is created with guests in different time zones, the invitation email displays the wrong local time. A 10:00 AM GMT event shows as 10:00 AM to all recipients regardless of their actual timezone.",
    "steps_to_reproduce": "1. Create a Google Calendar event at 10:00 AM GMT\n2. Invite an attendee in a different timezone (e.g. UTC+5:30)\n3. The attendee receives an email showing 10:00 AM instead of their local equivalent\n4. The calendar entry itself shows the correct local time — only the email is wrong",
    "severity": "high",
    "website_name": "Google",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "calendar.google.com",
}, status="accepted", points=50, quality=8.5)
submit(user_ids.get("Dilshan Fernando"), {
    "title": "Search autocomplete suggestions persist after clearing the input field",
    "description": "After typing a query in Google Search and then clearing the input field, the autocomplete dropdown remains visible. Clicking elsewhere dismisses it, but the suggestions should disappear as soon as the input is empty.",
    "steps_to_reproduce": "1. Click the Google Search bar\n2. Type any query — autocomplete suggestions appear\n3. Clear the input field entirely\n4. The suggestion dropdown remains visible on screen",
    "severity": "low",
    "website_name": "Google",
    "environment": "Web",
    "device_browser": "Firefox 125",
    "version": "google.com",
}, status="under_review", points=20, quality=6.0)

# Thisara Silva — 2 accepted = 100 pts (rank 3)
submit(user_ids.get("Thisara Silva"), {
    "title": "Search results show duplicate videos when navigating to page 2",
    "description": "When paginating search results, the first three videos on page 2 are exact duplicates of the last three videos on page 1. This inflates the result count and makes it difficult to find new content.",
    "steps_to_reproduce": "1. Search for any popular keyword on YouTube\n2. Scroll to the bottom of page 1\n3. Click 'Next' or scroll to page 2\n4. The first 3 results on page 2 are identical to the last 3 on page 1",
    "severity": "medium",
    "website_name": "YouTube",
    "environment": "Web",
    "device_browser": "Safari 17",
    "version": "youtube.com",
}, status="accepted", points=50, quality=8.0)
submit(user_ids.get("Thisara Silva"), {
    "title": "Video quality drops to 144p mid-stream with no user interaction",
    "description": "While watching a video at 1080p, playback quality unexpectedly drops to 144p after approximately 5-10 minutes without any network change or user action. The quality indicator still shows 1080p as selected, but the video remains blurry until the user manually reselects the quality.",
    "steps_to_reproduce": "1. Open any YouTube video and manually set quality to 1080p\n2. Watch continuously for 5-10 minutes without interacting\n3. Video quality drops to 144p\n4. Settings still show 1080p as the selected option",
    "severity": "medium",
    "website_name": "YouTube",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "youtube.com",
}, status="accepted", points=50, quality=7.5)

# Sachith Jayawardena — 1 accepted + 1 under_review = 70 pts
submit(user_ids.get("Sachith Jayawardena"), {
    "title": "File uploads over 5 MB silently fail with no error feedback",
    "description": "Uploading a file larger than 5 MB in a Slack message shows a brief loading indicator followed by a success state, but the file never appears in the conversation. No error message is displayed, making the failure invisible to the user.",
    "steps_to_reproduce": "1. Open any Slack channel or direct message\n2. Click the attachment icon\n3. Select a file larger than 5 MB\n4. A loading indicator appears then disappears\n5. No file is posted and no error is shown",
    "severity": "high",
    "website_name": "Slack",
    "environment": "Windows",
    "device_browser": "Slack Desktop 4.35",
    "version": "4.35.131",
}, status="accepted", points=50, quality=7.0)
submit(user_ids.get("Sachith Jayawardena"), {
    "title": "Message timestamps show UTC instead of local timezone in Slack Desktop",
    "description": "Message timestamps in Slack Desktop consistently display in UTC regardless of the system timezone setting. Switching timezone in system preferences has no effect until the application is fully restarted.",
    "steps_to_reproduce": "1. Open Slack Desktop on Windows with a non-UTC system timezone\n2. Observe any message timestamp in a channel\n3. Compare the displayed time with the actual local time\n4. The timestamp reflects UTC, not local time",
    "severity": "low",
    "website_name": "Slack",
    "environment": "Windows",
    "device_browser": "Slack Desktop 4.35",
    "version": "4.35.131",
}, status="under_review", points=20, quality=5.5)

# Nuwan Bandara — 1 accepted = 50 pts
submit(user_ids.get("Nuwan Bandara"), {
    "title": "Dark mode preference resets to light mode after every page refresh",
    "description": "Enabling dark mode on X (Twitter) and refreshing the page causes the interface to revert to light mode. The preference is not persisted between sessions, forcing users to re-enable it each visit.",
    "steps_to_reproduce": "1. Go to Settings and enable Dark Mode\n2. Return to the home timeline\n3. Refresh the page\n4. Interface reverts to light mode",
    "severity": "low",
    "website_name": "X (Twitter)",
    "environment": "Web",
    "device_browser": "Chrome 123",
    "version": "x.com",
}, status="accepted", points=50, quality=7.0)

# Malisha Dissanayake — 1 under_review = 20 pts
submit(user_ids.get("Malisha Dissanayake"), {
    "title": "Profile avatar does not update in the header after saving a new photo",
    "description": "After uploading a new profile picture on Reddit and clicking Save, the old avatar continues to display in the top navigation bar. A hard refresh is required to see the updated photo, and the old image still shows in comments made before the refresh.",
    "steps_to_reproduce": "1. Go to Reddit profile settings\n2. Upload a new profile picture\n3. Click Save\n4. The old avatar is still shown in the navbar and on existing comments",
    "severity": "low",
    "website_name": "Reddit",
    "environment": "Web",
    "device_browser": "Firefox 124",
    "version": "reddit.com",
}, status="under_review", points=20, quality=5.0)

# Sandun Kumara — 1 pending = 0 pts
submit(user_ids.get("Sandun Kumara"), {
    "title": "Server member list does not refresh in real time when users join a voice channel",
    "description": "When a user joins a voice channel in Discord, the member list panel does not update for other members in the server until the page is manually refreshed. Expected behaviour is for the list to update within 1-2 seconds.",
    "steps_to_reproduce": "1. Open Discord in two browser tabs with different accounts in the same server\n2. Have Account B join a voice channel\n3. Observe the member list in Account A's tab\n4. Member list does not reflect Account B joining until page refresh",
    "severity": "medium",
    "website_name": "Discord",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "discord.com",
}, status="pending")

print("\nDone! Database seeded with real-world bug reports.")
