import React, { useEffect, useState } from 'react';
import { FormControl, Select, MenuItem, Tooltip } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductFuelType, ProductLocation, ProductTransmission, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { useRouter } from 'next/router';
import { productMileageRange } from '../../config';
import { sanitizeProductsInquiry, formatterStr } from '../../utils';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import LocalGasStationOutlinedIcon from '@mui/icons-material/LocalGasStationOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

interface FilterType {
	searchFilter: ProductsInquiry;
	setSearchFilter: any;
	initialInput: ProductsInquiry;
	total?: number;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput, total } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [productLocation] = useState<ProductLocation[]>(Object.values(ProductLocation));
	const [productType] = useState<ProductType[]>(Object.values(ProductType));
	const [productFuelType] = useState<ProductFuelType[]>(Object.values(ProductFuelType));
	const [productTransmission] = useState<ProductTransmission[]>(Object.values(ProductTransmission));
	const [searchText, setSearchText] = useState<string>(searchFilter?.search?.text ?? '');
	const [showMore, setShowMore] = useState<boolean>(false);
	const shouldReduceMotion = useReducedMotion();

	/** LIFECYCLES **/
	useEffect(() => {
		setShowMore(Boolean(searchFilter?.search?.locationList));
		setSearchText(searchFilter?.search?.text ?? '');
	}, [searchFilter]);

	/** HANDLERS **/
	const pushFilter = async (input: ProductsInquiry) => {
		const cleanInput = sanitizeProductsInquiry(input, initialInput);
		setSearchFilter(cleanInput);
		await router.push(
			`/cars?input=${JSON.stringify(cleanInput)}`,
			`/cars?input=${JSON.stringify(cleanInput)}`,
			{ scroll: false },
		);
	};

	const updateListFilter = async (key: keyof ProductsInquiry['search'], value: string | number, isChecked: boolean) => {
		const search: any = { ...searchFilter.search };
		const currentList = Array.isArray(search[key]) ? [...search[key]] : [];
		const nextList = isChecked ? Array.from(new Set([...currentList, value])) : currentList.filter((item: any) => item !== value);

		if (nextList.length > 0) search[key] = nextList;
		else delete search[key];

		await pushFilter({ ...searchFilter, page: 1, search });
	};

	const clearListFilter = async (key: keyof ProductsInquiry['search']) => {
		const search: any = { ...searchFilter.search };
		delete search[key];
		await pushFilter({ ...searchFilter, page: 1, search });
	};

	const productMileageHandler = async (e: any, type: string) => {
		const value = Number(e.target.value);
		const currentRange = searchFilter.search.mileageRange ?? initialInput.search.mileageRange ?? { start: 0, end: 0 };
		await pushFilter({
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				mileageRange: { ...currentRange, [type]: value },
			},
		});
	};

	const productPriceHandler = async (value: number, type: string) => {
		const currentRange = searchFilter.search.pricesRange ?? initialInput.search.pricesRange ?? { start: 0, end: 0 };
		await pushFilter({
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				pricesRange: { ...currentRange, [type]: value * 1 },
			},
		});
	};

	const textSearchHandler = async (text: string) => {
		const search: any = { ...searchFilter.search };
		if (text.trim()) search.text = text.trim();
		else delete search.text;
		await pushFilter({ ...searchFilter, page: 1, search });
	};

	const refreshHandler = async () => {
		try {
			setSearchText('');
			await pushFilter(sanitizeProductsInquiry(initialInput));
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	/** MOTION **/
	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06, delayChildren: 0.05 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
	};
	const chipGroup: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.035 } },
	};
	const chip: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8, scale: shouldReduceMotion ? 1 : 0.96 },
		visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 28 } },
	};

	const renderChips = (
		options: string[],
		key: keyof ProductsInquiry['search'],
		selectedList: string[] | undefined,
	) => (
		<div className={'carlen-filter-chip-group'}>
			{options.map((option) => {
				const selected = (selectedList || []).includes(option);
				return (
					<motion.button
						type={'button'}
						key={option}
						className={selected ? 'carlen-filter-chip carlen-filter-chip-active' : 'carlen-filter-chip'}
						onClick={() => updateListFilter(key, option, !selected)}
						whileHover={shouldReduceMotion ? undefined : { y: -2 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
					>
						{option}
					</motion.button>
				);
			})}
		</div>
	);

	const SEATS_OPTIONS = [2, 4, 5, 6, 7, 8, 9];
	const DOORS_OPTIONS = [2, 3, 4,];

	const renderNumberChips = (
		key: 'seatsList' | 'doorsList',
		options: number[],
		suffix: string,
		selectedList: any,
	) => {
		const isAny = !selectedList || selectedList.length === 0;
		return (
			<motion.div className={'carlen-filter-chip-group'} variants={chipGroup} initial={'hidden'} animate={'visible'}>
				<motion.button
					type={'button'}
					layout
					variants={chip}
					className={isAny ? 'carlen-filter-chip carlen-filter-chip-active' : 'carlen-filter-chip'}
					onClick={() => clearListFilter(key)}
					whileHover={shouldReduceMotion ? undefined : { y: -2 }}
					whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
				>
					Any
				</motion.button>
				{options.map((num: number) => {
					const selected = !!selectedList?.includes(num);
					return (
						<motion.button
							type={'button'}
							key={num}
							layout
							variants={chip}
							className={selected ? 'carlen-filter-chip carlen-filter-chip-active' : 'carlen-filter-chip'}
							onClick={() => updateListFilter(key, num, !selected)}
							whileHover={shouldReduceMotion ? undefined : { y: -2 }}
							whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
						>
							{num} {suffix}
						</motion.button>
					);
				})}
			</motion.div>
		);
	};

	if (device === 'mobile') {
		return <div>PROPERTIES FILTER</div>;
	} else {
		return (
			<motion.aside
				className={'carlen-filter-panel'}
				initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
				animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
				transition={{ type: 'spring', stiffness: 260, damping: 28 }}
			>
				<motion.div className={'carlen-filter-inner'} variants={container} initial={'hidden'} animate={'visible'}>
					<motion.div className={'carlen-filter-header'} variants={item}>
						<h3>Find Your Car</h3>
						<p>Premium avtomobillarni ehtiyojingizga mos filter qiling.</p>
						{total != null && <span className={'count'}>{total} cars available</span>}
					</motion.div>

					<motion.div className={'carlen-filter-search'} variants={item}>
						<SearchRoundedIcon className={'lead-icon'} />
						<input
							value={searchText}
							type={'text'}
							placeholder={'What are you looking for?'}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') {
									textSearchHandler(searchText);
								}
							}}
						/>
						{searchText ? (
							<button
								type={'button'}
								className={'clear-btn'}
								aria-label={'Clear'}
								onClick={() => {
									setSearchText('');
									textSearchHandler('');
								}}
							>
								<CloseRoundedIcon />
							</button>
						) : null}
						<Tooltip title="Reset">
							<button type={'button'} className={'reset-btn'} aria-label={'Reset'} onClick={refreshHandler}>
								<RefreshRoundedIcon />
							</button>
						</Tooltip>
					</motion.div>

					<motion.div className={'carlen-filter-section'} variants={item}>
						<div className={'carlen-filter-section-head'}>
							<span className={'icon'}><LocationOnOutlinedIcon /></span>
							<span className={'title'}>Location</span>
						</div>
						{renderChips(productLocation, 'locationList', searchFilter?.search?.locationList)}
					</motion.div>

					<motion.div className={'carlen-filter-section'} variants={item}>
						<div className={'carlen-filter-section-head'}>
							<span className={'icon'}><DirectionsCarFilledOutlinedIcon /></span>
							<span className={'title'}>Brand</span>
						</div>
						{renderChips(productType, 'typeList', searchFilter?.search?.typeList)}
					</motion.div>

					<motion.div className={'carlen-filter-section'} variants={item}>
						<div className={'carlen-filter-section-head'}>
							<span className={'icon'}><EventSeatOutlinedIcon /></span>
							<span className={'title'}>Seats</span>
						</div>
						{renderNumberChips('seatsList', SEATS_OPTIONS, 'seats', searchFilter?.search?.seatsList)}
					</motion.div>

					<motion.div className={'carlen-filter-section'} variants={item}>
						<div className={'carlen-filter-section-head'}>
							<span className={'icon'}><MeetingRoomOutlinedIcon /></span>
							<span className={'title'}>Doors</span>
						</div>
						{renderNumberChips('doorsList', DOORS_OPTIONS, 'doors', searchFilter?.search?.doorsList)}
					</motion.div>

					<motion.div className={'carlen-filter-section'} variants={item}>
						<div className={'carlen-filter-section-head'}>
							<span className={'icon'}><LocalGasStationOutlinedIcon /></span>
							<span className={'title'}>Fuel Type</span>
						</div>
						{renderChips(productFuelType, 'fuelTypeList', searchFilter?.search?.fuelTypeList)}
					</motion.div>

					<motion.div className={'carlen-filter-section'} variants={item}>
						<div className={'carlen-filter-section-head'}>
							<span className={'icon'}><SettingsOutlinedIcon /></span>
							<span className={'title'}>Transmission</span>
						</div>
						{renderChips(productTransmission, 'transmissionList', searchFilter?.search?.transmissionList)}
					</motion.div>

					<motion.div className={'carlen-filter-section'} variants={item}>
						<div className={'carlen-filter-section-head'}>
							<span className={'icon'}><SpeedOutlinedIcon /></span>
							<span className={'title'}>Mileage</span>
						</div>
						<div className={'carlen-filter-range'}>
								<div className={'range-field'}>
									<label>Min</label>
									<FormControl className={'range-select'} size={'small'}>
										<Select
											value={searchFilter?.search?.mileageRange?.start ?? 0}
											onChange={(e: any) => productMileageHandler(e, 'start')}
											MenuProps={MenuProps}
										>
											{productMileageRange.map((square: number) => (
												<MenuItem value={square} disabled={(searchFilter?.search?.mileageRange?.end || 0) < square} key={square}>
													{square === 0 ? 'Any' : `${formatterStr(square)} km`}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</div>
								<span className={'sep'} />
								<div className={'range-field'}>
									<label>Max</label>
									<FormControl className={'range-select'} size={'small'}>
										<Select
											value={searchFilter?.search?.mileageRange?.end ?? 500000}
											onChange={(e: any) => productMileageHandler(e, 'end')}
											MenuProps={MenuProps}
										>
											{productMileageRange.map((square: number) => (
												<MenuItem value={square} disabled={(searchFilter?.search?.mileageRange?.start || 0) > square} key={square}>
													{square === 0 ? 'Any' : `${formatterStr(square)} km`}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</div>
							</div>
					</motion.div>

					<motion.div className={'carlen-filter-section'} variants={item}>
						<div className={'carlen-filter-section-head'}>
							<span className={'icon'}><PaymentsOutlinedIcon /></span>
							<span className={'title'}>Price Range</span>
						</div>
						<div className={'carlen-filter-range'}>
								<div className={'range-field'}>
									<label>Min price</label>
									<div className={'range-input'}>
										<span className={'unit'}>$</span>
										<input
											type={'number'}
											placeholder={'0'}
											min={0}
											value={searchFilter?.search?.pricesRange?.start ?? 0}
											onChange={(e: any) => {
												if (e.target.value >= 0) {
													productPriceHandler(e.target.value, 'start');
												}
											}}
										/>
									</div>
								</div>
								<span className={'sep'} />
								<div className={'range-field'}>
									<label>Max price</label>
									<div className={'range-input'}>
										<span className={'unit'}>$</span>
										<input
											type={'number'}
											placeholder={'Any'}
											value={searchFilter?.search?.pricesRange?.end ?? 0}
											onChange={(e: any) => {
												if (e.target.value >= 0) {
													productPriceHandler(e.target.value, 'end');
												}
											}}
										/>
									</div>
								</div>
							</div>
					</motion.div>

					<motion.div className={'carlen-filter-actions'} variants={item}>
						<motion.button
							type={'button'}
							className={'carlen-filter-apply'}
							whileHover={shouldReduceMotion ? undefined : { y: -2 }}
							whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
							onClick={() => document.getElementById('main')?.scrollIntoView({ behavior: 'smooth' })}
						>
							Show Cars
						</motion.button>
						<button type={'button'} className={'carlen-filter-clear'} onClick={refreshHandler}>
							Clear All
						</button>
					</motion.div>
				</motion.div>
			</motion.aside>
		);
	}
};

export default Filter;
