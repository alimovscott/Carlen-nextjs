import React from 'react';
import { useRouter } from 'next/router';
import { Typography } from '@mui/material';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import { GET_MEMBER } from '../../../apollo/user/query';
import { useTranslation } from 'next-i18next';

const MyMenu = () => {
	const shouldReduceMotion = useReducedMotion();
	const router = useRouter();
	const { t } = useTranslation('common');
	const category: any = router.query?.category ?? 'myProfile';
	const normalizedCategory =
		category === 'addProduct' || category === 'addProperty'
			? 'addCar'
			: category === 'myProducts' || category === 'myProperties'
			? 'myCars'
			: category;
	const user = useReactiveVar(userVar);
	const { data: getMemberData } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: user?._id },
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});
	const statsMember = getMemberData?.getMember ?? user;

	/** HANDLERS **/
	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert(t('Do you want to logout?'))) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	/** ANIMATION **/
	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06, delayChildren: 0.04 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
	};

	/** NAV CONFIG **/
	const MENU_SECTIONS = [
		{
			title: 'Garage',
			items:
				user?.memberType === 'AGENT'
					? [
							{ category: 'addCar', label: 'Add Car', Icon: AddRoundedIcon },
							{ category: 'myCars', label: 'My Cars', Icon: DirectionsCarFilledOutlinedIcon },
					  ]
					: [],
		},
		{
			title: 'Activity',
			items: [
				{ category: 'myFavorites', label: 'My Favorites', Icon: FavoriteBorderOutlinedIcon },
				{ category: 'recentlyVisited', label: 'Recently Visited', Icon: HistoryOutlinedIcon },
				{ category: 'followers', label: 'My Followers', Icon: PeopleAltOutlinedIcon },
				{ category: 'followings', label: 'My Followings', Icon: HowToRegOutlinedIcon },
			],
		},
		{
			title: 'Community',
			items: [
				{ category: 'myArticles', label: 'Articles', Icon: ArticleOutlinedIcon },
				{ category: 'writeArticle', label: 'Write Article', Icon: DriveFileRenameOutlineOutlinedIcon },
			],
		},
		{
			title: 'Account',
			items: [{ category: 'myProfile', label: 'My Profile', Icon: PersonOutlineOutlinedIcon }],
		},
	].filter((s) => s.items.length);

	return (
			<motion.div className="carlen-my-menu" variants={container} initial="hidden" animate="visible">
				<motion.div className="profile" variants={item}>
					<div className="avatar-ring">
						<img
							className="avatar-img"
							src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
							alt="member"
						/>
					</div>
					<Typography className="user-name">{user?.memberNick}</Typography>
					{user?.memberType === 'ADMIN' ? (
						<a href="/_admin/users" target="_blank" rel="noreferrer">
							<span className="member-type-badge">{user?.memberType}</span>
						</a>
					) : (
						<span className="member-type-badge">
							{user?.memberType === 'AGENT' && <VerifiedOutlinedIcon />}
							{user?.memberType}
						</span>
					)}
					{user?.memberPhone && (
						<span className="phone-row">
							<PhoneOutlinedIcon />
							<Typography className="p-number">{user?.memberPhone}</Typography>
						</span>
					)}
					<div className="profile-stats">
						<div className="stat">
							<span className="stat-value">{statsMember?.memberProducts ?? 0}</span>
							<span className="stat-label">{t('Cars')}</span>
						</div>
						<div className="stat">
							<span className="stat-value">{statsMember?.memberLikes ?? 0}</span>
							<span className="stat-label">{t('Likes')}</span>
						</div>
						<div className="stat">
							<span className="stat-value">{statsMember?.memberArticles ?? 0}</span>
							<span className="stat-label">{t('Articles')}</span>
						</div>
					</div>
				</motion.div>

				<div className="menu-nav">
					{MENU_SECTIONS.map((sec) => (
						<motion.div className="nav-section" variants={item} key={sec.title}>
							<Typography className="section-title">{t(sec.title)}</Typography>
							{sec.items.map(({ category: cat, label, Icon }) => (
								<Link
									key={cat}
									href={{ pathname: '/mypage', query: { category: cat } }}
									scroll={false}
									style={{ width: '100%' }}
								>
									<motion.div
										className={normalizedCategory === cat ? 'nav-item active' : 'nav-item'}
										whileHover={shouldReduceMotion ? undefined : { x: 2 }}
									>
										<span className="nav-icon">
											<Icon />
										</span>
										<Typography className="nav-label">{t(label)}</Typography>
									</motion.div>
								</Link>
							))}
							{sec.title === 'Account' && (
								<motion.div
									className="nav-item logout"
									onClick={logoutHandler}
									whileHover={shouldReduceMotion ? undefined : { x: 2 }}
								>
									<span className="nav-icon">
										<LogoutOutlinedIcon />
									</span>
									<Typography className="nav-label">{t('Logout')}</Typography>
								</motion.div>
							)}
						</motion.div>
					))}
				</div>
			</motion.div>
		);
};

export default MyMenu;
