import React, { useState } from 'react';
import { Stack, Box, useMediaQuery } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import PopularProductCard from './PopularProductCard';
import { Product } from '../../types/product/product';
import Link from 'next/link';
import { ProductsInquiry } from '../../types/product/product.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { T } from '../../types/common';
import { useTranslation } from 'next-i18next';

interface PopularProductsProps {
	initialInput: ProductsInquiry;
}

const PopularProducts = (props: PopularProductsProps) => {
	const { initialInput } = props;
	const isCompact = useMediaQuery('(max-width:1023px)');
	const isMobile = useMediaQuery('(max-width:768px)');
	const { t } = useTranslation('common');
	const [popularProducts, setPopularProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const {
			loading: getPropertiesLoading,
			data: getPropertiesData,
			error: getPropertiesError,
			refetch: getPropertiesRefetch
		} = useQuery(GET_PRODUCTS, {
			fetchPolicy: 'cache-and-network',
			variables: {input: initialInput},
			notifyOnNetworkStatusChange: true,
			onCompleted	: (data: T) => {
				setPopularProducts(data?.getProducts?.list);
			}
		});
	/** HANDLERS **/
	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProduct({ variables: { input: id } });

			await getPropertiesRefetch({ input: initialInput });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!popularProducts) return null;

	if (isCompact) {
		return (
			<Stack className={'popular-products carlen-popular-responsive'}>
				<Stack className={'container'}>
					<Stack component={'header'} className={'popular-responsive-header'}>
						<Stack className={'popular-responsive-copy'}>
							<span className={'eyebrow'}>{t('Popular Selection')}</span>
							<strong>{t('Discover Popular Cars')}</strong>
							<p>{t('Browse the vehicles most loved by our community.')}</p>
						</Stack>
						<Link href={'/cars'} className={'popular-responsive-view-all'}>
							{t('View All')}
						</Link>
					</Stack>
					<Stack className={'card-box'}>
						{popularProducts.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								{t('No cars found')}
							</Box>
						) : (
							<Swiper
								className={'popular-product-swiper'}
								slidesPerView={isMobile ? 1.12 : 2}
								spaceBetween={isMobile ? 16 : 18}
								grabCursor={true}
								centeredSlides={false}
							>
								{popularProducts.map((product: Product) => {
									return (
										<SwiperSlide key={product._id} className={'popular-product-slide'}>
											<PopularProductCard
												product={product}
												likePropertyHandler={likePropertyHandler}
											/>
										</SwiperSlide>
									);
								})}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'popular-products carlen-popular-products'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>{t('Popular Cars')}</span>
							<p>{t('Most loved premium vehicles chosen by our community')}</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<Link href={'/cars'}>
									<span>{t('View All Cars')}</span>
								</Link>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<div className={'carlen-popular-grid'}>
						{popularProducts[0] && (
							<PopularProductCard
								product={popularProducts[0]}
								variant={'featured'}
								likePropertyHandler={likePropertyHandler}
								index={0}
							/>
						)}
						<div className={'carlen-popular-stack'}>
							{popularProducts.slice(1, 3).map((product: Product, i: number) => (
								<PopularProductCard
									key={product._id}
									product={product}
									variant={'standard'}
									likePropertyHandler={likePropertyHandler}
									index={i + 1}
								/>
							))}
						</div>
					</div>
				</Stack>
			</Stack>
		);
	}
};

PopularProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 7,
		sort: 'productViews',
		direction: 'DESC',
		search: {},
	},
};

export default PopularProducts;
