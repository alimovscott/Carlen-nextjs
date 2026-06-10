import React, { useEffect, useState } from 'react';
import {
	Stack,
	Typography,
	Checkbox,
	Button,
	OutlinedInput,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Tooltip,
	IconButton,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductFuelType, ProductLocation, ProductTransmission, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { productMileageRange } from '../../config';
import RefreshIcon from '@mui/icons-material/Refresh';
import { sanitizeProductsInquiry } from '../../utils';

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
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [productLocation] = useState<ProductLocation[]>(Object.values(ProductLocation));
	const [productType] = useState<ProductType[]>(Object.values(ProductType));
	const [productFuelType] = useState<ProductFuelType[]>(Object.values(ProductFuelType));
	const [productTransmission] = useState<ProductTransmission[]>(Object.values(ProductTransmission));
	const [searchText, setSearchText] = useState<string>(searchFilter?.search?.text ?? '');
	const [showMore, setShowMore] = useState<boolean>(false);

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

	if (device === 'mobile') {
		return <div>PROPERTIES FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
				<Stack className={'find-your-car'} mb={'40px'}>
					<Typography className={'title-main'}>Find Your Home</Typography>
					<Stack className={'input-box'}>
						<OutlinedInput
							value={searchText}
							type={'text'}
							className={'search-input'}
							placeholder={'What are you looking for?'}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') {
									textSearchHandler(searchText);
								}
							}}
							endAdornment={
								<>
									<CancelRoundedIcon
										onClick={() => {
											setSearchText('');
											textSearchHandler('');
										}}
									/>
								</>
							}
						/>
						<img src={'/img/icons/search_icon.png'} alt={''} />
						<Tooltip title="Reset">
							<IconButton onClick={refreshHandler}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>
				<Stack className={'find-your-car'} mb={'30px'}>
					<p className={'title'} style={{ textShadow: '0px 3px 4px #b9b9b9' }}>
						Location
					</p>
					<Stack
						className={`product-location`}
						style={{ height: showMore ? '253px' : '115px' }}
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.locationList) {
								setShowMore(false);
							}
						}}
					>
						{productLocation.map((location: string) => {
							return (
								<Stack className={'input-box'} key={location}>
									<Checkbox
										id={location}
										className="product-checkbox"
										color="default"
										size="small"
										value={location}
										checked={(searchFilter?.search?.locationList || []).includes(location as ProductLocation)}
										onChange={(e: any) => updateListFilter('locationList', e.target.value, e.target.checked)}
									/>
									<label htmlFor={location} style={{ cursor: 'pointer' }}>
										<Typography className="product-type">{location}</Typography>
									</label>
								</Stack>
							);
						})}
					</Stack>
				</Stack>
				<Stack className={'find-your-car'} mb={'30px'}>
					<Typography className={'title'}>Product Type</Typography>
					{productType.map((type: string) => (
						<Stack className={'input-box'} key={type}>
							<Checkbox
								id={type}
								className="product-checkbox"
								color="default"
								size="small"
								value={type}
								onChange={(e: any) => updateListFilter('typeList', e.target.value, e.target.checked)}
								checked={(searchFilter?.search?.typeList || []).includes(type as ProductType)}
							/>
							<label style={{ cursor: 'pointer' }}>
								<Typography className="product-type">{type}</Typography>
							</label>
						</Stack>
					))}
				</Stack>
				<Stack className={'find-your-car'} mb={'30px'}>
					<Typography className={'title'}>Seats</Typography>
					<Stack className="button-group">
						<Button
							sx={{
								borderRadius: '12px 0 0 12px',
								border: !searchFilter?.search?.seatsList ? '2px solid #181A20' : '1px solid #b9b9b9',
							}}
							onClick={() => clearListFilter('seatsList')}
						>
							Any
						</Button>
						{[1, 2, 3, 4, 5].map((seat: number) => (
							<Button
								key={seat}
								sx={{
									borderRadius: seat === 5 ? '0 12px 12px 0' : 0,
									border: searchFilter?.search?.seatsList?.includes(seat) ? '2px solid #181A20' : '1px solid #b9b9b9',
									borderLeft: searchFilter?.search?.seatsList?.includes(seat) ? undefined : 'none',
									borderRight: seat === 4 && !searchFilter?.search?.seatsList?.includes(seat) ? 'none' : undefined,
								}}
								onClick={() => updateListFilter('seatsList', seat, !searchFilter?.search?.seatsList?.includes(seat))}
							>
								{seat === 5 ? '5+' : seat}
							</Button>
						))}
					</Stack>
				</Stack>
				<Stack className={'find-your-car'} mb={'30px'}>
					<Typography className={'title'}>Doors</Typography>
					<Stack className="button-group">
						<Button
							sx={{
								borderRadius: '12px 0 0 12px',
								border: !searchFilter?.search?.doorsList ? '2px solid #181A20' : '1px solid #b9b9b9',
							}}
							onClick={() => clearListFilter('doorsList')}
						>
							Any
						</Button>
						{[1, 2, 3, 4, 5].map((door: number) => (
							<Button
								key={door}
								sx={{
									borderRadius: door === 5 ? '0 12px 12px 0' : 0,
									border: searchFilter?.search?.doorsList?.includes(door) ? '2px solid #181A20' : '1px solid #b9b9b9',
									borderLeft: searchFilter?.search?.doorsList?.includes(door) ? undefined : 'none',
									borderRight: door === 4 && !searchFilter?.search?.doorsList?.includes(door) ? 'none' : undefined,
								}}
								onClick={() => updateListFilter('doorsList', door, !searchFilter?.search?.doorsList?.includes(door))}
							>
								{door === 5 ? '5+' : door}
							</Button>
						))}
					</Stack>
				</Stack>
				<Stack className={'find-your-car'} mb={'30px'}>
					<Typography className={'title'}>Fuel Type</Typography>
					{productFuelType.map((fuelType: string) => (
						<Stack className={'input-box'} key={fuelType}>
							<Checkbox
								id={fuelType}
								className="product-checkbox"
								color="default"
								size="small"
								value={fuelType}
								checked={(searchFilter?.search?.fuelTypeList || []).includes(fuelType as ProductFuelType)}
								onChange={(e: any) => updateListFilter('fuelTypeList', e.target.value, e.target.checked)}
							/>
							<label htmlFor={fuelType} style={{ cursor: 'pointer' }}>
								<Typography className="product-type">{fuelType}</Typography>
							</label>
						</Stack>
					))}
				</Stack>
				<Stack className={'find-your-car'} mb={'30px'}>
					<Typography className={'title'}>Transmission</Typography>
					{productTransmission.map((transmission: string) => (
						<Stack className={'input-box'} key={transmission}>
							<Checkbox
								id={transmission}
								className="product-checkbox"
								color="default"
								size="small"
								value={transmission}
								checked={(searchFilter?.search?.transmissionList || []).includes(transmission as ProductTransmission)}
								onChange={(e: any) => updateListFilter('transmissionList', e.target.value, e.target.checked)}
							/>
							<label htmlFor={transmission} style={{ cursor: 'pointer' }}>
								<Typography className="product-type">{transmission}</Typography>
							</label>
						</Stack>
					))}
				</Stack>
				<Stack className={'find-your-car'} mb={'30px'}>
					<Typography className={'title'}>Mileage</Typography>
					<Stack className="square-year-input">
						<FormControl>
							<InputLabel id="demo-simple-select-label">Min</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={searchFilter?.search?.mileageRange?.start ?? 0}
								label="Min"
								onChange={(e: any) => productMileageHandler(e, 'start')}
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
						<div className="central-divider"></div>
						<FormControl>
							<InputLabel id="demo-simple-select-label">Max</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={searchFilter?.search?.mileageRange?.end ?? 500}
								label="Max"
								onChange={(e: any) => productMileageHandler(e, 'end')}
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
					</Stack>
				</Stack>
				<Stack className={'find-your-car'}>
					<Typography className={'title'}>Price Range</Typography>
					<Stack className="square-year-input">
						<input
							type="number"
							placeholder="$ min"
							min={0}
							value={searchFilter?.search?.pricesRange?.start ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									productPriceHandler(e.target.value, 'start');
								}
							}}
						/>
						<div className="central-divider"></div>
						<input
							type="number"
							placeholder="$ max"
							value={searchFilter?.search?.pricesRange?.end ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									productPriceHandler(e.target.value, 'end');
								}
							}}
						/>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Filter;
