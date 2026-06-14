# NashFit notifications stage 6

Adds:
- user notification center `/account/notifications`;
- notification bell in the header;
- user activity feed in account page;
- admin event feed on admin dashboard;
- backend tables `user_notifications` and `activity_events`;
- activity events for bookings, payments, orders, article moderation and program progress.

The patch does not modify `.env`, uploaded files or existing data.
