import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MenuList from '../admin/AdminMenuList';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import { Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';

const drawerWidth = 280;

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';
type SnackbarState = { open: boolean; message: string; severity: SnackbarSeverity };

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const shouldReduceMotion = useReducedMotion();
		const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
		const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
		const [title, setTitle] = useState('admin');
		const [loading, setLoading] = useState(true);

		const userMenuOpen = Boolean(anchorElUser);
		const avatarSrc = user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg';
		const isAdmin = user?.memberType === MemberType.ADMIN;

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setLoading(false);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) {
				router.push('/').then();
			}
		}, [loading, user, router]);

		/** HANDLERS **/
		const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
			setAnchorElUser(event.currentTarget);
		};

		const handleCloseUserMenu = () => {
			setAnchorElUser(null);
		};

		const logoutHandler = () => {
			handleCloseUserMenu();
			logOut();
			router.push('/').then();
		};

		const closeSnackbarHandler = (_event?: React.SyntheticEvent | Event, reason?: string) => {
			if (reason === 'clickaway') return;
			setSnackbar((prev) => ({ ...prev, open: false }));
		};

		/** MOTION — light, accessible (matches project pattern) **/
		const stagger = {
			hidden: {},
			visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.07, delayChildren: 0.04 } },
		};
		const fadeItem = {
			hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
			visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.23, 1, 0.32, 1] } },
		};

		/** Guard: wait for auth resolution before deciding (no premature blank/redirect flash) **/
		if (loading) {
			return (
				<main id="pc-wrap" className="admin">
					<div className={'cap-admin-splash'}>
						<span className={'cap-splash-mark'} />
						<span className={'cap-splash-label'}>Carlen Admin</span>
					</div>
				</main>
			);
		}

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		return (
			<main id="pc-wrap" className="admin">
				<Box component={'div'} sx={{ display: 'flex' }}>
					{/* FROSTED GLASS HEADER */}
					<AppBar
						position="fixed"
						className={'cap-appbar'}
						sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
					>
						<Toolbar className={'cap-appbar-toolbar'}>
							<div className={'cap-appbar-title'}>
								<span className={'eyebrow'}>OPERATIONS</span>
								<strong>{title}</strong>
							</div>

							<div className={'cap-appbar-spacer'} />

							<Tooltip title="Open settings">
								<IconButton
									className={'cap-appbar-avatar-btn'}
									onClick={handleOpenUserMenu}
									sx={{ p: 0 }}
									aria-controls={userMenuOpen ? 'admin-user-menu' : undefined}
									aria-haspopup="true"
									aria-expanded={userMenuOpen ? 'true' : undefined}
								>
									<Avatar src={avatarSrc} />
								</IconButton>
							</Tooltip>

							<Menu
								id="admin-user-menu"
								className={'pop-menu carlen-admin-user-menu'}
								anchorEl={anchorElUser}
								anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
								transformOrigin={{ vertical: 'top', horizontal: 'right' }}
								keepMounted={false}
								open={userMenuOpen}
								onClose={handleCloseUserMenu}
								MenuListProps={{ 'aria-labelledby': 'admin-user-menu' }}
							>
								<motion.div
									className={'cap-usermenu'}
									initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: -6 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
								>
									<div className={'cap-usermenu-head'}>
										<Avatar src={avatarSrc} className={'cap-usermenu-avatar'} />
										<div className={'cap-usermenu-meta'}>
											<strong>{user?.memberNick}</strong>
											<span>{user?.memberPhone}</span>
										</div>
									</div>

									<Divider className={'cap-usermenu-divider'} />

									<Link href={'/_admin/users'} className={'cap-usermenu-link'}>
										<MenuItem className={'cap-menu-item'} onClick={handleCloseUserMenu}>
											<SpaceDashboardOutlinedIcon fontSize="small" />
											<Typography variant={'subtitle1'} component={'span'}>
												Dashboard
											</Typography>
										</MenuItem>
									</Link>

									<MenuItem className={'cap-menu-item cap-menu-logout'} onClick={logoutHandler}>
										<LogoutRoundedIcon fontSize="small" />
										<Typography variant={'subtitle1'} component={'span'}>
											Logout
										</Typography>
									</MenuItem>
								</motion.div>
							</Menu>
						</Toolbar>
					</AppBar>

					{/* PREMIUM DARK SIDEBAR */}
					<Drawer
						className="aside"
						variant="permanent"
						anchor="left"
						sx={{
							width: drawerWidth,
							flexShrink: 0,
							'& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
						}}
					>
						<motion.div className={'cap-side-inner'} variants={stagger} initial={'hidden'} animate={'visible'}>
							{/* LOGO */}
							<motion.div className={'cap-side-logo'} variants={fadeItem}>
								<img src={'/img/logo/logoText.svg'} alt={'Carlen'} className={'carlen-logo-hover'} />
								<span className={'cap-side-logo-label'}>Carlen Admin</span>
							</motion.div>

							{/* ADMIN PROFILE CARD */}
							<motion.div className={'cap-side-profile'} variants={fadeItem}>
								<Avatar src={avatarSrc} className={'cap-side-avatar'} />
								<div className={'cap-side-profile-meta'}>
									<strong className={'cap-side-name'}>{user?.memberNick}</strong>
									<span className={'cap-side-phone'}>{user?.memberPhone}</span>
								</div>
								{isAdmin && <span className={'cap-admin-badge'}>ADMIN</span>}
							</motion.div>

							<Divider className={'cap-side-divider'} />

							{/* NAV */}
							<motion.nav className={'cap-side-nav'} variants={fadeItem} aria-label={'Admin navigation'}>
								<MenuList />
							</motion.nav>
						</motion.div>
					</Drawer>

					{/* MAIN CONTENT SURFACE */}
					<Box component={'div'} id="bunker" sx={{ flexGrow: 1 }}>
						{/*@ts-ignore*/}
						<Component {...props} setSnackbar={setSnackbar} setTitle={setTitle} />
					</Box>
				</Box>

				{/* GLOBAL ADMIN SNACKBAR (driven by child pages via setSnackbar) */}
				<Snackbar
					open={snackbar.open}
					autoHideDuration={4000}
					onClose={closeSnackbarHandler}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				>
					<Alert
						onClose={closeSnackbarHandler}
						severity={snackbar.severity || 'success'}
						variant={'filled'}
						sx={{ width: '100%' }}
					>
						{snackbar.message}
					</Alert>
				</Snackbar>
			</main>
		);
	};
};

export default withAdminLayout;
