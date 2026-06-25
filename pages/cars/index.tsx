import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/product/Filter';
import { useRouter } from 'next/router';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Product } from '../../libs/types/product/product';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ProductCard from '../../libs/components/product/PropductCard';
import { sanitizeProductsInquiry } from '../../libs/utils';
import { motion, useReducedMotion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const { t } = useTranslation('common');
	const parseInput = (input: any) => {
		try {
			return input ? sanitizeProductsInquiry(JSON.parse(input as string), initialInput) : sanitizeProductsInquiry(initialInput);
		} catch (err: any) {
			console.log('ERROR, parseInput:', err.message);
			return sanitizeProductsInquiry(initialInput);
		}
	};
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(parseInput(router?.query?.input));
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurautomaticPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);


	const likePropertyHandler = async (user: T, id: string) => {
			try {
				if (!id) return;
				if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
	
				await likeTargetProduct({ variables: { input: id } });
	
				await getProductsRefetch({ input: initialInput });
	
				await sweetTopSmallSuccessAlert('success', 800);
			} catch (err: any) {
				console.log('ERROR, likePropertyHandler:', err.message);
				sweetMixinErrorAlert(err.message).then();
			}
		};
	const {
			loading: getProductsLoading,
			data: getProductsData,
			error: getProductsError,
			refetch: getProductsRefetch,
		} = useQuery(GET_PRODUCTS, {
			fetchPolicy: 'network-only',
			variables: { input: sanitizeProductsInquiry(searchFilter, initialInput) },
			notifyOnNetworkStatusChange: true,
			onCompleted: (data: T) => {
				setProducts(data?.getProducts?.list);
				setTotal(data?.getProducts?.metaCounter[0]?.total);
			},
		});

	/** LIFECYCLES **/
	useEffect(() => {
		const nextInput = parseInput(router.query.input);
		setSearchFilter(nextInput);

		setCurautomaticPage(nextInput.page === undefined ? 1 : nextInput.page);
	}, [router.query.input]);

	useEffect(() => {}, [searchFilter]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const nextInput = sanitizeProductsInquiry({ ...searchFilter, page: value }, initialInput);
		await router.push(
			`/cars?input=${JSON.stringify(nextInput)}`,
			`/cars?input=${JSON.stringify(nextInput)}`,
			{
				scroll: false,
			},
		);
		setCurautomaticPage(value);
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = async (e: React.MouseEvent<HTMLLIElement>) => {
		let nextInput = searchFilter;
		switch (e.currentTarget.id) {
			case 'new':
				nextInput = sanitizeProductsInquiry({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC }, initialInput);
				setFilterSortName('New');
				break;
			case 'lowest':
				nextInput = sanitizeProductsInquiry({ ...searchFilter, sort: 'productPrice', direction: Direction.ASC }, initialInput);
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				nextInput = sanitizeProductsInquiry({ ...searchFilter, sort: 'productPrice', direction: Direction.DESC }, initialInput);
				setFilterSortName('Highest Price');
		}
		setSearchFilter(nextInput);
		await router.push(
			`/cars?input=${JSON.stringify(nextInput)}`,
			`/cars?input=${JSON.stringify(nextInput)}`,
			{ scroll: false },
		);
		setSortingOpen(false);
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <h1>PROPERTIES MOBILE</h1>;
	} else {
		const listContainer = {
			hidden: {},
			visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.05, delayChildren: 0.04 } },
		};
		const listItem = {
			hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
			visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 30 } },
		};
		return (
			<div id="carlen-product-list-page" style={{ position: 'relative' }}>
				<div className="container">
					<Box component={'div'} className={'right'}>
						<span>{t('Sort by')}</span>
						<div>
							<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
								{t(filterSortName)}
							</Button>
							<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
								<MenuItem
									onClick={sortingHandler}
									id={'new'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									{t('New')}
								</MenuItem>
								<MenuItem
									onClick={sortingHandler}
									id={'lowest'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									{t('Lowest Price')}
								</MenuItem>
								<MenuItem
									onClick={sortingHandler}
									id={'highest'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									{t('Highest Price')}
								</MenuItem>
							</Menu>
						</div>
					</Box>
					<Stack className={'carlen-product-page'}>
						<Stack className={'filter-config'}>
							{/* @ts-ignore */}
							<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} total={total} />
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							{getProductsLoading && products.length === 0 ? (
								<Stack className={'carlen-product-loading'}>
									<CircularProgress />
									<p>{t('Finding premium cars')}</p>
								</Stack>
							) : products?.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>{t('No cars found')}</p>
									<span>{t('Try adjusting your filters to see more cars.')}</span>
								</div>
							) : (
								<motion.div
									className={'carlen-product-list'}
									variants={listContainer}
									initial={'hidden'}
									animate={'visible'}
								>
									{products.map((product: Product) => (
										<motion.div className={'carlen-product-card-anim'} variants={listItem} key={product?._id}>
											<ProductCard product={product} likePropertyHandler={likePropertyHandler} />
										</motion.div>
									))}
								</motion.div>
							)}
							<Stack className="pagination-config">
								{products.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}

								{products.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											{t('totalCarsAvailable', { count: total })}
										</Typography>
									</Stack>
								)}
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

ProductList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			mileageRange: {
				start: 0,
				end: 99999999,
			},
			pricesRange: {
				start: 0,
				end: 20000000,
			},
		},
	},
};

export default withLayoutBasic(ProductList);
