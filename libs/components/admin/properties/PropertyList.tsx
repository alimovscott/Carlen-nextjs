import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Menu,
	Fade,
	MenuItem,
} from '@mui/material';
import { Stack } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import Typography from '@mui/material/Typography';
import { Product } from '../../../types/product/product';
import { REACT_APP_API_URL } from '../../../config';
import { ProductStatus } from '../../../enums/product.enum';

const headCells = ['Vehicle', 'Brand', 'Location', 'Status', 'Views', 'Created Date', 'Actions'];

function EnhancedTableHead() {
	return (
		<TableHead>
			<TableRow>
				{headCells.map((label, i) => (
					<TableCell key={label} align={i === 0 ? 'left' : 'center'}>
						{label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface PropertyPanelListType {
	products: Product[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updatePropertyHandler: any;
	removePropertyHandler: any;
}

export const PropertyPanelList = (props: PropertyPanelListType) => {
	const {
		products,
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updatePropertyHandler,
		removePropertyHandler,
	} = props;
	const shouldReduceMotion = useReducedMotion();

	return (
		<Stack className={'cap-table-inner'}>
			<TableContainer>
				<Table aria-labelledby="tableTitle" size={'medium'}>
					<EnhancedTableHead />
					<TableBody>
						{products.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={headCells.length}>
									<div className={'cap-empty'}>
										<span className={'empty-icon'}>
											<DirectionsCarFilledOutlinedIcon />
										</span>
										<strong>No vehicles found</strong>
										<span className={'empty-hint'}>Try a different status tab or location filter.</span>
									</div>
								</TableCell>
							</TableRow>
						)}

						{products.length !== 0 &&
							products.map((product: Product, index: number) => {
								const productImage = `${REACT_APP_API_URL}/${product?.productImages[0]}`;
								const isActive = product.productStatus === ProductStatus.ACTIVE;

								return (
									<motion.tr
										className={'cap-row MuiTableRow-root'}
										key={product?._id}
										initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.32, delay: Math.min(index * 0.03, 0.3), ease: [0.23, 1, 0.32, 1] }}
									>
										{/* VEHICLE */}
										<TableCell align="left">
											<div className={'cap-vehicle'}>
												{isActive ? (
													<Link href={`/cars/detail?id=${product?._id}`} className={'thumb'}>
														<img src={productImage} alt={product.productTitle} />
													</Link>
												) : (
													<div className={'thumb'}>
														<img src={productImage} alt={product.productTitle} />
													</div>
												)}
												<div className={'vehicle-meta'}>
													{isActive ? (
														<Link href={`/cars/detail?id=${product?._id}`} className={'v-title'}>
															{product.productTitle}
														</Link>
													) : (
														<span className={'v-title'}>{product.productTitle}</span>
													)}
													<span className={'v-price'}>${product.productPrice?.toLocaleString()}</span>
													<span className={'v-sub'}>
														{product.productModel} · {product.productYear}
													</span>
												</div>
											</div>
										</TableCell>

										{/* BRAND */}
										<TableCell align="center">{product.productType}</TableCell>

										{/* LOCATION */}
										<TableCell align="center">{product.productLocation}</TableCell>

										{/* STATUS */}
										<TableCell align="center">
											<span className={`cap-pill status-${product.productStatus?.toLowerCase()}`}>
												{product.productStatus}
											</span>
										</TableCell>

										{/* VIEWS */}
										<TableCell align="center">{product.productViews}</TableCell>

										{/* CREATED */}
										<TableCell align="center">{moment(product.createdAt).format('MMM D, YYYY')}</TableCell>

										{/* ACTIONS — behavior preserved per status */}
										<TableCell align="center">
											{product.productStatus === ProductStatus.DELETE && (
												<button
													type={'button'}
													className={'cap-action danger'}
													aria-label={'Remove vehicle'}
													onClick={() => removePropertyHandler(product._id)}
												>
													<DeleteOutlineRoundedIcon fontSize="small" />
												</button>
											)}

											{product.productStatus === ProductStatus.SOLD && <span className={'cap-action-muted'}>—</span>}

											{product.productStatus === ProductStatus.ACTIVE && (
												<>
													<button
														type={'button'}
														className={'cap-action'}
														aria-label={'Change status'}
														onClick={(e: any) => menuIconClickHandler(e, index)}
													>
														<MoreVertRoundedIcon fontSize="small" />
													</button>

													<Menu
														className={'menu-modal carlen-admin-action-menu'}
														MenuListProps={{ 'aria-labelledby': 'fade-button' }}
														anchorEl={anchorEl[index]}
														open={Boolean(anchorEl[index])}
														onClose={menuIconCloseHandler}
														TransitionComponent={Fade}
														sx={{ p: 1 }}
													>
														{Object.values(ProductStatus)
															.filter((ele) => ele !== product.productStatus)
															.map((status: string) => (
																<MenuItem
																	onClick={() => updatePropertyHandler({ _id: product._id, productStatus: status })}
																	key={status}
																	className={status === ProductStatus.DELETE ? 'danger' : ''}
																>
																	<Typography variant={'subtitle1'} component={'span'}>
																		{status}
																	</Typography>
																</MenuItem>
															))}
													</Menu>
												</>
											)}
										</TableCell>
									</motion.tr>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
