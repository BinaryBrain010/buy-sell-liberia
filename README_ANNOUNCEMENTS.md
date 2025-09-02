# Announcements System

## Overview

The announcements system allows admins to broadcast site-wide messages to users through multiple channels:

- **Popup**: Toast notifications shown when users log in
- **Banner**: Banner notifications displayed on user dashboard
- **Chat**: Direct messages sent to user chats from admin
- **Email**: Email notifications (implementation needed)

## Key Features

### 1. Message Queue System
- Messages are queued for users who are logged out
- When users log in, they receive queued messages as toast notifications
- Messages expire after 30 days by default
- Supports different message types and priorities

### 2. Multi-Channel Broadcasting
- **Chat Messages**: Sent immediately to user chats AND queued for toast notifications
- **Popup/Banner**: Queued for toast notifications when users log in
- **Email**: Placeholder for email service integration

### 3. Target Audience Control
- **All Users**: Broadcast to all active users
- **Buyers**: Users who have made purchases
- **Sellers**: Users who have listed products
- **Premium**: Users with premium status
- **Specific Users**: Manually selected users

## API Endpoints

### Admin Endpoints

#### Create Announcement
```
POST /api/admin/announcements
Authorization: Bearer <admin_token>

{
  "title": "System Maintenance",
  "content": "The system will be down for maintenance...",
  "type": "popup", // popup, banner, chat, email
  "priority": "high", // low, medium, high, urgent
  "targetAudience": "all", // all, buyers, sellers, premium, specific
  "specificUsers": [], // array of user IDs if targetAudience is "specific"
  "scheduleTime": "2024-01-01T10:00:00Z", // optional
  "expiryTime": "2024-01-07T10:00:00Z", // optional
  "displaySettings": {
    "showOnDashboard": true,
    "showOnHomepage": false,
    "dismissible": true,
    "autoCloseAfter": 5000 // milliseconds, 0 for no auto-close
  },
  "sendImmediately": true // optional, default false
}
```

#### Get All Announcements
```
GET /api/admin/announcements?page=1&limit=10&type=popup&priority=high
Authorization: Bearer <admin_token>
```

#### Get Specific Announcement
```
GET /api/admin/announcements/{id}
Authorization: Bearer <admin_token>
```

#### Update Announcement
```
PUT /api/admin/announcements/{id}
Authorization: Bearer <admin_token>

{
  "title": "Updated title",
  "isActive": false
}
```

#### Delete Announcement
```
DELETE /api/admin/announcements/{id}
Authorization: Bearer <admin_token>
```

#### Broadcast Announcement
```
POST /api/admin/announcements/{id}/broadcast
Authorization: Bearer <admin_token>

{
  "force": false // set to true to re-broadcast already sent announcements
}
```

#### Get Statistics
```
GET /api/admin/announcements/stats?timeRange=30
Authorization: Bearer <admin_token>
```

#### Cleanup Expired Messages
```
POST /api/admin/announcements/cleanup
Authorization: Bearer <admin_token>

{
  "cleanupExpiredMessages": true,
  "cleanupOldInteractions": true,
  "oldInteractionDays": 90
}
```

### User Endpoints

#### Get Active Announcements
```
GET /api/announcements?type=popup&includeDismissed=false
Authorization: Bearer <user_token> // optional for public announcements
```

#### Get Queued Messages (Toast Notifications)
```
GET /api/user/messages/queued?markAsDelivered=true&type=toast
Authorization: Bearer <user_token>
```

#### Mark Messages as Delivered/Read
```
POST /api/user/messages/queued
Authorization: Bearer <user_token>

{
  "messageIds": ["msg1", "msg2"],
  "action": "mark_delivered" // or "delete"
}
```

#### Record Interaction
```
POST /api/announcements/{id}/interact
Authorization: Bearer <user_token>

{
  "action": "viewed", // viewed, clicked, dismissed
  "deviceInfo": {
    "userAgent": "...",
    "platform": "web"
  }
}
```

## Database Models

### Announcement
- Basic announcement data (title, content, type, etc.)
- Target audience settings
- Display preferences
- Statistics tracking

### AnnouncementInteraction
- User interactions with announcements
- Tracks views, clicks, dismissals
- Device information for analytics

### UserMessageQueue
- Queued messages for users
- Delivery status tracking
- Automatic expiration

## Usage Examples

### 1. Create and Send Immediate Chat Announcement
```javascript
// Create announcement
const response = await fetch('/api/admin/announcements', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Welcome Message',
    content: 'Welcome to our platform!',
    type: 'chat',
    targetAudience: 'all',
    sendImmediately: true
  })
});

// This will:
// 1. Create the announcement
// 2. Send messages to all user chats immediately
// 3. Queue messages for users who are logged out
```

### 2. Schedule Popup Notification
```javascript
const response = await fetch('/api/admin/announcements', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Maintenance Notice',
    content: 'Scheduled maintenance tomorrow at 2 AM',
    type: 'popup',
    scheduleTime: '2024-01-01T02:00:00Z',
    expiryTime: '2024-01-02T02:00:00Z'
  })
});

// Broadcast when ready
await fetch(`/api/admin/announcements/${announcementId}/broadcast`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + adminToken }
});
```

### 3. Get Toast Notifications for User
```javascript
// When user logs in, fetch queued messages
const response = await fetch('/api/user/messages/queued?type=toast', {
  headers: { 'Authorization': 'Bearer ' + userToken }
});

const { messages } = await response.json();

// Show toast notifications
messages.forEach(message => {
  showToast(message.title, message.content, message.priority);
});
```

## Implementation Notes

### Frontend Integration

1. **Login Flow**: Check for queued messages after successful login
2. **Toast System**: Display queued messages as toast notifications
3. **Chat Integration**: Messages appear in chat interface
4. **Interaction Tracking**: Record user interactions for analytics

### Admin Dashboard

1. **Create Form**: Simple form to create announcements
2. **Management Table**: List with filters and actions
3. **Statistics Dashboard**: Analytics and performance metrics
4. **Broadcast Controls**: Manual broadcast triggers

### Performance Considerations

1. **Message Queuing**: Efficient for handling offline users
2. **Indexing**: Proper database indexes for fast queries
3. **Cleanup**: Regular cleanup of expired messages
4. **Caching**: Consider caching active announcements

## Security Features

- Admin authentication required for all admin endpoints
- User authentication for personal message queues
- Input validation and sanitization
- Rate limiting (should be implemented at gateway level)

## Future Enhancements

1. **Email Integration**: Implement actual email sending
2. **Push Notifications**: Mobile app integration
3. **Rich Content**: Support for images and formatting
4. **A/B Testing**: Different message variations
5. **Advanced Targeting**: Location-based, behavior-based targeting
6. **Webhook Integration**: External system notifications
