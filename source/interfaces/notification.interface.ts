// Enum of notification categories
export enum INotificationCategory {
  TRANSACTION = 'transaction',
  PAYMENT = 'payment',
  ACCESS = 'access',
  USER = 'user',
}

// Enum of notification statuses
export enum INotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

// Create an interface to represent Notification data structure
export interface INotification {
    // Field for Notification ID
    id: string;
    // Field for Notification name
    title: string;
    userId: string;
    notificationCategory: string;
    content: string;
    actionLink: string;
    status: string;
  }

  // Create an interface which combines Document and IOtp interface
  export interface INotificationDocument extends INotification {}
