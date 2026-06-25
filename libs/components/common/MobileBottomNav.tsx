import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

const NAV_ITEMS = [
	{ label: 'Home', href: '/', Icon: HomeRoundedIcon },
	{ label: 'Cars', href: '/cars', Icon: DirectionsCarFilledRoundedIcon },
	{ label: 'Agents', href: '/agent', Icon: GroupsRoundedIcon },
	{ label: 'Community', href: '/community', Icon: ForumRoundedIcon },
	{ label: 'My Page', href: '/mypage', Icon: PersonRoundedIcon },
];

const MobileBottomNav = () => {
	const router = useRouter();
	const currentPath = router.pathname;

	const isActive = (href: string) =>
		href === '/' ? currentPath === '/' : currentPath === href || currentPath.startsWith(`${href}/`);

	return (
		<nav className={'carlen-bottom-nav'} aria-label={'Primary'}>
			{NAV_ITEMS.map(({ label, href, Icon }) => {
				const active = isActive(href);
				return (
					<Link
						key={href}
						href={href}
						className={active ? 'nav-item active' : 'nav-item'}
						aria-current={active ? 'page' : undefined}
					>
						<Icon className={'nav-icon'} />
						<span className={'nav-label'}>{label}</span>
					</Link>
				);
			})}
		</nav>
	);
};

export default MobileBottomNav;
