import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';

const STATS = ['120+ Dealers', '1,200+ Listings', 'Verified Network'];

const AgentsHero = () => {
	const shouldReduceMotion = useReducedMotion();

	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1, delayChildren: 0.1 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
	};

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
