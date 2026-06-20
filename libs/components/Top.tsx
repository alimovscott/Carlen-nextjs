import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
import { GET_UNREAD_NOTIFICATIONS_COUNT } from '../../apollo/user/query';
import NotificationDropdown from './common/NotificationDropdown';

// Hoisted to module scope so it is not recreated on every render.
const StyledMenu = styled((props: MenuProps) => (
	<Menu
		elevation={0}
		anchorOrigin={{
			vertical: 'bottom',
			horizontal: 'right',
		}}
		transformOrigin={{
			vertical: 'top',
			horizontal: 'right',
		}}
		{...props}
	/>
))(({ theme }) => ({
	'& .MuiPaper-root': {
		top: '84px',
		borderRadius: 12,
		marginTop: theme.spacing(1),
		minWidth: 168,
		color: '#f4f6fb',
		backgroundColor: 'rgba(14, 19, 29, 0.92)',
		backgroundImage: 'none',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		backdropFilter: 'blur(18px)',
		WebkitBackdropFilter: 'blur(18px)',
		boxShadow: '0 24px 60px -28px rgba(0, 0, 0, 0.8)',
		transformOrigin: 'top right',
		'& .MuiMenu-list': {
			padding: '6px',
		},
		// Account dropdown profile header.
		'& .account-menu-head': {
			flexDirection: 'row',
			alignItems: 'center',
			gap: '12px',
			padding: '8px 10px 12px',
			marginBottom: '6px',
			borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
		},
		'& .account-avatar': {
			width: 40,
			height: 40,
			borderRadius: '50%',
			objectFit: 'cover',
			border: '1px solid rgba(255, 255, 255, 0.1)',
		},
		'& .account-meta': {
			minWidth: 0,
			'& strong': {
				display: 'block',
				fontSize: 14,
				fontWeight: 600,
				color: '#f4f6fb',
				whiteSpace: 'nowrap',
				overflow: 'hidden',
				textOverflow: 'ellipsis',
			},
			'& span': {
				fontSize: 11,
				fontWeight: 500,
				letterSpacing: '0.04em',
				textTransform: 'capitalize',
				color: '#7c8696',
			},
		},
		'& a': {
			textDecoration: 'none',
			color: 'inherit',
		},
		'& .MuiMenuItem-root': {
			borderRadius: 8,
			gap: '10px',
			fontSize: 14,
			fontWeight: 500,
			color: '#aab2c0',
			transition: 'background-color 180ms cubic-bezier(0.23, 1, 0.32, 1), color 180ms cubic-bezier(0.23, 1, 0.32, 1)',
			'& .MuiSvgIcon-root': {
				fontSize: 18,
				color: '#aab2c0',
			},
			'&:hover': {
				backgroundColor: 'rgba(255, 255, 255, 0.08)',
				color: '#f4f6fb',
			},
			'&:active': {
				backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
			},
		},
		// Logout visually separated (destructive action).
		'& .account-logout': {
			marginTop: 6,
			borderTop: '1px solid rgba(255, 255, 255, 0.1)',
			color: '#e92c28',
			'& .MuiSvgIcon-root': {
				color: '#e92c28',
			},
			'&:hover': {
				backgroundColor: 'rgba(233, 44, 40, 0.12)',
				color: '#ff6a3d',
			},
		},
	},
}));

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
	const notifOpen = Boolean(notifAnchor);

	/** APOLLO REQUESTS **/
	const { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT, {
		fetchPolicy: 'cache-and-network',
		skip: !user?._id,
	});
	const unreadCount: number = unreadData?.getUnreadNotificationsCount ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		switch (router.pathname) {
			case '/cars/detail':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		changeNavbarColor();
		window.addEventListener('scroll', changeNavbarColor, { passive: true });
		return () => window.removeEventListener('scroll', changeNavbarColor);
	}, []);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			setLang(e.target.id);
			localStorage.setItem('locale', e.target.id);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: e.target.id });
		},
		[router],
	);

	const changeNavbarColor = () => {
		if (window.scrollY >= 50) {
			setColorChange(true);
		} else {
			setColorChange(false);
		}
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleHover = (event: any) => {
		if (anchorEl !== event.currentTarget) {
			setAnchorEl(event.currentTarget);
		} else {
			setAnchorEl(null);
		}
	};

	const isActiveRoute = (href: string): boolean => {
		if (href === '/') return router.pathname === '/';
		return router.pathname.startsWith(href);
	};

	if (device == 'mobile') {
		return (
			<Stack className={'top'}>
				<Link href={'/'}>
					<div>{t('Home')}</div>
				</Link>
				<Link href={'/cars'}>
					<div>{t('Products')}</div>
				</Link>
				<Link href={'/agent'}>
					<div> {t('Agents')} </div>
				</Link>
				<Link href={'/community?articleCategory=FREE'}>
					<div> {t('Community')} </div>
				</Link>
				<Link href={'/cs'}>
					<div> {t('CS')} </div>
				</Link>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'} component={'nav'} aria-label={'Primary'}>
				<Stack className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
					<Stack className={'container'}>
						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'}>
								<img src="/img/logo/logoWhite.svg" alt="Carlen" className={'carlen-logo-hover'} />
							</Link>
						</Box>
						<Box component={'div'} className={'router-box'}>
							<Link href={'/'}>
								<div className={isActiveRoute('/') ? 'active' : ''}>{t('Home')}</div>
							</Link>
							<Link href={'/cars'}>
								<div className={isActiveRoute('/cars') ? 'active' : ''}>{t('Products')}</div>
							</Link>
							<Link href={'/agent'}>
								<div className={isActiveRoute('/agent') ? 'active' : ''}>{t('Agents')}</div>
							</Link>
							<Link href={'/community?articleCategory=FREE'}>
								<div className={isActiveRoute('/community') ? 'active' : ''}>{t('Community')}</div>
							</Link>
							{user?._id && (
								<Link href={'/mypage'}>
									<div className={isActiveRoute('/mypage') ? 'active' : ''}>{t('Dashboard')}</div>
								</Link>
							)}
							<Link href={'/cs'}>
								<div className={isActiveRoute('/cs') ? 'active' : ''}>{t('CS')}</div>
							</Link>
						</Box>
						<Box component={'div'} className={'user-box'}>
							{user?._id ? (
								<>
									<button
										type={'button'}
										className={'notification-btn'}
										aria-label={t('Notifications')}
										aria-haspopup={'true'}
										aria-expanded={notifOpen}
										data-count={unreadCount}
										onClick={(event: any) => setNotifAnchor(event.currentTarget)}
									>
										<NotificationsOutlinedIcon className={'notification-icon'} />
									</button>

									<NotificationDropdown
										anchorEl={notifAnchor}
										open={notifOpen}
										onClose={() => setNotifAnchor(null)}
									/>

									<button
										type={'button'}
										className={'login-user'}
										aria-label={t('Account menu')}
										aria-haspopup={'true'}
										aria-expanded={logoutOpen}
										onClick={(event: any) => setLogoutAnchor(event.currentTarget)}
									>
										<img
											src={
												user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
											}
											alt={''}
										/>
									</button>

									<StyledMenu
										id={'account-menu'}
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => {
											setLogoutAnchor(null);
										}}
									>
										<Stack className={'account-menu-head'}>
											<img
												className={'account-avatar'}
												src={
													user?.memberImage
														? `${REACT_APP_API_URL}/${user?.memberImage}`
														: '/img/profile/defaultUser.svg'
												}
												alt={''}
											/>
											<Stack className={'account-meta'}>
												<strong>{user?.memberNick || user?.memberFullName || t('Member')}</strong>
												<span>{user?.memberType}</span>
											</Stack>
										</Stack>

										<Link href={'/mypage'} onClick={() => setLogoutAnchor(null)}>
											<MenuItem>
												<SpaceDashboardOutlinedIcon fontSize={'small'} />
												{t('Dashboard')}
											</MenuItem>
										</Link>
										<Link href={{ pathname: '/mypage', query: { category: 'myProfile' } }} onClick={() => setLogoutAnchor(null)}>
											<MenuItem>
												<PersonOutlineOutlinedIcon fontSize={'small'} />
												{t('My Profile')}
											</MenuItem>
										</Link>
										<MenuItem className={'account-logout'} onClick={() => logOut()}>
											<Logout fontSize={'small'} />
											{t('Logout')}
										</MenuItem>
									</StyledMenu>
								</>
							) : (
								<Link href={'/account/join'}>
									<div className={'join-box'}>
										<AccountCircleOutlinedIcon />
										<span>
											{t('Login')} / {t('Register')}
										</span>
									</div>
								</Link>
							)}

							<div className={'lan-box'}>
								<Button
									disableRipple
									className="btn-lang"
									onClick={langClick}
									endIcon={<CaretDown size={14} color="#aab2c0" weight="fill" />}
								>
									<Box component={'div'} className={'flag'}>
										{lang !== null ? (
											<img src={`/img/flag/lang${lang}.png`} alt={'usaFlag'} />
										) : (
											<img src={`/img/flag/langen.png`} alt={'usaFlag'} />
										)}
									</Box>
								</Button>

								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
									<MenuItem disableRipple onClick={langChoice} id="en">
										<img
											className="img-flag"
											src={'/img/flag/langen.png'}
											onClick={langChoice}
											id="en"
											alt={'usaFlag'}
										/>
										{t('English')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="kr">
										<img
											className="img-flag"
											src={'/img/flag/langkr.png'}
											onClick={langChoice}
											id="uz"
											alt={'koreanFlag'}
										/>
										{t('Korean')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="ru">
										<img
											className="img-flag"
											src={'/img/flag/langru.png'}
											onClick={langChoice}
											id="ru"
											alt={'russiaFlag'}
										/>
										{t('Russian')}
									</MenuItem>
								</StyledMenu>
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withRouter(Top);
