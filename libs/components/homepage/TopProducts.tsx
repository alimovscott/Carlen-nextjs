import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import TopProductCard from './TopProductCard';
import { ProductsInquiry } from '../../types/product/product.input';
import { Product } from '../../types/product/product';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

interface TopProductsProps {
	initialInput: ProductsInquiry;
}

const TopProducts = (props: TopProductsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [topProducts, setTopProducts] = useState<Product[]>([]);

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
					setTopProducts(data?.getProducts?.list);
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

	if (device === 'mobile') {
		return (
			<Stack className={'top-products'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>{t('Top Rated Cars')}</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-product-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={15}
							modules={[Autoplay]}
						>
							{topProducts.map((product: Product) => {
								return (
									<SwiperSlide className={'top-product-slide'} key={product?._id}>
										<TopProductCard product={product} likePropertyHandler={likePropertyHandler}/>
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-products carlen-top-rated'}>
				<Stack className={'container'}>
					<Stack className={'carlen-top-rated-header'}>
						<Box component={'div'} className={'carlen-top-rated-head-left'}>
							<span className={'carlen-top-rated-eyebrow'}>{t('Premium Picks')}</span>
							<h2 className={'carlen-top-rated-title'}>{t('Top Rated Cars')}</h2>
							<p className={'carlen-top-rated-subtitle'}>
								{t('Hand-picked premium vehicles selected for performance and reliability.')}
							</p>
						</Box>
					</Stack>
					<div className={'carlen-top-rated-grid'}>
						{topProducts.slice(0, 4).map((product: Product, index: number) => (
							<TopProductCard
								key={product?._id}
								product={product}
								likePropertyHandler={likePropertyHandler}
								index={index}
							/>
						))}
					</div>
				</Stack>
			</Stack>
		);
	}
};

TopProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 4,
		sort: 'productRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopProducts;
