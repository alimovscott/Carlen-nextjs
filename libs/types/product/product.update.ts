import {
	ProductFuelType,
	ProductLocation,
	ProductStatus,
	ProductTransmission,
	ProductType,
} from '../../enums/product.enum';

export interface ProductUpdate {
	_id: string;
	productType?: ProductType;
	productModel?: string;
	productStatus?: ProductStatus;
	productLocation?: ProductLocation;
	productAddress?: string;
	productYear?: number;
	productTitle?: string;
	productPrice?: number;
	productTransmission?: ProductTransmission;
	productMileage?: number;
	productFuelType?: ProductFuelType;
	productDoors?: number;
	productSeats?: number;
	productImages?: string[];
	productDesc?: string;
	soldAt?: Date;
	deletedAt?: Date;
}
