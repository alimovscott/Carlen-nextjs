import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyCard } from '../mypage/ProductCard';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';

const MyProducts: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const shouldReduceMotion = useReducedMotion();
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>({ ...initialInput });
	const [agentProducts, setAgentProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProducts(data?.getProducts?.list);
			setTotal(data?.getProducts?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		getPropertiesRefetch({ input: searchFilter }).then();
	}, [searchFilter]);

	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
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

	if (device === 'mobile') {
		return (
			<div id="carlen-member-products-page">
				<motion.div className="carlen-products-header" variants={container} initial="hidden" animate="visible">
					<motion.div className="head-text" variants={item}>
						<span className="eyebrow">DEALER INVENTORY</span>
						<Typography className="title">Available Vehicles</Typography>
						<Typography className="subtitle">Explore vehicles currently listed by this dealer.</Typography>
					</motion.div>
					<motion.div className="inventory-count-badge" variants={item}>
						{total} Cars Available
					</motion.div>
				</motion.div>

				<Stack className="carlen-products-panel">
					<Stack className="carlen-products-content">
						{getPropertiesLoading && agentProducts.length === 0 ? (
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
							<Stack className="carlen-products-empty">
								<span className="empty-icon">
									<DirectionsCarFilledOutlinedIcon />
								</span>
								<Typography className="empty-title">No Vehicles Available</Typography>
								<Typography className="empty-helper">This dealer has not listed any vehicles yet.</Typography>
							</Stack>
						) : (
							<motion.div
								className="inventory-rows"
								variants={container}
								initial="hidden"
								animate="visible"
								key={searchFilter.page}
							>
								{agentProducts.map((product: Product) => (
									<motion.div
										variants={item}
										whileHover={shouldReduceMotion ? undefined : { y: -4 }}
										key={product?._id}
									>
										<PropertyCard product={product} memberPage={true} />
									</motion.div>
								))}
							</motion.div>
						)}

						{agentProducts.length !== 0 && (
							<Stack className="carlen-products-pagination">
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
										{total} vehicle{total > 1 ? 's' : ''} available
									</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	} else {
		return (
			<div id="carlen-member-products-page">
				<motion.div className="carlen-products-header" variants={container} initial="hidden" animate="visible">
					<motion.div className="head-text" variants={item}>
						<span className="eyebrow">DEALER INVENTORY</span>
						<Typography className="title">Available Vehicles</Typography>
						<Typography className="subtitle">Explore vehicles currently listed by this dealer.</Typography>
					</motion.div>
					<motion.div className="inventory-count-badge" variants={item}>
						{total} Cars Available
					</motion.div>
				</motion.div>

				<Stack className="carlen-products-panel">
					<Stack className="carlen-products-content">
						{getPropertiesLoading && agentProducts.length === 0 ? (
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
							<Stack className="carlen-products-empty">
								<span className="empty-icon">
									<DirectionsCarFilledOutlinedIcon />
								</span>
								<Typography className="empty-title">No Vehicles Available</Typography>
								<Typography className="empty-helper">This dealer has not listed any vehicles yet.</Typography>
							</Stack>
						) : (
							<motion.div
								className="inventory-rows"
								variants={container}
								initial="hidden"
								animate="visible"
								key={searchFilter.page}
							>
								{agentProducts.map((product: Product) => (
									<motion.div
										variants={item}
										whileHover={shouldReduceMotion ? undefined : { y: -4 }}
										key={product?._id}
									>
										<PropertyCard product={product} memberPage={true} />
									</motion.div>
								))}
							</motion.div>
						)}

						{agentProducts.length !== 0 && (
							<Stack className="carlen-products-pagination">
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
										{total} vehicle{total > 1 ? 's' : ''} available
									</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MyProducts;
