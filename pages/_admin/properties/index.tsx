import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Select } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { motion, useReducedMotion } from 'framer-motion';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { PropertyPanelList } from '../../../libs/components/admin/properties/PropertyList';
import { AllProductsInquiry } from '../../../libs/types/product/product.input';
import { Product } from '../../../libs/types/product/product';
import { ProductLocation, ProductStatus } from '../../../libs/enums/product.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { ProductUpdate } from '../../../libs/types/product/product.update';
import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_PRODUCT_BY_ADMIN, UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminProducts: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [productsInquiry, setProductsInquiry] = useState<AllProductsInquiry>(initialInquiry);
	const [products, setProducts] = useState<Product[]>([]);
	const [productsTotal, setPropertiesTotal] = useState<number>(0);
	const [value, setValue] = useState(
		productsInquiry?.search?.productStatus ? productsInquiry?.search?.productStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');
	const shouldReduceMotion = useReducedMotion();

	/** APOLLO REQUESTS **/
	const [updatePropertyByAdmin] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const [removePropertyByAdmin] = useMutation(REMOVE_PRODUCT_BY_ADMIN);

	const {
		loading: getAllProductsByAdminLoading,
		error: getAllProductsByAdminError,
		data: getAllProductsByAdminData,
		refetch: getAllProductsByAdminRefetch,
	} = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: productsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getAllProductsByAdmin?.list);
			setPropertiesTotal(data?.getAllProductsByAdmin?.metaCounter[0]?.total ?? 0);
		}
	});

	/**
	 * KPI / tab-badge counts — additive, READ-ONLY reuse of the SAME admin query
	 * with status-scoped variables. No new GraphQL operation, no backend change.
	 */
	const countVars = (status?: ProductStatus) => ({
		input: { page: 1, limit: 1, sort: 'createdAt', direction: 'DESC', search: status ? { productStatus: status } : {} },
	});
	const { data: totalCountData, refetch: refetchTotalCount } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: countVars(),
	});
	const { data: activeCountData, refetch: refetchActiveCount } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: countVars(ProductStatus.ACTIVE),
	});
	const { data: soldCountData, refetch: refetchSoldCount } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: countVars(ProductStatus.SOLD),
	});
	const { data: deletedCountData, refetch: refetchDeletedCount } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: countVars(ProductStatus.DELETE),
	});

	const readTotal = (d: T) => d?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalCount = readTotal(totalCountData);
	const activeCount = readTotal(activeCountData);
	const soldCount = readTotal(soldCountData);
	const deletedCount = readTotal(deletedCountData);

	const refetchCounts = async () => {
		await Promise.all([refetchTotalCount(), refetchActiveCount(), refetchSoldCount(), refetchDeletedCount()]);
	};

	const KPIS = [
		{ key: 'total', label: 'Total inventory', value: totalCount, Icon: Inventory2OutlinedIcon, tone: 'neutral' },
		{ key: 'active', label: 'Active vehicles', value: activeCount, Icon: DirectionsCarFilledOutlinedIcon, tone: 'active' },
		{ key: 'sold', label: 'Sold vehicles', value: soldCount, Icon: SellOutlinedIcon, tone: 'sold' },
		{ key: 'deleted', label: 'Deleted vehicles', value: deletedCount, Icon: DeleteOutlineRoundedIcon, tone: 'deleted' },
	];
	const TABS = [
		{ id: 'ALL', label: 'All', count: totalCount },
		{ id: 'ACTIVE', label: 'Active', count: activeCount },
		{ id: 'SOLD', label: 'Sold', count: soldCount },
		{ id: 'DELETE', label: 'Deleted', count: deletedCount },
	];

	/** LIFECYCLES **/
	useEffect(() => {}, [productsInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		productsInquiry.page = newPage + 1;
		await getAllProductsByAdminRefetch({ input: productsInquiry });
		setProductsInquiry({ ...productsInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		productsInquiry.limit = parseInt(event.target.value, 10);
		productsInquiry.page = 1;
		await getAllProductsByAdminRefetch({ input: productsInquiry });
		setProductsInquiry({ ...productsInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);

		const baseInquiry = { ...productsInquiry, page: 1, sort: 'createdAt' };
		const { productStatus, ...restSearch } = productsInquiry.search ?? {};

		switch (newValue) {
			case 'ACTIVE':
				setProductsInquiry({ ...baseInquiry, search: { ...restSearch, productStatus: ProductStatus.ACTIVE } });
				break;
			case 'SOLD':
				setProductsInquiry({ ...baseInquiry, search: { ...restSearch, productStatus: ProductStatus.SOLD } });
				break;
			case 'DELETE':
				setProductsInquiry({ ...baseInquiry, search: { ...restSearch, productStatus: ProductStatus.DELETE } });
				break;
			default:
				setProductsInquiry({ ...baseInquiry, search: { ...restSearch } });
				break;
		}
	};

	const removePropertyHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removePropertyByAdmin({
					variables: {
						input: id,
					},
				});
				await getAllProductsByAdminRefetch({ input: productsInquiry });
				await refetchCounts();
			}
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setProductsInquiry({
					...productsInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...productsInquiry.search,
						productLocationList: [newValue as ProductLocation],
					},
				});
			} else {
				const { productLocationList, ...restSearch } = productsInquiry.search ?? {};
				setProductsInquiry({ ...productsInquiry, page: 1, sort: 'createdAt', search: { ...restSearch } });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updatePropertyHandler = async (updateData: ProductUpdate) => {
		try {
			await updatePropertyByAdmin({
				variables: {
					input: updateData,
				},
			});

			menuIconCloseHandler();
			await getAllProductsByAdminRefetch({ input: productsInquiry });
			await refetchCounts();
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	const stagger = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06 } },
	};
	const fadeItem = {
		hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
	};

	return (
		<Box component={'div'} className={'content carlen-admin-products'}>
			<motion.div
				className={'cap-shell'}
				initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
			>
				{/* HEADER + KPI */}
				<div className={'cap-head'}>
					<div className={'cap-title'}>
						<span className={'eyebrow'}>OPERATIONS</span>
						<h1>Product Management</h1>
						<p>Monitor and manage the Carlen vehicle inventory.</p>
					</div>
				</div>

				<motion.div className={'cap-kpis'} variants={stagger} initial={'hidden'} animate={'visible'}>
					{KPIS.map((k) => (
						<motion.div className={`cap-kpi tone-${k.tone}`} key={k.key} variants={fadeItem}>
							<span className={'kpi-icon'}>
								<k.Icon />
							</span>
							<div className={'kpi-meta'}>
								<span className={'kpi-label'}>{k.label}</span>
								<strong className={'kpi-value'}>{k.value}</strong>
							</div>
						</motion.div>
					))}
				</motion.div>

				{/* TOOLBAR: segmented tabs + filter */}
				<TabContext value={value}>
					<div className={'cap-toolbar'}>
						<div className={'cap-tabs'} role={'tablist'}>
							{TABS.map((tab) => (
								<button
									type={'button'}
									role={'tab'}
									aria-selected={value === tab.id}
									key={tab.id}
									className={`cap-tab ${value === tab.id ? 'active' : ''}`}
									onClick={(e: any) => tabChangeHandler(e, tab.id)}
								>
									{tab.label}
									<span className={'tab-badge'}>{tab.count}</span>
								</button>
							))}
						</div>

						<div className={'cap-filter'}>
							<Select
								className={'cap-location-select'}
								value={searchType}
								MenuProps={{ classes: { paper: 'carlen-admin-select-menu' } }}
							>
								<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
									All locations
								</MenuItem>
								{Object.values(ProductLocation).map((location: string) => (
									<MenuItem value={location} onClick={() => searchTypeHandler(location)} key={location}>
										{location}
									</MenuItem>
								))}
							</Select>
						</div>
					</div>

					{/* TABLE */}
					<div className={'cap-table'}>
						<PropertyPanelList
							products={products}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updatePropertyHandler={updatePropertyHandler}
							removePropertyHandler={removePropertyHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={productsTotal}
							rowsPerPage={productsInquiry?.limit}
							page={productsInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</div>
				</TabContext>
			</motion.div>
		</Box>
	);
};

AdminProducts.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminProducts);
