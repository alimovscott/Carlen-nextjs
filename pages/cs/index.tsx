import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Stack } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const QUICK_CHIPS = [
	{ label: 'Account', href: '/mypage' },
	{ label: 'Listings', href: '/cars' },
	{ label: 'Payments', href: '/cs?tab=faq' },
	{ label: 'Community', href: '/community?articleCategory=FREE' },
];

const CS: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();

	/** HANDLERS **/
	const changeTabHandler = (tab: string) => {
		router.push(
			{
				pathname: '/cs',
				query: { tab: tab },
			},
			undefined,
			{ scroll: false },
		);
	};
	const tab = router.query.tab ?? 'notice';

	const fadeUp = (delay: number) => ({
		initial: shouldReduceMotion ? false : { opacity: 0, y: 16 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.45, delay, ease: [0.23, 1, 0.32, 1] as const },
	});

	if (device === 'mobile') {
		return (
			<Stack className={'carlen-cs-page'} component={'section'} aria-label={'Carlen Support Center'}>
				<Stack className={'container'}>
					<motion.div className={'carlen-cs-header'} {...fadeUp(0)}>
						<Box component={'div'} className={'carlen-cs-info'}>
							<span className={'eyebrow'}>SUPPORT CENTER</span>
							<h1>How can we help?</h1>
							<p>Find notices, frequently asked questions, and support resources for Carlen users.</p>
							<Box component={'div'} className={'quick-chips'}>
								{QUICK_CHIPS.map((chip) => (
									<Link href={chip.href} key={chip.label} className={'chip'}>
										{chip.label}
									</Link>
								))}
							</Box>
						</Box>
					</motion.div>

					<motion.div className={'carlen-cs-tabs'} {...fadeUp(0.08)}>
						<div
							className={tab == 'notice' ? 'active' : ''}
							onClick={() => {
								changeTabHandler('notice');
							}}
						>
							Notice
						</div>
						<div
							className={tab == 'faq' ? 'active' : ''}
							onClick={() => {
								changeTabHandler('faq');
							}}
						>
							FAQ
						</div>
					</motion.div>

					<motion.div className={'carlen-cs-content'} {...fadeUp(0.16)}>
						{tab === 'notice' && <Notice />}

						{tab === 'faq' && <Faq />}
					</motion.div>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'carlen-cs-page'} component={'section'} aria-label={'Carlen Support Center'}>
				<Stack className={'container'}>
					<motion.div className={'carlen-cs-header'} {...fadeUp(0)}>
						<Box component={'div'} className={'carlen-cs-info'}>
							<span className={'eyebrow'}>SUPPORT CENTER</span>
							<h1>How can we help?</h1>
							<p>Find notices, frequently asked questions, and support resources for Carlen users.</p>
							<Box component={'div'} className={'quick-chips'}>
								{QUICK_CHIPS.map((chip) => (
									<Link href={chip.href} key={chip.label} className={'chip'}>
										{chip.label}
									</Link>
								))}
							</Box>
						</Box>
					</motion.div>

					<motion.div className={'carlen-cs-tabs'} {...fadeUp(0.08)}>
						<div
							className={tab == 'notice' ? 'active' : ''}
							onClick={() => {
								changeTabHandler('notice');
							}}
						>
							Notice
						</div>
						<div
							className={tab == 'faq' ? 'active' : ''}
							onClick={() => {
								changeTabHandler('faq');
							}}
						>
							FAQ
						</div>
					</motion.div>

					<motion.div className={'carlen-cs-content'} {...fadeUp(0.16)}>
						{tab === 'notice' && <Notice />}

						{tab === 'faq' && <Faq />}
					</motion.div>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(CS);
