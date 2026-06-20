import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Product } from '../../types/product/product';
import { REACT_APP_API_URL, topProductRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface PropertyBigCardProps {
	product: Product;
	likePropertyHandler?: any;
}

const PropertyBigCard = (props: PropertyBigCardProps) => {
	const { product, likePropertyHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();

	/** HANDLERS **/
	const goProductDetailPage = (productId: string) => {
		router.push(`/cars/detail?id=${productId}`);
	};

	const liked = product?.meLiked && product?.meLiked[0]?.myFavorite;

	if (device === 'mobile') {
		return (
			<div className={'m-similar-card'} onClick={() => goProductDetailPage(product?._id)}>
				<div
					className={'m-similar-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${product?.productImages?.[0]})` }}
				>
					<button
						type={'button'}
						className={'m-similar-fav'}
						aria-label={'favorite'}
						onClick={(e: any) => {
							e.stopPropagation();
							e.preventDefault();
							likePropertyHandler && likePropertyHandler(user, product?._id);
						}}
					>
						<FavoriteIcon className={liked ? 'liked' : ''} />
					</button>
					<div className={'m-similar-price'}>${formatterStr(product?.productPrice)}</div>
				</div>
				<div className={'m-similar-info'}>
					<strong className={'m-similar-title'}>{product?.productTitle}</strong>
					<p className={'m-similar-addr'}>{product?.productAddress}</p>
					<div className={'m-similar-stats'}>
						<span className={'stat'}>
							<RemoveRedEyeIcon />
							<Typography className={'cnt'}>{product?.productViews}</Typography>
						</span>
						<span className={'stat'}>
							<FavoriteIcon />
							<Typography className={'cnt'}>{product?.productLikes}</Typography>
						</span>
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<motion.div
				className="product-big-card-box carlen-product-big-card"
				onClick={() => goProductDetailPage(product?._id)}
				whileHover={shouldReduceMotion ? undefined : { y: -6 }}
				whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
				transition={{ type: 'spring', stiffness: 320, damping: 30 }}
			>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${product?.productImages?.[0]})` }}
				>
					{product && product?.productRank >= topProductRank && (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					)}

					<motion.button
						type={'button'}
						className={'fav-btn'}
						aria-label={'favorite'}
						whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
						onClick={(e: any) => {
							e.stopPropagation();
							e.preventDefault();
							likePropertyHandler && likePropertyHandler(user, product?._id);
						}}
					>
						{liked ? <FavoriteIcon className={'liked'} /> : <FavoriteIcon />}
					</motion.button>

					<div className={'price'}>${formatterStr(product?.productPrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'}>{product?.productTitle}</strong>
					<p className={'desc'}>{product?.productAddress}</p>
					<div className={'options'}>
						<span className={'spec-chip'}>
							<img src="/img/icons/car-seat.svg" alt="" />
							{product?.productSeats} Seats
						</span>
						<span className={'spec-chip'}>
							<img src="/img/icons/car-door.svg" alt="" />
							{product?.productDoors} Doors
						</span>
						<span className={'spec-chip'}>
							<img src="/img/icons/odometer.svg" alt="" />
							{formatterStr(product?.productMileage)} km
						</span>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<div className={'tags'}>
							<span className={'tag-chip'}>{product?.productTransmission}</span>
							<span className={'tag-chip'}>{product?.productFuelType}</span>
						</div>
						<div className="buttons-box">
							<span className={'stat'}>
								<RemoveRedEyeIcon />
								<Typography className="view-cnt">{product?.productViews}</Typography>
							</span>
							<span className={'stat'}>
								<FavoriteIcon />
								<Typography className="view-cnt">{product?.productLikes}</Typography>
							</span>
						</div>
					</div>
				</Box>
			</motion.div>
		);
	}
};

export default PropertyBigCard;
