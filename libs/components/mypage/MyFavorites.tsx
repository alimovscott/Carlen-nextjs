import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination, Stack, Typography } from '@mui/material';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ProductCard from '../product/PropductCard';
import { Product } from '../../types/product/product';
import { T } from '../../types/common';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

const MyFavorites: NextPage = () => {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const { t } = useTranslation('common');
	const [myFavorites, setMyFavorites] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		loading: getFavoritesLoading,
		data: getFavoritesData,
		error: getFavoritesError,
		refetch: getFavoritesRefetch,
	} = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMyFavorites(data?.getFavorites?.list);
			setTotal(data?.getFavorites?.metaCounter[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetProduct({ variables: { input: id } });

			await getFavoritesRefetch({ input: searchFavorites });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
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

	return (
			<div id="carlen-my-favorites-page">
				<motion.div className="carlen-section-header" variants={container} initial="hidden" animate="visible">
					<motion.span className="eyebrow" variants={item}>
						{t('Saved Collection')}
					</motion.span>
					<motion.h1 className="title" variants={item}>
						{t('My Favorite Cars')}
					</motion.h1>
					<motion.p className="subtitle" variants={item}>
						{t('Keep track of vehicles you are interested in and revisit them anytime.')}
					</motion.p>
					{total > 0 && (
						<motion.span className="stat-chip" variants={item}>
							<i className="dot" />
							{t('totalSavedCars', { count: total })}
						</motion.span>
					)}
				</motion.div>

				{getFavoritesLoading && !myFavorites.length ? (
					<Stack className="carlen-favorites-grid">
						{Array.from({ length: 6 }).map((_, idx) => (
							<div className="favorite-skeleton" key={idx}>
								<div className="sk-img" />
								<div className="sk-body">
									<span className="sk-line w-70" />
									<span className="sk-line w-50" />
									<span className="sk-line w-90" />
								</div>
							</div>
						))}
					</Stack>
				) : myFavorites?.length ? (
					<motion.div
						className="carlen-favorites-grid"
						variants={container}
						initial="hidden"
						animate="visible"
						key={searchFavorites.page}
					>
						{myFavorites?.map((product: Product) => (
							<motion.div variants={item} key={product?._id}>
								<ProductCard product={product} likePropertyHandler={likeProductHandler} myFavorites={true} />
							</motion.div>
						))}
					</motion.div>
				) : (
					<motion.div
						className="carlen-favorites-empty"
						initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
						animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					>
						<span className="empty-icon">
							<FavoriteBorderIcon />
						</span>
						<Typography className="empty-title">{t('No saved cars yet')}</Typography>
						<Typography className="empty-helper">{t('Save vehicles you like and they will appear here.')}</Typography>
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

				{myFavorites?.length ? (
					<motion.div
						className="carlen-favorites-pagination"
						initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
						animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
						transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
					>
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								{t('totalSavedCars', { count: total })}
							</Typography>
						</Stack>
					</motion.div>
				) : null}
			</div>
		);
};

export default MyFavorites;
