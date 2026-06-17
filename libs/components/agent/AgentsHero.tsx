import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { sweetErrorHandling } from '../../sweetAlert';

const STATS = ['120+ Dealers', '1,200+ Listings', 'Verified Network'];

interface AgentsHeroProps {
	variant?: 'listing' | 'detail';
	agent?: Member | null;
}

const AgentsHero = (props: AgentsHeroProps) => {
	const { variant = 'listing', agent } = props;
	const shouldReduceMotion = useReducedMotion();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1, delayChildren: 0.1 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
	};

	/** DETAIL VARIANT **/
	if (variant === 'detail') {
		const dealerName = agent?.memberFullName ?? agent?.memberNick;
		const dealerStats = [
			{ key: 'listings', label: 'Listings', value: agent?.memberProducts ?? 0, icon: <DirectionsCarFilledOutlinedIcon /> },
			{ key: 'likes', label: 'Likes', value: agent?.memberLikes ?? 0, icon: <FavoriteBorderIcon /> },
			{ key: 'views', label: 'Views', value: agent?.memberViews ?? 0, icon: <VisibilityOutlinedIcon /> },
		];

		const redirectToMemberPageHandler = async (memberId?: string) => {
			try {
				if (!memberId) return;
				if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
				else await router.push(`/member?memberId=${memberId}`);
			} catch (error) {
				await sweetErrorHandling(error);
			}
		};

		return (
			<motion.section
				className={'carlen-agent-detail-hero'}
				variants={container}
				initial={'hidden'}
				animate={'visible'}
			>
				<motion.div className={'carlen-agent-profile'} variants={item}>
					<div className={'avatar-ring'} onClick={() => redirectToMemberPageHandler(agent?._id)}>
						<img
							src={agent?.memberImage ? `${REACT_APP_API_URL}/${agent?.memberImage}` : '/img/profile/defaultUser.svg'}
							alt=""
						/>
					</div>
					<div className={'info'}>
						<span className={'verified-chip'}>
							<VerifiedOutlinedIcon />
							Verified Dealer
						</span>
						<strong onClick={() => redirectToMemberPageHandler(agent?._id)}>{dealerName}</strong>
						<div className={'phone-row'}>
							<PhoneOutlinedIcon />
							<span>{agent?.memberPhone}</span>
						</div>
						<p className={'dealer-desc'}>
							{agent?.memberDesc ?? 'Premium verified Carlen dealer offering hand-picked vehicles and trusted service.'}
						</p>
						<div className={'cta-row'}>
							<motion.a
								href={`tel:${agent?.memberPhone ?? ''}`}
								className={'cta-primary'}
								whileHover={shouldReduceMotion ? undefined : { y: -2 }}
								whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
							>
								<PhoneOutlinedIcon />
								Contact Dealer
							</motion.a>
							<motion.button
								type={'button'}
								className={'cta-secondary'}
								whileHover={shouldReduceMotion ? undefined : { y: -2 }}
								whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
								onClick={() => redirectToMemberPageHandler(agent?._id)}
							>
								View Profile
							</motion.button>
						</div>
					</div>
				</motion.div>

				<motion.div className={'carlen-agent-stats'} variants={container}>
					{dealerStats.map((stat) => (
						<motion.div
							className={'stat-card'}
							key={stat.key}
							variants={item}
							whileHover={shouldReduceMotion ? undefined : { y: -4 }}
						>
							<span className={'stat-icon'}>{stat.icon}</span>
							<strong className={'stat-value'}>{stat.value}</strong>
							<span className={'stat-label'}>{stat.label}</span>
						</motion.div>
					))}
				</motion.div>
			</motion.section>
		);
	}

	/** LISTING VARIANT (default) **/
	return (
		<section className={'carlen-agent-hero'}>
			<div className={'carlen-agent-hero-inner'}>
				<motion.div className={'carlen-agent-hero-content'} variants={container} initial={'hidden'} animate={'visible'}>
					<motion.span className={'carlen-agent-eyebrow'} variants={item}>
						Verified Dealers
					</motion.span>
					<motion.h1 className={'carlen-agent-title'} variants={item}>
						Find Trusted Car Experts
					</motion.h1>
					<motion.p className={'carlen-agent-subtitle'} variants={item}>
						Connect with Korea’s top verified automotive dealers and premium vehicle specialists.
					</motion.p>
					<motion.div className={'carlen-agent-stats'} variants={item}>
						{STATS.map((s) => (
							<span className={'carlen-agent-stat-chip'} key={s}>
								<i className={'dot'} />
								{s}
							</span>
						))}
					</motion.div>
					<motion.div className={'carlen-agent-actions'} variants={item}>
						<motion.button
							type={'button'}
							className={'cta-primary'}
							whileHover={shouldReduceMotion ? undefined : { y: -2 }}
							whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
							onClick={() => document.getElementById('main')?.scrollIntoView({ behavior: 'smooth' })}
						>
							Explore Dealers
						</motion.button>
						<Link href={'/account/join'} className={'cta-secondary'}>
							Become a Dealer
						</Link>
					</motion.div>
				</motion.div>

				<motion.div
					className={'carlen-agent-hero-visual'}
					initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.04 }}
					animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
				>
					<div className={'visual-img'} style={{ backgroundImage: 'url(/img/banner/Lotus-Evija.jpg)' }} />
					<motion.div
						className={'float-card a'}
						animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
						transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
					>
						<span className={'icon'}>
							<VerifiedOutlinedIcon />
						</span>
						<div className={'text'}>
							<strong>Verified Dealer</strong>
							<span>Trusted network</span>
						</div>
					</motion.div>
					<motion.div
						className={'float-card b'}
						animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
						transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
					>
						<strong>4.9★</strong>
						<span>Avg. rating</span>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
};

export default AgentsHero;
