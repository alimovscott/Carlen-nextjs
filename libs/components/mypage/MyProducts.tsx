import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import { PropertyCard } from './ProductCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Product } from '../../types/product/product';
import { AgentProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import { ProductStatus } from '../../enums/product.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { GET_AGENT_PRODUCTS, GET_MEMBER } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { useTranslation } from 'next-i18next';

const MyProducts: NextPage = ({ initialInput, ...props }: any) => {
	const shouldReduceMotion = useReducedMotion();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<AgentProductsInquiry>(initialInput);
	const [agentProducts, setAgentProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [activeCount, setActiveCount] = useState<number>(0);
	const [soldCount, setSoldCount] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const {
		loading: getAgentProductsLoading,
		data: getAgentProductsData,
		error: getAgentProductsError,
		refetch: getAgentProductsRefetch,
	} = useQuery(GET_AGENT_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProducts(data?.getAgentProducts?.list);
			setTotal(data?.getAgentProducts?.metaCounter[0]?.total);
		},
	});

	// Lightweight read-only counts for the stats cards (reuses GET_AGENT_PRODUCTS).
	useQuery(GET_AGENT_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', search: { productStatus: ProductStatus.ACTIVE } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setActiveCount(data?.getAgentProducts?.metaCounter[0]?.total || 0);
		},
	});

	useQuery(GET_AGENT_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', search: { productStatus: ProductStatus.SOLD } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSoldCount(data?.getAgentProducts?.metaCounter[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: ProductStatus) => {
		setSearchFilter({ ...searchFilter, search: { productStatus: value } });
	};

	const deleteProductHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert(t('Are you sure you want to delete this car?'))) {
				await updateProduct({
					variables: {
						input: {
							_id: id,
							productStatus: 'DELETE',
						},
					},
					refetchQueries: user?._id ? [{ query: GET_MEMBER, variables: { input: user._id } }] : [],
					awaitRefetchQueries: true,
				});

				await getAgentProductsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updateProductStatusHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(t('Are you sure to change this status?'))) {
				await updateProduct({
					variables: {
						input: {
							_id: id,
							productStatus: status,
						},
					},
					refetchQueries: user?._id ? [{ query: GET_MEMBER, variables: { input: user._id } }] : [],
					awaitRefetchQueries: true,
				});
				await getAgentProductsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const addNewCarHandler = () => {
		router.push({ pathname: '/mypage', query: { category: 'addCar' } });
	};

	/** ANIMATION **/
	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.07, delayChildren: 0.04 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
	};

	const isActiveTab = searchFilter.search.productStatus === 'ACTIVE';

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	return (
			<div id="carlen-my-products-page">
				<motion.div className="inventory-header-block" variants={container} initial="hidden" animate="visible">
					<motion.div className="head-text" variants={item}>
						<span className="eyebrow">{t('Dealer Inventory')}</span>
						<Typography className="title">{t('Manage Your Vehicle Listings')}</Typography>
						<Typography className="subtitle">
							{t('Track active and sold vehicles, update status, and manage your Carlen inventory.')}
						</Typography>
					</motion.div>

					<motion.div className="carlen-inventory-stats" variants={item}>
						<Stack className="stat-card">
							<Typography className="stat-value">{activeCount}</Typography>
							<Typography className="stat-label">{t('Active Listings')}</Typography>
						</Stack>
						<Stack className="stat-card">
							<Typography className="stat-value">{soldCount}</Typography>
							<Typography className="stat-label">{t('Sold Vehicles')}</Typography>
						</Stack>
						<Stack className="stat-card">
							<Typography className="stat-value">{activeCount + soldCount}</Typography>
							<Typography className="stat-label">{t('Total Inventory')}</Typography>
						</Stack>
					</motion.div>
				</motion.div>

				<Stack className="carlen-inventory-panel">
					<Stack className="carlen-inventory-tabs">
						<Typography
							onClick={() => changeStatusHandler(ProductStatus.ACTIVE)}
							className={isActiveTab ? 'segment active' : 'segment'}
						>
							{t('On Sale')}
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(ProductStatus.SOLD)}
							className={searchFilter.search.productStatus === 'SOLD' ? 'segment active' : 'segment'}
						>
							{t('Sold')}
						</Typography>
					</Stack>

					<Stack className="carlen-inventory-list">
						<Stack className="carlen-inventory-header">
							<Typography className="col-vehicle title-text">{t('Vehicle')}</Typography>
							<Typography className="title-text">{t('Published')}</Typography>
							<Typography className="title-text">{t('Status')}</Typography>
							<Typography className="title-text">{t('Views')}</Typography>
							{isActiveTab && <Typography className="title-text">{t('Actions')}</Typography>}
						</Stack>

						{getAgentProductsLoading && agentProducts.length === 0 ? (
							<Stack className="inventory-skeleton-list">
								{Array.from({ length: 5 }).map((_, idx) => (
									<div className="inventory-skeleton" key={idx}>
										<span className="sk-thumb" />
										<div className="sk-lines">
											<span className="sk-line w-70" />
											<span className="sk-line w-40" />
										</div>
										<span className="sk-pill" />
									</div>
								))}
							</Stack>
						) : agentProducts?.length === 0 ? (
							<Stack className="carlen-inventory-empty">
								<span className="empty-icon">
									<DirectionsCarFilledOutlinedIcon />
								</span>
								<Typography className="empty-title">{t('No vehicles found')}</Typography>
								<Typography className="empty-helper">{t('Create your first listing or switch inventory status.')}</Typography>
								<motion.button
									type="button"
									className="cta-primary"
									onClick={addNewCarHandler}
									whileHover={shouldReduceMotion ? undefined : { y: -2 }}
									whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
								>
									<AddRoundedIcon />
									{t('Add New Car')}
								</motion.button>
							</Stack>
						) : (
							<motion.div
								className="inventory-rows"
								variants={container}
								initial="hidden"
								animate="visible"
								key={`${searchFilter.search.productStatus ?? ''}-${searchFilter.page}`}
							>
								{agentProducts.map((product: Product) => (
									<motion.div variants={item} key={product?._id}>
										<PropertyCard
											product={product}
											deletePropertyHandler={deleteProductHandler}
											updatePropertyHandler={updateProductStatusHandler}
										/>
									</motion.div>
								))}
							</motion.div>
						)}

						{agentProducts.length !== 0 && (
							<Stack className="carlen-inventory-pagination">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>
										{t('totalCarsAvailable', { count: total })}
									</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
};

MyProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			productStatus: 'ACTIVE',
		},
	},
};

export default MyProducts;
