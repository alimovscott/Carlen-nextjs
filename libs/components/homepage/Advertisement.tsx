import React, { useRef } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack } from '@mui/material';
import { motion, useInView, useReducedMotion, Variants } from 'framer-motion';

const TRUST_STATS = [
	{ stat: '15K+', label: 'Verified Cars', description: 'Hand-checked listings across premium brands.' },
	{ stat: '98%', label: 'Customer Satisfaction', description: 'Drivers who would recommend Carlen.' },
	{ stat: '24/7', label: 'Premium Support', description: 'Real specialists, any time of day.' },
	{ stat: '100%', label: 'Verified Dealers', description: 'Every dealer vetted before listing.' },
];

const TrustShowcase = () => {
	const shouldReduceMotion = useReducedMotion();
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-80px' });

	const headerVariants: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
	};
	const gridVariants: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.12, delayChildren: 0.1 } },
	};
	const cardVariants: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
	};

	return (
		<Stack className={'carlen-trust-section'} ref={ref}>
			<Stack className={'carlen-trust-container'}>
				<motion.div
					className={'carlen-trust-header'}
					variants={headerVariants}
					initial={'hidden'}
					animate={isInView ? 'visible' : 'hidden'}
				>
					<h2>Why Drivers Choose Carlen</h2>
					<p>Trusted by thousands of drivers searching for premium vehicles.</p>
				</motion.div>
				<motion.div
					className={'carlen-trust-grid'}
					variants={gridVariants}
					initial={'hidden'}
					animate={isInView ? 'visible' : 'hidden'}
				>
					{TRUST_STATS.map((item) => (
						<motion.div
							className={'carlen-trust-card'}
							key={item.label}
							variants={cardVariants}
							whileHover={shouldReduceMotion ? undefined : { y: -6 }}
							transition={{ type: 'spring', stiffness: 300, damping: 26 }}
						>
							<span className={'carlen-trust-stat'}>{item.stat}</span>
							<span className={'carlen-trust-label'}>{item.label}</span>
							<span className={'carlen-trust-description'}>{item.description}</span>
						</motion.div>
					))}
				</motion.div>
			</Stack>
		</Stack>
	);
};

const Advertisement = () => {
	const device = useDeviceDetect();

	if (device == 'mobile') {
		return <TrustShowcase />;
	} else {
		return <TrustShowcase />;
	}
};

export default Advertisement;
