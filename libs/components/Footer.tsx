import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack } from '@mui/material';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import Link from 'next/link';
import moment from 'moment';

const SOCIALS = [
	{ icon: <FacebookOutlinedIcon />, href: '#', label: 'Facebook' },
	{ icon: <TelegramIcon />, href: '#', label: 'Telegram' },
	{ icon: <InstagramIcon />, href: '#', label: 'Instagram' },
	{ icon: <TwitterIcon />, href: '#', label: 'Twitter' },
];

const FOOTER_COLUMNS: { title: string; links: { label: string; href?: string }[] }[] = [
	{
		title: 'Popular Search',
		links: [{ label: 'Automatic Cars', href: '/cars' }, { label: 'Low Mileage', href: '/cars' }],
	},
	{
		title: 'Quick Links',
		links: [
			{ label: 'Terms of Use' },
			{ label: 'Privacy Policy' },
			{ label: 'Pricing Plans' },
			{ label: 'Our Services' },
			{ label: 'Contact Support', href: '/cs' },
			{ label: 'FAQs', href: '/cs' },
		],
	},
	{
		title: 'Discover',
		links: [{ label: 'Seoul' }, { label: 'Gyeongido' }, { label: 'Busan' }, { label: 'Jejudo' }],
	},
];

const Footer = () => {
	const device = useDeviceDetect();
	const shouldReduceMotion = useReducedMotion();

	const containerVariants: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08, delayChildren: 0.05 } },
	};
	const itemVariants: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
	};

	if (device == 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<div className={'carlen-mfooter'}>
					<div className={'carlen-mfooter-brand'}>
						<img src="/img/logo/logoWhite.svg" alt="Carlen" className={'logo carlen-logo-hover'} />
						<p className={'tagline'}>Premium cars, verified dealers — one trusted marketplace.</p>
						<div className={'carlen-mfooter-contact'}>
							<span>Total free customer care</span>
							<strong>+82 10 4364 1330</strong>
						</div>
						<div className={'media-box'}>
							{SOCIALS.map((s) => (
								<a key={s.label} href={s.href} aria-label={s.label} className={'social'}>
									{s.icon}
								</a>
							))}
						</div>
					</div>
					<div className={'carlen-mfooter-cols'}>
						{FOOTER_COLUMNS.map((col) => (
							<div className={'carlen-mfooter-col'} key={col.title}>
								<strong>{col.title}</strong>
								{col.links.map((link) =>
									link.href ? (
										<Link href={link.href} key={link.label} className={'link'}>
											{link.label}
										</Link>
									) : (
										<span className={'link'} key={link.label}>
											{link.label}
										</span>
									),
								)}
							</div>
						))}
					</div>
				</div>
				<Stack className={'second'}>
					<span>© Carlen — All rights reserved. {moment().year()}</span>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container carlen-footer'}>
				<motion.div
					className={'carlen-footer-grid'}
					variants={containerVariants}
					initial={'hidden'}
					whileInView={'visible'}
					viewport={{ once: true, margin: '-80px' }}
				>
					<motion.div className={'carlen-footer-brand'} variants={itemVariants}>
						<img src="/img/logo/logoWhite.svg" alt="Carlen" className={'logo carlen-logo-hover'} />
						<p className={'tagline'}>Premium cars, verified dealers — one trusted marketplace.</p>
						<div className={'carlen-footer-contact'}>
							<span>Total free customer care</span>
							<strong>+82 10 4867 2909</strong>
						</div>
						<div className={'media-box'}>
							{SOCIALS.map((s) => (
								<motion.a
									key={s.label}
									href={s.href}
									aria-label={s.label}
									className={'social'}
									whileHover={shouldReduceMotion ? undefined : { y: -3 }}
									whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
								>
									{s.icon}
								</motion.a>
							))}
						</div>
					</motion.div>

					<motion.div className={'carlen-footer-newsletter'} variants={itemVariants}>
						<strong>Keep yourself up to date</strong>
						<p>Get the latest premium listings and offers in your inbox.</p>
						<form className={'newsletter-row'} onSubmit={(e) => e.preventDefault()}>
							<input type="email" placeholder={'Your email'} aria-label={'Your email'} />
							<motion.button
								type={'submit'}
								className={'subscribe'}
								whileHover={shouldReduceMotion ? undefined : { y: -1 }}
								whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
							>
								Subscribe
							</motion.button>
						</form>
					</motion.div>

					{FOOTER_COLUMNS.map((col) => (
						<motion.div className={'carlen-footer-col'} variants={itemVariants} key={col.title}>
							<strong>{col.title}</strong>
							{col.links.map((link) =>
								link.href ? (
									<Link href={link.href} key={link.label} className={'link'}>
										{link.label}
									</Link>
								) : (
									<span className={'link'} key={link.label}>
										{link.label}
									</span>
								),
							)}
						</motion.div>
					))}
				</motion.div>

				<Stack className={'second'}>
					<span>© Carlen — All rights reserved. {moment().year()}</span>
					<span className={'legal'}>Privacy · Terms · Sitemap</span>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
