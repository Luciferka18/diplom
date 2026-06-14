Hotfix for /account dashboard booking loading.

What it does:
- fixes the dashboard request logic so one failed section does not break the whole account page;
- tries compatible booking endpoints;
- adds a safe migration for missing booking columns if the local database is partially migrated.

Install:
1. Extract into D:\diplom
2. Run nashfit_account_bookings_hotfix\APPLY_ACCOUNT_BOOKINGS_HOTFIX.bat
3. Restart backend and frontend
4. Open /account and refresh with Ctrl+F5
