# Step 2: Enable User Profiles

You requested the "cross-device memory" feature. This requires one more database table to store user details like your QR code permanently attached to your account.

## Instructions

1.  **Go to Supabase SQL Editor** (same as before).
2.  **New Query**.
3.  **Copy & Paste** the content of `PROFILES_SETUP.sql` (created in your project folder).
4.  **Run**.

## What this does
*   Creates a `profiles` table.
*   **Automatic Magic:** Whenever a new user signs up (via Google or Email), it *automatically* creates a profile for them.
*   Allows the app to save your UPI ID and QR Code to the cloud, so if you login from a different phone, it's still there.
