import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import SensorDoorOutlinedIcon from '@mui/icons-material/SensorDoorOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { productMileageRange, productYears } from '../../config';
import { ProductFuelType, ProductLocation, ProductTransmission, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { sanitizeProductsInquiry } from '../../utils';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	bgcolor: 'transparent',
	borderRadius: '22px',
	outline: 'none',
	boxShadow: 'none',
};

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Origin-aware dropdown reveal with staggered children (emil/framer) */
const dropdownVariants = {
	hidden: { opacity: 0, y: 8, scale: 0.99 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.18, ease: EASE_OUT, staggerChildren: 0.035 },
	},
	exit: { opacity: 0, y: 6, scale: 0.99, transition: { duration: 0.12, ease: EASE_OUT } },
};
const dropdownItemVariants = {
	hidden: { opacity: 0, y: 8 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE_OUT } },
};

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

const thisYear = new Date().getFullYear();

interface HeaderFilterProps {
	initialInput: ProductsInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t, i18n } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(initialInput);
	const locationRef: any = useRef();
	const typeRef: any = useRef();
	const doorsRef: any = useRef();
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openRooms, setOpenRooms] = useState(false);
	const [productLocation, setProductLocation] = useState<ProductLocation[]>(Object.values(ProductLocation));
	const [productType, setProductType] = useState<ProductType[]>(Object.values(ProductType));
	const [yearCheck, setYearCheck] = useState({ start: 1970, end: thisYear });
	const [optionCheck, setOptionCheck] = useState('all');
	const reduce = useReducedMotion();

	/** LIFECYCLES **/
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!locationRef?.current?.contains(event.target)) {
				setOpenLocation(false);
			}

			if (!typeRef?.current?.contains(event.target)) {
				setOpenType(false);
			}

			if (!doorsRef?.current?.contains(event.target)) {
				setOpenRooms(false);
			}
		};

		document.addEventListener('mousedown', clickHandler);

		return () => {
			document.removeEventListener('mousedown', clickHandler);
		};
	}, []);

	/** HANDLERS **/
	const advancedFilterHandler = (status: boolean) => {
		setOpenLocation(false);
		setOpenRooms(false);
		setOpenType(false);
		setOpenAdvancedFilter(status);
	};

	const locationStateChangeHandler = () => {
		setOpenLocation((prev) => !prev);
		setOpenRooms(false);
		setOpenType(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenLocation(false);
		setOpenRooms(false);
	};

	const doorStateChangeHandler = () => {
		setOpenRooms((prev) => !prev);
		setOpenType(false);
		setOpenLocation(false);
	};

	const disableAllStateHandler = () => {
		setOpenRooms(false);
		setOpenType(false);
		setOpenLocation(false);
	};

	const productLocationSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						locationList: [value],
					},
				});
				typeStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, productLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productTypeSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						typeList: [value],
					},
				});
				doorStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, productTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productDoorSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter(sanitizeProductsInquiry({
					...searchFilter,
					search: {
						...searchFilter.search,
						doorsList: [value],
					},
				}, initialInput));
				disableAllStateHandler();
			} catch (err: any) {
				console.log('ERROR, productDoorSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productSeatsSelectHandler = useCallback(
		async (number: Number) => {
			try {
				if (number != 0) {
					if (searchFilter?.search?.seatsList?.includes(number)) {
						setSearchFilter(sanitizeProductsInquiry({
							...searchFilter,
							search: {
								...searchFilter.search,
								seatsList: searchFilter?.search?.seatsList?.filter((item: Number) => item !== number),
							},
						}, initialInput));
					} else {
						setSearchFilter(sanitizeProductsInquiry({
							...searchFilter,
							search: { ...searchFilter.search, seatsList: [...(searchFilter?.search?.seatsList || []), number] },
						}, initialInput));
					}
				} else {
					const search = { ...searchFilter.search };
					delete search.seatsList;
					setSearchFilter(sanitizeProductsInquiry({ ...searchFilter, search }, initialInput));
				}

				console.log('productSeatsSelectHandler:', number);
			} catch (err: any) {
				console.log('ERROR, productSeatsSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productOptionSelectHandler = useCallback(
		async (e: any) => {
			try {
				const value = e.target.value;
				setOptionCheck(value);
				const search: any = { ...searchFilter.search };

				delete search.fuelTypeList;
				delete search.transmissionList;

				if (value.startsWith('fuelTypeList:')) {
					search.fuelTypeList = [value.replace('fuelTypeList:', '')];
				} else if (value.startsWith('transmissionList:')) {
					search.transmissionList = [value.replace('transmissionList:', '')];
				}

				if (value !== 'all') {
					setSearchFilter(sanitizeProductsInquiry({ ...searchFilter, search }, initialInput));
				} else {
					setSearchFilter(sanitizeProductsInquiry({ ...searchFilter, search }, initialInput));
				}
			} catch (err: any) {
				console.log('ERROR, productOptionSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productMileageHandler = useCallback(
		async (e: any, type: string) => {
			const value = e.target.value;

			if (type == 'start') {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						// @ts-ignore
						mileageRange: { ...searchFilter.search.mileageRange, start: parseInt(value) },
					},
				});
			} else {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						// @ts-ignore
						mileageRange: { ...searchFilter.search.mileageRange, end: parseInt(value) },
					},
				});
			}
		},
		[searchFilter],
	);

	const yearStartChangeHandler = async (event: any) => {
		setYearCheck({ ...yearCheck, start: Number(event.target.value) });

		setSearchFilter({
			...searchFilter,
			search: {
				...searchFilter.search,
				periodsRange: { start: Number(event.target.value), end: yearCheck.end },
			},
		});
	};

	const yearEndChangeHandler = async (event: any) => {
		setYearCheck({ ...yearCheck, end: Number(event.target.value) });

		setSearchFilter({
			...searchFilter,
			search: {
				...searchFilter.search,
				periodsRange: { start: yearCheck.start, end: Number(event.target.value) },
			},
		});
	};

	const resetFilterHandler = () => {
		setSearchFilter(sanitizeProductsInquiry(initialInput));
		setOptionCheck('all');
		setYearCheck({ start: 1970, end: thisYear });
	};

	const pushSearchHandler = async () => {
		try {
			const cleanInput = sanitizeProductsInquiry(searchFilter, initialInput);

			await router.push(
				`/cars?input=${JSON.stringify(cleanInput)}`,
				`/cars?input=${JSON.stringify(cleanInput)}`,
			);
		} catch (err: any) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	return (
		<>
			<motion.div
				className={`search-box carlen-home-search ${device === 'mobile' ? 'mobile-search-box' : ''}`}
				initial={reduce ? false : { opacity: 0, y: 18 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: EASE_OUT }}
			>
				<div className={'select-box'}>
					<motion.div
						className={`box carlen-filter-control ${openLocation ? 'on' : ''}`}
						onClick={locationStateChangeHandler}
						whileTap={reduce ? undefined : { scale: 0.98 }}
						role={'button'}
						tabIndex={0}
						aria-expanded={openLocation}
						onKeyDown={(e: any) => (e.key === 'Enter' || e.key === ' ') && locationStateChangeHandler()}
					>
						<LocationOnOutlinedIcon className={'seg-icon'} />
						<div className={'seg-text'}>
							<span className={'seg-label'}>Location</span>
							<span className={'seg-value'}>{searchFilter?.search?.locationList ? searchFilter?.search?.locationList[0] : 'Anywhere'}</span>
						</div>
						<ExpandMoreIcon className={'seg-caret'} />
					</motion.div>
					<motion.div
						className={`box carlen-filter-control ${openType ? 'on' : ''}`}
						onClick={typeStateChangeHandler}
						whileTap={reduce ? undefined : { scale: 0.98 }}
						role={'button'}
						tabIndex={0}
						aria-expanded={openType}
						onKeyDown={(e: any) => (e.key === 'Enter' || e.key === ' ') && typeStateChangeHandler()}
					>
						<DirectionsCarFilledOutlinedIcon className={'seg-icon'} />
						<div className={'seg-text'}>
							<span className={'seg-label'}>Brand</span>
							<span className={'seg-value'}>{searchFilter?.search?.typeList ? searchFilter?.search?.typeList[0] : 'Any brand'}</span>
						</div>
						<ExpandMoreIcon className={'seg-caret'} />
					</motion.div>
					<motion.div
						className={`box carlen-filter-control ${openRooms ? 'on' : ''}`}
						onClick={doorStateChangeHandler}
						whileTap={reduce ? undefined : { scale: 0.98 }}
						role={'button'}
						tabIndex={0}
						aria-expanded={openRooms}
						onKeyDown={(e: any) => (e.key === 'Enter' || e.key === ' ') && doorStateChangeHandler()}
					>
						<SensorDoorOutlinedIcon className={'seg-icon'} />
						<div className={'seg-text'}>
							<span className={'seg-label'}>Doors</span>
							<span className={'seg-value'}>{searchFilter?.search?.doorsList ? `${searchFilter?.search?.doorsList[0]} doors` : 'Any'}</span>
						</div>
						<ExpandMoreIcon className={'seg-caret'} />
					</motion.div>
				</div>
				<div className={'search-box-other carlen-search-actions'}>
					<motion.div
						className={'advanced-filter'}
						onClick={() => advancedFilterHandler(true)}
						whileTap={reduce ? undefined : { scale: 0.97 }}
						role={'button'}
						tabIndex={0}
						aria-label={'Advanced car search'}
						onKeyDown={(e: any) => (e.key === 'Enter' || e.key === ' ') && advancedFilterHandler(true)}
					>
						<TuneIcon />
						<span>{t('Advanced')}</span>
					</motion.div>
					<motion.div
						className={'search-btn'}
						onClick={pushSearchHandler}
						whileHover={reduce ? undefined : { y: -2 }}
						whileTap={reduce ? undefined : { scale: 0.96 }}
						transition={{ type: 'spring', stiffness: 400, damping: 20 }}
						role={'button'}
						tabIndex={0}
						aria-label={'Search cars'}
						onKeyDown={(e: any) => (e.key === 'Enter' || e.key === ' ') && pushSearchHandler()}
					>
						<SearchIcon />
					</motion.div>
				</div>

				<AnimatePresence>
					{openLocation && (
						<motion.div
							className={'filter-location carlen-filter-dropdown'}
							ref={locationRef}
							variants={reduce ? undefined : dropdownVariants}
							initial={reduce ? { opacity: 0 } : 'hidden'}
							animate={reduce ? { opacity: 1 } : 'visible'}
							exit={reduce ? { opacity: 0 } : 'exit'}
						>
							{productLocation.map((location: string) => (
								<motion.div
									variants={reduce ? undefined : dropdownItemVariants}
									onClick={() => productLocationSelectHandler(location)}
									key={location}
								>
									<img src={`img/banner/cities/${location}.webp`} alt="" />
									<span>{location}</span>
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{openType && (
						<motion.div
							className={'filter-type carlen-filter-dropdown'}
							ref={typeRef}
							variants={reduce ? undefined : dropdownVariants}
							initial={reduce ? { opacity: 0 } : 'hidden'}
							animate={reduce ? { opacity: 1 } : 'visible'}
							exit={reduce ? { opacity: 0 } : 'exit'}
						>
							{productType.map((type: string) => (
								<motion.div
									variants={reduce ? undefined : dropdownItemVariants}
									style={{ backgroundImage: `url(/img/banner/types/${type.toLowerCase()}.webp)` }}
									onClick={() => productTypeSelectHandler(type)}
									key={type}
								>
									<span>{type}</span>
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{openRooms && (
						<motion.div
							className={'filter-rooms carlen-filter-dropdown'}
							ref={doorsRef}
							variants={reduce ? undefined : dropdownVariants}
							initial={reduce ? { opacity: 0 } : 'hidden'}
							animate={reduce ? { opacity: 1 } : 'visible'}
							exit={reduce ? { opacity: 0 } : 'exit'}
						>
							{[1, 2, 3, 4, 5].map((room: number) => (
								<motion.span
									variants={reduce ? undefined : dropdownItemVariants}
									onClick={() => productDoorSelectHandler(room)}
									key={room}
								>
									{room} door{room > 1 ? 's' : ''}
								</motion.span>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>

				{/* ADVANCED FILTER MODAL */}
				<Modal
					open={openAdvancedFilter}
					onClose={() => advancedFilterHandler(false)}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					{/* @ts-ignore */}
					<Box sx={style}>
						<motion.div
							className={'advanced-filter-modal carlen-advanced-search-modal'}
							initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							transition={{ duration: 0.22, ease: EASE_OUT }}
						>
							<div className={'close'} onClick={() => advancedFilterHandler(false)}>
								<CloseIcon />
							</div>
							<div className={'top'}>
								<span>Find your car</span>
								<div className={'search-input-box'}>
									<img src="/img/icons/search.svg" alt="" />
									<input
										value={searchFilter?.search?.text ?? ''}
										type="text"
										placeholder={'What are you looking for?'}
										onChange={(e: any) => {
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: e.target.value },
											});
										}}
									/>
								</div>
							</div>
							<Divider sx={{ mt: '30px', mb: '35px' }} />
							<div className={'middle'}>
								<div className={'row-box'}>
									<div className={'box'}>
										<span>seats</span>
										<div className={'inside'}>
											<div
												className={`room ${!searchFilter?.search?.seatsList ? 'active' : ''}`}
												onClick={() => productSeatsSelectHandler(0)}
											>
												Any
											</div>
											{[1, 2, 3, 4, 5].map((bed: number) => (
												<div
													className={`room ${searchFilter?.search?.seatsList?.includes(bed) ? 'active' : ''}`}
													onClick={() => productSeatsSelectHandler(bed)}
													key={bed}
												>
													{bed == 0 ? 'Any' : bed}
												</div>
											))}
										</div>
									</div>
									<div className={'box'}>
										<span>options</span>
										<div className={'inside'}>
											<FormControl>
												<Select
													value={optionCheck}
													onChange={productOptionSelectHandler}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
												>
													<MenuItem value={'all'}>All Options</MenuItem>
													{Object.values(ProductFuelType).map((fuelType) => (
														<MenuItem value={`fuelTypeList:${fuelType}`} key={fuelType}>
															{fuelType}
														</MenuItem>
													))}
													{Object.values(ProductTransmission).map((transmission) => (
														<MenuItem value={`transmissionList:${transmission}`} key={transmission}>
															{transmission}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</div>
									</div>
								</div>
								<div className={'row-box'} style={{ marginTop: '44px' }}>
									<div className={'box'}>
										<span>Vehicle year</span>
										<div className={'inside space-between align-center'}>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={yearCheck.start.toString()}
													onChange={yearStartChangeHandler}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={MenuProps}
												>
													{productYears?.slice(0)?.map((year: number) => (
														<MenuItem value={year} disabled={yearCheck.end <= year} key={year}>
															{year}
														</MenuItem>
													))}
												</Select>
											</FormControl>
											<div className={'minus-line'}></div>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={yearCheck.end.toString()}
													onChange={yearEndChangeHandler}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={MenuProps}
												>
													{productYears
														?.slice(0)
														.reverse()
														.map((year: number) => (
															<MenuItem value={year} disabled={yearCheck.start >= year} key={year}>
																{year}
															</MenuItem>
														))}
												</Select>
											</FormControl>
										</div>
									</div>
									<div className={'box'}>
										<span>Mileage</span>
										<div className={'inside space-between align-center'}>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={searchFilter?.search?.mileageRange?.start}
													onChange={(e: any) => productMileageHandler(e, 'start')}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={MenuProps}
												>
													{productMileageRange.map((square: number) => (
														<MenuItem
															value={square}
															disabled={(searchFilter?.search?.mileageRange?.end || 0) < square}
															key={square}
														>
															{square}
														</MenuItem>
													))}
												</Select>
											</FormControl>
											<div className={'minus-line'}></div>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={searchFilter?.search?.mileageRange?.end}
													onChange={(e: any) => productMileageHandler(e, 'end')}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={MenuProps}
												>
													{productMileageRange.map((square: number) => (
														<MenuItem
															value={square}
															disabled={(searchFilter?.search?.mileageRange?.start || 0) > square}
															key={square}
														>
															{square}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</div>
									</div>
								</div>
							</div>
							<Divider sx={{ mt: '60px', mb: '18px' }} />
							<div className={'bottom'}>
								<div onClick={resetFilterHandler}>
									<img src="/img/icons/reset.svg" alt="" />
									<span>Reset all filters</span>
								</div>
								<Button
									startIcon={<img src={'/img/icons/search.svg'} />}
									className={'search-btn'}
									onClick={pushSearchHandler}
								>
									Search
								</Button>
							</div>
						</motion.div>
					</Box>
				</Modal>
			</>
		);
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			mileageRange: {
				start: 0,
				end: 500000,
			},
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default HeaderFilter;
