import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Product } from '../../types/product/product';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EastIcon from '@mui/icons-material/East';
import { REACT_APP_API_URL, topProductRank } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { formatterStr } from '../../utils';
import { motion, useReducedMotion } from 'framer-motion';

interface PopularProductCardProps {
	product: Product;
	variant?: 'featured' | 'standard';
	likePropertyHandler?: any;
	index?: number;
}

const getBadge = (p: Product): { label: string; tone: 'red' | 'blue' } => {
	if (p?.productRank >= topProductRank) return { label: 'TOP PICK', tone: 'red' };
	if (p?.productYear >= new Date().getFullYear() - 1) return { label: 'NEW ARRIVAL', tone: 'blue' };
	if (p?.productMileage <= 30000) return { label: 'LOW MILEAGE', tone: 'blue' };
	return { label: 'POPULAR', tone: 'red' };
};

const PopularProductCard = (props: PopularProductCardProps) => {
	const { product, variant = 'standard', likePropertyHandler, index = 0 } = props;
	const isCompact = useMediaQuery('(max-width:1023px)');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isLiked = product?.meLiked?.[0]?.myFavorite;
	const badge = getBadge(product);
	const shouldReduceMotion = useReducedMotion();
	const transmissionLabel = product.productTransmission
		? product.productTransmission.toLowerCase()
		: 'transmission';
	const fuelLabel = product.productFuelType ? product.productFuelType.toLowerCase() : 'fuel';

	/** HANDLERS **/
	const pushDetailHandler = async (productId: string) => {
		await router.push({pathname: 'cars/detail', query: {id: productId}});
	};

	if (isCompact) {
		return (
			<Box component={'article'} className={'popular-card-box carlen-popular-responsive-card'}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${product?.productImages?.[0]})` }}
					onClick={() => pushDetailHandler(product._id)}
				>
					<span className={'popular-card-badge'}>Popular</span>
					<div className={'popular-card-price'}>${formatterStr(product.productPrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<div className="meta-row">
						<span>{product.productYear}</span>
						<span>{product.productType}</span>
						<span>{product.productLocation}</span>
					</div>
					<strong className={'title'} onClick={() => pushDetailHandler(product._id)}>
						{product.productTitle}
					</strong>
					<p className={'desc'}>{product.productDesc ?? 'Fresh vehicle listing with verified details.'}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/car-seat.svg" alt="" />
							<span>{product.productSeats} seats</span>
						</div>
						<div>
							<img src="/img/icons/car-door.svg" alt="" />
							<span>{product.productDoors} doors</span>
						</div>
						<div>
							<img src="/img/icons/odometer.svg" alt="" />
							<span>{formatterStr(product.productMileage)} km</span>
						</div>
					</div>
					<div className={'bott'}>
						<p>
							{transmissionLabel} / {fuelLabel}
						</p>
						<div className="view-like-box">
							<span className="stat-chip">
								<RemoveRedEyeIcon />
								<Typography className="view-cnt">{product?.productViews}</Typography>
							</span>
							<IconButton
								className={isLiked ? 'like-button active' : 'like-button'}
								color={'default'}
								aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
								onClick={() => likePropertyHandler && likePropertyHandler(user, product._id)}
							>
								<FavoriteIcon />
							</IconButton>
							<Typography className="view-cnt">{product?.productLikes}</Typography>
						</div>
					</div>
				</Box>
			</Box>
		);
	} else {
		return (
			<motion.article
				className={`carlen-popular-card ${variant}`}
				onClick={() => pushDetailHandler(product._id)}
				initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
				whileInView={
					shouldReduceMotion
						? undefined
						: {
								opacity: 1,
								y: 0,
								transition: { type: 'spring', stiffness: 300, damping: 26, delay: index * 0.08 },
						  }
				}
				viewport={{ once: true, margin: '-60px' }}
				whileHover={shouldReduceMotion ? undefined : 'hover'}
				variants={{ hover: { y: -8, transition: { type: 'spring', stiffness: 300, damping: 26 } } }}
			>
				<motion.div
					className={'carlen-popular-image'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${product?.productImages?.[0]})` }}
					variants={{ hover: { scale: 1.04 } }}
					transition={{ type: 'spring', stiffness: 220, damping: 28 }}
				>
					<span className={`carlen-popular-badge ${badge.tone}`}>{badge.label}</span>
					<div className={'carlen-popular-price'}>${formatterStr(product.productPrice)}</div>
				</motion.div>
				<div className={'carlen-popular-meta'}>
					<div className={'meta-top'}>
						<span className={'year'}>{product.productYear}</span>
						<span className={'dot'} />
						<span className={'location'}>{product.productLocation}</span>
					</div>
					<strong className={'model'}>{product.productTitle}</strong>
					<div className={'spec-row'}>
						<span>{product.productFuelType?.toLowerCase()}</span>
						<span>{product.productTransmission?.toLowerCase()}</span>
						<span>{formatterStr(product.productMileage)} km</span>
					</div>
					<div className={'carlen-popular-actions'}>
						<div className={'stats'}>
							<span className={'stat'}>
								<RemoveRedEyeIcon />
								<Typography className={'cnt'}>{product?.productViews}</Typography>
							</span>
							<IconButton
								className={isLiked ? 'like active' : 'like'}
								color={'default'}
								aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
								onClick={(e) => {
									e.stopPropagation();
									likePropertyHandler && likePropertyHandler(user, product._id);
								}}
							>
								<FavoriteIcon />
								<Typography className={'cnt'}>{product?.productLikes}</Typography>
							</IconButton>
						</div>
						<span
							className={'go'}
							aria-label={'View details'}
							onClick={(e) => {
								e.stopPropagation();
								pushDetailHandler(product._id);
							}}
						>
							<EastIcon />
						</span>
					</div>
				</div>
			</motion.article>
		);
	}
};

export default PopularProductCard;
