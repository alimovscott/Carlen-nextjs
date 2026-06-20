import React from 'react';
import { useRouter } from 'next/router';
import Menu from '@mui/material/Menu';
import { Stack } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATIONS_COUNT } from '../../../apollo/user/query';
import {
	MARK_ALL_NOTIFICATIONS_AS_READ,
	MARK_NOTIFICATION_AS_READ,
	REMOVE_NOTIFICATION,
} from '../../../apollo/user/mutation';
import { Notification } from '../../types/notification/notification';
import { NotificationGroup, NotificationStatus } from '../../enums/notification.enum';
import { Direction } from '../../enums/common.enum';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
}

const NOTIF_VARS = {
	input: { page: 1, limit: 20, sort: 'createdAt', direction: Direction.DESC },
};

/** Sets the cached unread count to an absolute value (never below 0). */
const writeUnread = (cache: any, value: number) => {
	cache.writeQuery({
		query: GET_UNREAD_NOTIFICATIONS_COUNT,
		data: { getUnreadNotificationsCount: Math.max(0, value) },
	});
};

const readUnread = (cache: any): number => {
	try {
		return cache.readQuery({ query: GET_UNREAD_NOTIFICATIONS_COUNT })?.getUnreadNotificationsCount ?? 0;
	} catch {
		return 0;
	}
};

const NotificationDropdown = ({ anchorEl, open, onClose }: NotificationDropdownProps) => {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const client = useApolloClient();

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery(GET_NOTIFICATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: NOTIF_VARS,
		skip: !open,
	});

	const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
	const [markAllNotificationsAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);
	const [removeNotification] = useMutation(REMOVE_NOTIFICATION);

	const list: Notification[] = data?.getNotifications?.list ?? [];
	const unreadVisible = list.filter((n) => n.notificationStatus === NotificationStatus.WAIT).length;

	/** HANDLERS **/
	const navigateFor = (n: Notification) => {
		if (n.notificationGroup === NotificationGroup.PRODUCT && n.productId) {
			router.push(`/cars/detail?id=${n.productId}`);
		} else if (n.notificationGroup === NotificationGroup.MEMBER && n.authorId) {
			router.push(`/member?memberId=${n.authorId}`);
		}
		// ARTICLE and others: mark-as-read only (no articleCategory available).
	};

	const readHandler = async (n: Notification) => {
		if (n.notificationStatus === NotificationStatus.WAIT) {
			try {
				await markNotificationAsRead({
					variables: { notificationId: n._id },
					optimisticResponse: {
						markNotificationAsRead: {
							__typename: 'Notification',
							_id: n._id,
							notificationStatus: NotificationStatus.READ,
						},
					},
					// markNotificationAsRead returns the Notification (normalized by _id),
					// so the list row updates to READ automatically; only adjust the count.
					update: (cache) => writeUnread(cache, readUnread(cache) - 1),
				});
			} catch {
				/* errorLink surfaces the message */
			}
		}
		onClose();
		navigateFor(n);
	};

	const markAllHandler = async () => {
		if (unreadVisible === 0) return;
		try {
			await markAllNotificationsAsRead({
				optimisticResponse: { markAllNotificationsAsRead: unreadVisible },
				update: (cache) => {
					cache.updateQuery({ query: GET_NOTIFICATIONS, variables: NOTIF_VARS }, (prev: any) => {
						if (!prev?.getNotifications) return prev;
						return {
							getNotifications: {
								...prev.getNotifications,
								list: prev.getNotifications.list.map((n: Notification) => ({
									...n,
									notificationStatus: NotificationStatus.READ,
								})),
							},
						};
					});
					writeUnread(cache, 0);
				},
			});
		} catch {
			/* handled by errorLink */
		}
	};

	const removeHandler = async (n: Notification) => {
		try {
			await removeNotification({
				variables: { notificationId: n._id },
				optimisticResponse: {
					removeNotification: {
						__typename: 'Notification',
						_id: n._id,
						notificationStatus: NotificationStatus.DELETE,
					},
				},
				update: (cache) => {
					cache.updateQuery({ query: GET_NOTIFICATIONS, variables: NOTIF_VARS }, (prev: any) => {
						if (!prev?.getNotifications) return prev;
						const nextList = prev.getNotifications.list.filter((item: Notification) => item._id !== n._id);
						const meta = prev.getNotifications.metaCounter?.[0];
						return {
							getNotifications: {
								...prev.getNotifications,
								list: nextList,
								metaCounter: meta ? [{ ...meta, total: Math.max(0, (meta.total ?? 1) - 1) }] : prev.getNotifications.metaCounter,
							},
						};
					});
					if (n.notificationStatus === NotificationStatus.WAIT) writeUnread(cache, readUnread(cache) - 1);
					cache.evict({ id: cache.identify({ __typename: 'Notification', _id: n._id }) });
					cache.gc();
				},
			});
		} catch {
			/* handled by errorLink */
		}
	};

	const deleteAllHandler = async () => {
		if (list.length === 0) return;
		const ids = list.map((n) => n._id);
		try {
			// No bulk-delete backend op exists: soft-delete each loaded notification.
			await Promise.all(
				ids.map((id) => removeNotification({ variables: { notificationId: id } })),
			);
		} catch {
			/* handled by errorLink */
		} finally {
			// Clear the cached list + count once, regardless of per-call timing.
			const cache = client.cache;
			cache.updateQuery({ query: GET_NOTIFICATIONS, variables: NOTIF_VARS }, (prev: any) => {
				if (!prev?.getNotifications) return prev;
				return {
					getNotifications: { ...prev.getNotifications, list: [], metaCounter: [{ __typename: 'TotalCounter', total: 0 }] },
				};
			});
			writeUnread(cache, 0);
			ids.forEach((id) => cache.evict({ id: cache.identify({ __typename: 'Notification', _id: id }) }));
			cache.gc();
		}
	};

	const container = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.04 } },
	};

	return (
		<Menu
			anchorEl={anchorEl}
			open={open}
			onClose={onClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			MenuListProps={{ sx: { p: 0 } }}
			PaperProps={{ className: 'carlen-notif-dropdown' }}
		>
			<Stack className={'carlen-notif-head'}>
				<strong>Notifications</strong>
				<div className={'carlen-notif-actions'}>
					<button type={'button'} className={'mark-all'} onClick={markAllHandler} disabled={unreadVisible === 0}>
						<DoneAllRoundedIcon />
						Mark all as read
					</button>
					<button type={'button'} className={'delete-all'} onClick={deleteAllHandler} disabled={list.length === 0}>
						<DeleteOutlineRoundedIcon />
						Delete all
					</button>
				</div>
			</Stack>

			<div className={'carlen-notif-list'}>
				{loading && list.length === 0 ? (
					<div className={'carlen-notif-skeleton'}>
						{[0, 1, 2, 3].map((i) => (
							<div className={'skeleton-row'} key={i}>
								<span className={'sk-avatar'} />
								<div className={'sk-lines'}>
									<span className={'sk-line'} />
									<span className={'sk-line short'} />
								</div>
							</div>
						))}
					</div>
				) : list.length === 0 ? (
					<div className={'carlen-notif-empty'}>
						<NotificationsNoneRoundedIcon />
						<strong>You&apos;re all caught up</strong>
						<span>New notifications will appear here.</span>
					</div>
				) : (
					<motion.div variants={container} initial={'hidden'} animate={'visible'}>
						{list.map((n) => (
							<NotificationItem key={n._id} notification={n} onRead={readHandler} onRemove={removeHandler} />
						))}
					</motion.div>
				)}
			</div>
		</Menu>
	);
};

export default NotificationDropdown;
