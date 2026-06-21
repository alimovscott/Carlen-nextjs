import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ProductCard from '../product/PropductCard';
import { Product } from '../../types/product/product';
import { T } from '../../types/common';
import { useQuery } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import { useTranslation } from 'next-i18next';

const RecentlyVisited: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const { t } = useTranslation('common');
	const [recentlyVisited, setRecentlyVisited] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const {
		loading: getVisitedLoading,
		data: getVisitedData,
		error: getVisitedError,
		refetch: getVisitedRefetch,
	} = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setRecentlyVisited(data?.getVisited?.list);
			setTotal(data?.getVisited?.metaCounter[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	/** ANIMATION **/
	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.07, delayChildren: 0.04 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
	};

	if (device === 'mobile') {
		return <div>RECENTLY VISITED MOBILE</div>;
	} else {
		return (
			<div id="carlen-recently-visited-page">
				<motion.div className="carlen-section-header" variants={container} initial="hidden" animate="visible">
					<motion.span className="eyebrow" variants={item}>
						{t('Recently Viewed')}
					</motion.span>
					<motion.h1 className="title" variants={item}>
						{t('Recently Viewed Cars')}
					</motion.h1>
					<motion.p className="subtitle" variants={item}>
						{t('Quickly return to vehicles you recently explored.')}
					</motion.p>
					{total > 0 && (
						<motion.span className="stat-chip" variants={item}>
							<i className="dot" />
							{t('totalViewedCars', { count: total })}
						</motion.span>
					)}
				</motion.div>

				{getVisitedLoading && !recentlyVisited.length ? (
					<Stack className="carlen-recent-grid">
						{Array.from({ length: 6 }).map((_, idx) => (
							<div className="recent-skeleton" key={idx}>
								<div className="sk-img" />
								<div className="sk-body">
									<span className="sk-line w-70" />
									<span className="sk-line w-50" />
									<span className="sk-line w-90" />
								</div>
							</div>
						))}
					</Stack>
				) : recentlyVisited?.length ? (
					<motion.div
						className="carlen-recent-grid"
						variants={container}
						initial="hidden"
						animate="visible"
						key={searchVisited.page}
					>
						{recentlyVisited?.map((product: Product) => (
							<motion.div variants={item} key={product?._id}>
								<ProductCard product={product} recentlyVisited={true} />
							</motion.div>
						))}
					</motion.div>
				) : (
					<motion.div
						className="carlen-recent-empty"
						initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
						animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					>
						<span className="empty-icon">
							<HistoryRoundedIcon />
						</span>
						<Typography className="empty-title">{t('No recently viewed cars yet')}</Typography>
						<Typography className="empty-helper">{t('Browse vehicles and your viewed cars will appear here.')}</Typography>
						<motion.button
							type="button"
							className="cta-primary"
							onClick={() => router.push('/cars')}
							whileHover={shouldReduceMotion ? undefined : { y: -2 }}
							whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
						>
							<DirectionsCarFilledOutlinedIcon />
							{t('Browse Cars')}
						</motion.button>
					</motion.div>
				)}

				{recentlyVisited?.length ? (
					<motion.div
						className="carlen-recent-pagination"
						initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
						animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
						transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
					>
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchVisited.limit)}
								page={searchVisited.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								{t('totalViewedCars', { count: total })}
							</Typography>
						</Stack>
					</motion.div>
				) : null}
			</div>
		);
	}
};

export default RecentlyVisited;
