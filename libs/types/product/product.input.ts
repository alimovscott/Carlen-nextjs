import {
	ProductFuelType,
	ProductLocation,
	ProductStatus,
	ProductTransmission,
	ProductType,
} from '../../enums/product.enum';
import { Direction } from '../../enums/common.enum';

export interface ProductInput {
	productType: ProductType;
	productModel: string;
	productLocation: ProductLocation;
	productAddress: string;
	productYear: number;
	productTitle: string;
	productPrice: number;
	productTransmission: ProductTransmission;
	productMileage: number;
	productFuelType: ProductFuelType;
	productDoors: number;
	productSeats: number;
	productImages: string[];
	productDesc?: string;
	memberId?: string;
}

interface PISearch {
	memberId?: string;
	locationList?: ProductLocation[];
	typeList?: ProductType[];
	transmissionList?: ProductTransmission[];
	fuelTypeList?: ProductFuelType[];
	roomsList?: Number[];
	options?: string[];
	bedsList?: Number[];
	pricesRange?: Range;
	periodsRange?: PeriodsRange;
	mileageRange?: Range;
	text?: string;
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface APISearch {
	productStatus?: ProductStatus;
}

export interface AgentProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: APISearch;
}

interface ALPISearch {
	productStatus?: ProductStatus;
	productLocationList?: ProductLocation[];
}

export interface AllProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPISearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}
