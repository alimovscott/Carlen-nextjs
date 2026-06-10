import numeral from 'numeral';
import { sweetMixinErrorAlert } from './sweetAlert';
import { ProductsInquiry } from './types/product/product.input';
import { ProductFuelType, ProductLocation, ProductTransmission, ProductType } from './enums/product.enum';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

const productListSearchKeys = [
	'locationList',
	'typeList',
	'seatsList',
	'doorsList',
	'fuelTypeList',
	'transmissionList',
];

const fullProductListValues: Record<string, any[]> = {
	locationList: Object.values(ProductLocation),
	typeList: Object.values(ProductType),
	seatsList: [1, 2, 3, 4, 5],
	doorsList: [1, 2, 3, 4, 5],
	fuelTypeList: Object.values(ProductFuelType),
	transmissionList: Object.values(ProductTransmission),
};

const sameSet = (left: any[], right: any[]) => {
	if (left.length !== right.length) return false;
	const rightSet = new Set(right.map(String));
	return left.every((item) => rightSet.has(String(item)));
};

export const sanitizeProductsInquiry = (input: any, fallback?: ProductsInquiry): ProductsInquiry => {
	const base = fallback ? JSON.parse(JSON.stringify(fallback)) : {};
	const source = input && typeof input === 'object' ? JSON.parse(JSON.stringify(input)) : {};
	const next: ProductsInquiry = {
		...base,
		...source,
		page: Number(source.page ?? base.page ?? 1),
		limit: Number(source.limit ?? base.limit ?? 9),
		search: {
			...(base.search ?? {}),
			...(source.search ?? {}),
		},
	};

	const search: any = next.search ?? {};
	delete search.roomsList;
	delete search.bedsList;
	delete search.options;

	productListSearchKeys.forEach((key) => {
		const value = search[key];
		if (!Array.isArray(value) || value.length === 0 || sameSet(value, fullProductListValues[key])) {
			delete search[key];
		}
	});

	if (typeof search.text === 'string' && search.text.trim() === '') {
		delete search.text;
	}

	next.search = search;
	return next;
};

export const likeTargetProductHandler = async (likeTargetProduct: any, id: string) => {
	try {
		await likeTargetProduct({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetProductHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string) => {
	try {
		await likeTargetBoardArticle({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
	try {
		await likeTargetMember({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetMemberHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};
