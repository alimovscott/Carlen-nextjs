import React from 'react';
import { Box, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Product } from '../../types/product/product';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { motion, useReducedMotion } from 'framer-motion';
import { formatterStr } from '../../utils';

interface TrendProductCardProps {
	product: Product;
	likePropertyHandler: any;
}

const TrendProductCard = (props: TrendProductCardProps) => {
	const { product, likePropertyHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const shouldReduceMotion = useReducedMotion();
	const isLiked = product?.meLiked?.[0]?.myFavorite;
	const imageUrl = `${REACT_APP_API_URL}/${product?.productImages?.[0]}`;
	const transmissionLabel = product.productTransmission
		? product.productTransmission.toLowerCase()
		: 'transmission';
	const fuelLabel = product.productFuelType ? product.productFuelType.toLowerCase() : 'fuel';

	/** HANDLERS **/
	const pushDetailHandler = async (productId: string) => {
		await router.push({ pathname: 'cars/detail', query: { id: productId } });
	};

	return (
		<motion.article
			className="trend-card-box"
			key={product._id}
			initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
			animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
			whileHover={shouldReduceMotion ? undefined : { y: -6 }}
			whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
			transition={{ type: 'spring', stiffness: 300, damping: 26 }}
		>
			<Box
				component={motion.div}
				className={'card-img'}
				style={{ backgroundImage: `url(${imageUrl})` }}
				whileHover={shouldReduceMotion ? undefined : { scale: 1.025 }}
				transition={{ type: 'spring', stiffness: 260, damping: 30 }}
				onClick={() => {
					pushDetailHandler(product._id);
				}}
			>
				<span className="trend-badge">Trending</span>
				<div className="price-badge">${formatterStr(product.productPrice)}</div>
			</Box>
			<Box component={'div'} className={'info'}>
				<div className="meta-row">
					<span>{product.productYear}</span>
					<span>{product.productType}</span>
				</div>
				<strong
					className={'title'}
					onClick={() => {
						pushDetailHandler(product._id);
					}}
				>
					{product.productTitle}
				</strong>
				<p className={'desc'}>{product.productDesc ?? 'Fresh vehicle listing with verified details.'}</p>
				<div className={'options'}>
					<div>
						<img src="/img/icons/bed.svg" alt="" />
						<span>{product.productSeats} seats</span>
					</div>
					<div>
						<img src="/img/icons/room.svg" alt="" />
						<span>{product.productDoors} doors</span>
					</div>
					<div>
						<img src="/img/icons/expand.svg" alt="" />
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
							onClick={() => likePropertyHandler(user, product._id)}
						>
							<FavoriteIcon />
						</IconButton>
						<Typography className="view-cnt">{product?.productLikes}</Typography>
					</div>
				</div>
			</Box>
		</motion.article>
	);
};

export default TrendProductCard;
