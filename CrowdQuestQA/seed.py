import requests

API = "http://127.0.0.1:8000"

# ── Dummy users ───────────────────────────────────────────────────────────────
DUMMY_USERS = [
    {"username": "TechNinja",   "email": "techninja@gmail.com",   "password": "seed1234"},
    {"username": "BugSlayer",   "email": "bugslayer@gmail.com",   "password": "seed1234"},
    {"username": "CodeHunter",  "email": "codehunter@gmail.com",  "password": "seed1234"},
    {"username": "TestMaster",  "email": "testmaster@gmail.com",  "password": "seed1234"},
    {"username": "QAHero",      "email": "qahero@gmail.com",      "password": "seed1234"},
    {"username": "BugFinder",   "email": "bugfinder@gmail.com",   "password": "seed1234"},
    {"username": "DebugPro",    "email": "debugpro@gmail.com",    "password": "seed1234"},
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
        # Already exists — log in to get ID
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
    "title": "Login button unresponsive on Safari mobile",
    "description": "The login button does not respond to tap events on Safari iOS 17. Consistent across iPhone 13 and iPhone 15. Clearing cookies and cache does not resolve the issue.",
    "steps_to_reproduce": "1. Open Safari on iOS 17\n2. Navigate to the login page\n3. Enter valid credentials\n4. Tap the Login button\n5. No response — button appears frozen",
    "severity": "high",
    "environment": "iOS",
    "device_browser": "Safari iOS 17",
    "version": "v2.1.0",
}, status="accepted", points=50, quality=8.5)

submit(DAMI_ID, {
    "title": "Dashboard XP bar displays 0% after earning points",
    "description": "The XP progress bar on the dashboard remains at 0% even after a bug report is accepted and points are awarded. The numeric points counter updates correctly but the visual bar does not reflect the change.",
    "steps_to_reproduce": "1. Log in to the platform\n2. Submit a bug report\n3. Wait for the report to be accepted\n4. Navigate to dashboard\n5. XP bar still shows 0% progress",
    "severity": "medium",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "v2.1.0",
}, status="accepted", points=50, quality=7.5)

submit(DAMI_ID, {
    "title": "Notification badge count persists after reading all notifications",
    "description": "After opening and reading all notifications, the red badge counter on the bell icon does not reset to zero. The badge remains visible until a page reload.",
    "steps_to_reproduce": "1. Receive one or more notifications\n2. Observe the badge count on the bell icon\n3. Click the bell icon and read all notifications\n4. Badge count does not reset",
    "severity": "low",
    "environment": "Web",
    "device_browser": "Firefox 125",
    "version": "v2.0.5",
}, status="under_review")

# ── Other users' submissions ──────────────────────────────────────────────────
print("\nOther users' submissions:")

# TechNinja — 150 pts (rank 1)
submit(user_ids.get("TechNinja"), {
    "title": "App crashes on checkout with more than 10 items in cart",
    "description": "An unhandled exception is thrown when the user attempts to checkout with more than 10 items in the cart. The app displays a blank white screen and all cart data is lost.",
    "steps_to_reproduce": "1. Add 11 or more items to the cart\n2. Proceed to checkout\n3. App crashes with a white screen\n4. Cart is emptied on recovery",
    "severity": "critical",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "v3.0.0",
}, status="accepted", points=150, quality=9.5)

# BugSlayer — 120 pts (rank 2)
submit(user_ids.get("BugSlayer"), {
    "title": "Password reset email not delivered to Gmail addresses",
    "description": "Users with Gmail accounts never receive the password reset email. The issue is isolated to Gmail — other providers such as Outlook and Yahoo work correctly. No bounce or error is reported server-side.",
    "steps_to_reproduce": "1. Click Forgot Password on the login page\n2. Enter a Gmail address\n3. Submit the form\n4. Check Gmail inbox and spam — email never arrives",
    "severity": "high",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "v3.0.0",
}, status="accepted", points=120, quality=9.0)

# CodeHunter — 100 pts (rank 3)
submit(user_ids.get("CodeHunter"), {
    "title": "Search results contain duplicate entries on page 2",
    "description": "When paginating search results, the first three entries on page 2 are exact duplicates of the last three entries on page 1. This affects the displayed result count and user experience.",
    "steps_to_reproduce": "1. Perform any keyword search\n2. Navigate to page 2 of results\n3. First 3 results duplicate last 3 results from page 1",
    "severity": "medium",
    "environment": "Web",
    "device_browser": "Edge 124",
    "version": "v2.9.1",
}, status="accepted", points=100, quality=8.0)

# TestMaster — 60 pts (rank 5, below Dami)
submit(user_ids.get("TestMaster"), {
    "title": "File upload silently fails for files larger than 5MB",
    "description": "Uploading a file over 5MB shows a success message but the file is never saved. No error is shown to the user, making the issue difficult to detect.",
    "steps_to_reproduce": "1. Navigate to the file upload section\n2. Select any file larger than 5MB\n3. Click Upload\n4. A success message appears but the file is missing",
    "severity": "high",
    "environment": "Windows",
    "device_browser": "Chrome 124",
    "version": "v2.7.0",
}, status="accepted", points=60, quality=7.0)

# QAHero — 40 pts (rank 6)
submit(user_ids.get("QAHero"), {
    "title": "Dark mode preference resets to light mode on page refresh",
    "description": "Enabling dark mode and refreshing the page causes the theme to revert to light mode. The user preference is not being persisted in localStorage between sessions.",
    "steps_to_reproduce": "1. Enable dark mode in settings\n2. Refresh the page\n3. Theme reverts to light mode",
    "severity": "low",
    "environment": "Web",
    "device_browser": "Chrome 123",
    "version": "v2.8.0",
}, status="accepted", points=40, quality=7.0)

# BugFinder — 30 pts (rank 7)
submit(user_ids.get("BugFinder"), {
    "title": "Profile avatar not updated after saving changes",
    "description": "After uploading a new profile picture and saving, the old avatar continues to display in the header and sidebar. A hard refresh is required to see the updated avatar.",
    "steps_to_reproduce": "1. Go to Profile and click Edit Profile\n2. Upload a new profile picture\n3. Click Save Changes\n4. Old avatar is still shown in the navbar",
    "severity": "low",
    "environment": "Web",
    "device_browser": "Firefox 124",
    "version": "v2.5.0",
}, status="under_review", points=30)

# DebugPro — pending, 0 pts (rank last)
submit(user_ids.get("DebugPro"), {
    "title": "Leaderboard does not update in real time after point award",
    "description": "When a bug report is accepted and points are awarded, the leaderboard ranking does not reflect the change until the page is manually refreshed. Expected real-time or near-real-time updates.",
    "steps_to_reproduce": "1. Have two browser windows open: one on Leaderboard, one on admin panel\n2. Accept a bug report in the admin panel\n3. Observe the leaderboard — ranking not updated",
    "severity": "medium",
    "environment": "Web",
    "device_browser": "Chrome 124",
    "version": "v3.0.0",
}, status="pending")

print("\nDone! Database seeded with 10 bug reports.")
