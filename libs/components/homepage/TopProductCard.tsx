import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Product } from '../../types/product/product';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { formatterStr } from '../../utils';
import { motion, useReducedMotion } from 'framer-motion';

interface TopProductCardProps {
	product: Product;
	likePropertyHandler: any;
	index?: number;
}

const TopProductCard = (props: TopProductCardProps) => {
	const { product, likePropertyHandler, index = 0 } = props;
	const isCompact = useMediaQuery('(max-width:1023px)');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const shouldReduceMotion = useReducedMotion();
	const isLiked = product?.meLiked?.[0]?.myFavorite;
	const imageUrl = `${REACT_APP_API_URL}/${product?.productImages?.[0]}`;

	/** HANDLERS **/
	const pushDetailPageHandler = async (productId: string) => {
		await router.push({pathname: 'cars/detail', query: {id: productId}});
	};


	if (isCompact) {
		return (
			<Box component={'article'} className={'top-card-box carlen-top-responsive-card'}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${imageUrl})` }}
					onClick={() => pushDetailPageHandler(product._id)}
				>
					<span className={'top-card-badge'}>Top Rated</span>
					<div className={'top-card-price'}>${formatterStr(product?.productPrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<div className={'meta-row'}>
						<span>{product?.productYear}</span>
						<span>{product?.productType}</span>
						<span>{product?.productLocation}</span>
					</div>
					<strong className={'title'} onClick={() => pushDetailPageHandler(product._id)}>
						{product?.productTitle}
					</strong>
					<p className={'desc'}>{product?.productDesc ?? product?.productAddress}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/car-seat.svg" alt="" />
							<span>{product?.productSeats} seats</span>
						</div>
						<div>
							<img src="/img/icons/car-door.svg" alt="" />
							<span>{product?.productDoors} doors</span>
						</div>
						<div>
							<img src="/img/icons/odometer.svg" alt="" />
							<span>{formatterStr(product?.productMileage)} km</span>
						</div>
					</div>
					<div className={'bott'}>
						<p>
							{product.productTransmission?.toLowerCase()} / {product.productFuelType?.toLowerCase()}
						</p>
						<div className="view-like-box">
							<span className={'stat-chip'}>
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
			</Box>
		);
	} else {
		return (
			<motion.article
				className={'carlen-top-rated-card'}
				onClick={() => pushDetailPageHandler(product._id)}
				initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
				whileInView={
					shouldReduceMotion
						? undefined
						: {
								opacity: 1,
								y: 0,
								transition: { type: 'spring', stiffness: 300, damping: 28, delay: (index % 4) * 0.08 },
						  }
				}
				viewport={{ once: true, margin: '-80px' }}
				whileHover={shouldReduceMotion ? undefined : 'hover'}
				variants={{ hover: { y: -6, transition: { type: 'spring', stiffness: 300, damping: 26 } } }}
			>
				<div className={'carlen-top-rated-image'}>
					<motion.div
						className={'carlen-top-rated-image-bg'}
						style={{ backgroundImage: `url(${imageUrl})` }}
						variants={{ hover: { scale: 1.05 } }}
						transition={{ type: 'spring', stiffness: 220, damping: 30 }}
					/>
					<span className={'carlen-top-rated-badge'}>Top Rated</span>
					<div className={'carlen-top-rated-price-chip'}>${formatterStr(product?.productPrice)}</div>
				</div>
				<div className={'carlen-top-rated-content'}>
					<div className={'carlen-top-rated-meta'}>
						<span>{product?.productYear}</span>
						<span className={'dot'} />
						<span>{product?.productLocation}</span>
						<span className={'dot'} />
						<span>{product?.productType}</span>
					</div>
					<strong className={'carlen-top-rated-title'} onClick={() => pushDetailPageHandler(product._id)}>
						{product?.productTitle}
					</strong>
					<div className={'carlen-top-rated-specs'}>
						<span>{product?.productSeats} seats</span>
						<span>{product?.productDoors} doors</span>
						<span>{formatterStr(product?.productMileage)} km</span>
						<span>{product?.productTransmission?.toLowerCase()}</span>
						<span>{product?.productFuelType?.toLowerCase()}</span>
					</div>
					<div className={'carlen-top-rated-actions'}>
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
								likePropertyHandler(user, product._id);
							}}
						>
							<FavoriteIcon />
							<Typography className={'cnt'}>{product?.productLikes}</Typography>
						</IconButton>
					</div>
				</div>
			</motion.article>
		);
	}
};

export default TopProductCard;
