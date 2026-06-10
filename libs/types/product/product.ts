import {
	ProductFuelType,
	ProductLocation,
	ProductStatus,
	ProductTransmission,
	ProductType,
} from '../../enums/product.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Product {
	_id: string;
	productType: ProductType;
	productModel: string;
	productStatus: ProductStatus;
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
	productViews: number;
	productLikes: number;
	productComments: number;
	productRank: number;
	productImages: string[];
	productDesc?: string;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}
