import React, { useState } from 'react';
import { Stack, Box, useMediaQuery } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
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
import Link from 'next/link';

interface TopProductsProps {
	initialInput: ProductsInquiry;
}

const TopProducts = (props: TopProductsProps) => {
	const { initialInput } = props;
	const isCompact = useMediaQuery('(max-width:1023px)');
	const isMobile = useMediaQuery('(max-width:768px)');
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

	if (isCompact) {
		return (
			<Stack className={'top-products carlen-top-responsive'}>
				<Stack className={'container'}>
					<Stack component={'header'} className={'top-responsive-header'}>
						<Stack className={'top-responsive-copy'}>
							<span className={'eyebrow'}>{t('Top Rated')}</span>
							<strong>{t('Highest Rated Cars')}</strong>
							<p>{t('Premium vehicles trusted and loved by our community.')}</p>
						</Stack>
						<Link href={'/cars'} className={'top-responsive-view-all'}>
							{t('View All')}
						</Link>
					</Stack>
					<Stack className={'card-box'}>
						{topProducts.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								{t('No cars found')}
							</Box>
						) : (
							<Swiper
								className={'top-product-swiper'}
								slidesPerView={isMobile ? 1.12 : 2}
								spaceBetween={isMobile ? 16 : 18}
								centeredSlides={false}
								grabCursor={true}
							>
								{topProducts.map((product: Product, index: number) => {
									return (
										<SwiperSlide className={'top-product-slide'} key={product?._id}>
											<TopProductCard
												product={product}
												likePropertyHandler={likePropertyHandler}
												index={index}
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
