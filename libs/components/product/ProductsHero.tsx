import React from 'react';
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion';

const ProductsHero = () => {
	const shouldReduceMotion = useReducedMotion();
	const { scrollY } = useScroll();
	const visualY = useTransform(scrollY, [0, 400], [0, shouldReduceMotion ? 0 : -28]);

	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1, delayChildren: 0.1 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
	};

	return (
		<section className={'carlen-products-hero'}>
			<div className={'carlen-products-overlay'} />
			<div className={'carlen-products-inner'}>
				<motion.div className={'carlen-products-content'} variants={container} initial={'hidden'} animate={'visible'}>
					<motion.span className={'carlen-products-eyebrow'} variants={item}>
						Premium Automotive Marketplace
					</motion.span>
					<motion.h1 className={'carlen-products-title'} variants={item}>
						Find Your Next <span className={'accent'}>Premium</span> Car
					</motion.h1>
					<motion.p className={'carlen-products-subtitle'} variants={item}>
						Explore verified vehicles from trusted dealers across Korea.
					</motion.p>
					<motion.button
						className={'carlen-products-cta'}
						variants={item}
						whileHover={shouldReduceMotion ? undefined : { y: -2 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
						onClick={() => document.getElementById('main')?.scrollIntoView({ behavior: 'smooth' })}
					>
						Explore Cars
					</motion.button>
				</motion.div>
				<motion.div
					className={'carlen-products-visual'}
					style={{ y: visualY }}
					initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.06 }}
					animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
					transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
				>
					<div className={'visual-img'} style={{ backgroundImage: 'url(/img/banner/types/mersedes.webp)' }} />
				</motion.div>
			</div>
		</section>
	);
};

export default ProductsHero;
