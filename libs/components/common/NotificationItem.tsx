import React from 'react';
import moment from 'moment';
import { motion, useReducedMotion } from 'framer-motion';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Notification } from '../../types/notification/notification';
import { NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { REACT_APP_API_URL } from '../../config';

interface NotificationItemProps {
	notification: Notification;
	onRead: (notification: Notification) => void;
	onRemove: (notification: Notification) => void;
}

const TYPE_ICON: Record<string, React.ElementType> = {
	[NotificationType.LIKE]: FavoriteRoundedIcon,
	[NotificationType.COMMENT]: ChatBubbleOutlineRoundedIcon,
	[NotificationType.FOLLOW]: PersonAddAlt1RoundedIcon,
	[NotificationType.VIEW]: VisibilityOutlinedIcon,
};

const NotificationItem = ({ notification, onRead, onRemove }: NotificationItemProps) => {
	const shouldReduceMotion = useReducedMotion();
	const isUnread = notification.notificationStatus === NotificationStatus.WAIT;
	const TypeIcon = TYPE_ICON[notification.notificationType] ?? NotificationsNoneRoundedIcon;
	const avatar = notification?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${notification.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';

	const removeHandler = (e: React.MouseEvent) => {
		e.stopPropagation();
		onRemove(notification);
	};

	return (
		<motion.div
			className={`carlen-notif-item ${isUnread ? 'unread' : ''}`}
			role={'button'}
			tabIndex={0}
			onClick={() => onRead(notification)}
			onKeyDown={(e: React.KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onRead(notification);
				}
			}}
			variants={{
				hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 },
				visible: { opacity: 1, y: 0 },
			}}
		>
			<div className={'notif-avatar'}>
				<img src={avatar} alt={''} />
				<span className={`notif-type ${notification.notificationType.toLowerCase()}`}>
					<TypeIcon />
				</span>
			</div>

			<div className={'notif-body'}>
				<strong className={'notif-title'}>{notification.notificationTitle}</strong>
				{notification.notificationDesc ? <p className={'notif-desc'}>{notification.notificationDesc}</p> : null}
				<span className={'notif-time'}>{moment(notification.createdAt).fromNow()}</span>
			</div>

			{isUnread ? <span className={'notif-dot'} aria-label={'unread'} /> : null}

			<button type={'button'} className={'notif-remove'} aria-label={'Remove notification'} onClick={removeHandler}>
				<CloseRoundedIcon />
			</button>
		</motion.div>
	);
};

export default NotificationItem;
