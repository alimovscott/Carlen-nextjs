import { NotificationType, NotificationStatus, NotificationGroup } from '../../enums/notification.enum';
import { Direction } from '../../enums/common.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: string;
	receiverId: string;
	productId?: string;
	articleId?: string;
	createdAt: Date;
	updatedAt: Date;
	/** Populated author of the notification (lookup). */
	memberData?: Member;
}

export interface Notifications {
	list: Notification[];
	metaCounter: TotalCounter[];
}

export interface NotificationsSearch {
	notificationStatus?: NotificationStatus;
	notificationType?: NotificationType;
	notificationGroup?: NotificationGroup;
}

export interface NotificationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: NotificationsSearch;
}
