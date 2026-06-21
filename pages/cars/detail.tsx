import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Review from '../../libs/components/product/Review';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import ProductBigCard from '../../libs/components/common/PropertyBigCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Product } from '../../libs/types/product/product';
import moment from 'moment';
import { formatterStr } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
import Link from 'next/link';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import LocalGasStationOutlinedIcon from '@mui/icons-material/LocalGasStationOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';
import { GET_COMMENTS, GET_PRODUCTS, GET_PRODUCT } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CREATE_COMMENT, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const shouldReduceMotion = useReducedMotion();
	const { t } = useTranslation('common');
	const [productId, setProductId] = useState<string | null>(null);
	const [product, setProduct] = useState<Product | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [destinationProducts, setDestinationProducts] = useState<Product[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [productComments, setProductComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PRODUCT,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const [createComment] = useMutation(CREATE_COMMENT);
	const {
		loading: getProductLoading,
		data: getProductData,
		error: getProductError,
		refetch: getProductRefetch,
	} = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { input: productId },
		skip: !productId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProduct) setProduct(data?.getProduct);
			if (data?.getProduct) setSlideImage(data?.getProduct?.productImages[0]);
		},
	});

	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					locationList: product?.productLocation ? [product?.productLocation] : [],
				},
			},
		},
		skip: !productId && !product,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProducts?.list) setDestinationProducts(data?.getProducts?.list);
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: initialComment,
		},
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setProductComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0].total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			setProductId(router.query.id as string);
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: router.query.id as string,
				},
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: router.query.id as string,
			});
		}
	}, [router]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: { ...commentInquiry } });
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProduct({ variables: { input: id } });
			await getProductRefetch({ input: id });

			await getProductsRefetch({
				input: {
					page: 1,
					limit: 4,
					sort: 'createdAt',
					direction: Direction.DESC,
					search: {
						locationList: [product?.productLocation],
					},
				},
			});

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });

			setInsertCommentData({ ...insertCommentData, commentContent: '' });
			await getCommentsRefetch({ input: { ...commentInquiry } });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	/** DERIVED (display-only) **/
	const isLiked = product?.meLiked && product?.meLiked[0]?.myFavorite;
	const yearValue = product?.productYear || moment(product?.createdAt).format('YYYY');
	const mapQuery = product?.productLocation ? `${product.productLocation}, South Korea` : '';
	const summaryPills = [
		product?.productTransmission,
		product?.productFuelType,
		product?.productSeats ? `${product?.productSeats} seats` : '',
		product?.productDoors ? `${product?.productDoors} doors` : '',
		product?.productMileage ? `${formatterStr(product?.productMileage)} km` : '',
		yearValue,
	].filter(Boolean) as string[];
	const specs = [
		{ icon: <EventSeatOutlinedIcon />, label: t('Seats'), value: product?.productSeats },
		{ icon: <MeetingRoomOutlinedIcon />, label: t('Doors'), value: product?.productDoors },
		{ icon: <SpeedOutlinedIcon />, label: t('Mileage'), value: `${formatterStr(product?.productMileage)} km` },
		{ icon: <LocalGasStationOutlinedIcon />, label: t('Fuel'), value: product?.productFuelType },
		{ icon: <SettingsOutlinedIcon />, label: t('Transmission'), value: product?.productTransmission },
		{ icon: <CalendarTodayOutlinedIcon />, label: t('Year'), value: yearValue },
		{ icon: <DirectionsCarFilledOutlinedIcon />, label: t('Car type'), value: product?.productType },
	];
	const features = [
		{ label: t('Fuel Type'), value: product?.productFuelType },
		{ label: t('Transmission'), value: product?.productTransmission },
		{ label: t('Car type'), value: product?.productType },
		{ label: t('Seats'), value: product?.productSeats ? `${product?.productSeats} ${t('seats')}` : '-' },
		{ label: t('Doors'), value: product?.productDoors ? `${product?.productDoors} ${t('doors')}` : '-' },
		{ label: t('Mileage'), value: `${formatterStr(product?.productMileage)} km` },
	];

	const reveal: any = shouldReduceMotion
		? {}
		: {
				initial: { opacity: 0, y: 24 },
				whileInView: { opacity: 1, y: 0 },
				viewport: { once: true, margin: '-80px' },
				transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
		  };
	const gridStagger: any = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06 } },
	};
	const gridItem: any = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
	};

	if (getProductLoading && !product) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '1000px' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (device === 'mobile') {
		const scrollToDealer = () => {
			document.getElementById('m-dealer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		};

		return (
			<div id={'carlen-product-detail-mobile'}>
				{/* 1. GALLERY */}
				<section className={'m-gallery'}>
					<Swiper
						className={'m-gallery-swiper'}
						slidesPerView={1}
						spaceBetween={0}
						pagination={{ clickable: true }}
						modules={[Pagination]}
					>
						{(product?.productImages ?? []).map((img: string) => (
							<SwiperSlide key={img}>
								<div
									className={'m-slide'}
									style={{ backgroundImage: `url(${img ? `${REACT_APP_API_URL}/${img}` : '/img/cars/bigImage.png'})` }}
								/>
							</SwiperSlide>
						))}
					</Swiper>
					<div className={'m-gallery-overlay'}>
						<div className={'m-gallery-top'}>
							<span className={'m-badge verified'}>
								<VerifiedOutlinedIcon /> Verified
							</span>
							{product?.productType && <span className={'m-badge type'}>{product?.productType}</span>}
						</div>
						<div className={'m-gallery-price'}>${formatterStr(product?.productPrice)}</div>
					</div>
				</section>

				{/* 2. SUMMARY */}
				<section className={'m-summary'}>
					<h1 className={'m-title'}>{product?.productTitle}</h1>
					<div className={'m-loc'}>
						<PlaceOutlinedIcon /> {product?.productLocation}
					</div>
					<div className={'m-stats'}>
						<span className={'m-stat'}>
							<RemoveRedEyeIcon /> {product?.productViews}
						</span>
						<span
							className={isLiked ? 'm-stat like active' : 'm-stat like'}
							onClick={() => likeProductHandler(user, product?._id as string)}
						>
							{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />} {product?.productLikes}
						</span>
						<span className={'m-stat'}>{moment().diff(product?.createdAt, 'days')}d ago</span>
					</div>
					<div className={'m-pills'}>
						{summaryPills.map((pill: string, i: number) => (
							<span className={'m-pill'} key={`${pill}-${i}`}>
								{pill}
							</span>
						))}
					</div>
				</section>

				{/* 3. SPECS */}
				<section className={'m-section m-specs'}>
					<h2 className={'m-section-title'}>{t('Specifications')}</h2>
					<div className={'m-spec-grid'}>
						{specs.map((spec) => (
							<div className={'m-spec-card'} key={spec.label}>
								<span className={'m-spec-icon'}>{spec.icon}</span>
								<div className={'m-spec-text'}>
									<span className={'m-spec-label'}>{spec.label}</span>
									<strong className={'m-spec-value'}>{spec.value}</strong>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* 4. DESCRIPTION */}
				<section className={'m-section'}>
					<h2 className={'m-section-title'}>{t('Vehicle Description')}</h2>
					<p className={'m-desc'}>{product?.productDesc ?? t('No description available.')}</p>
				</section>

				{/* 5. FEATURES */}
				<section className={'m-section'}>
					<h2 className={'m-section-title'}>{t('Vehicle Features')}</h2>
					<div className={'m-feature-grid'}>
						{features.map((f) => (
							<div className={'m-feature-card'} key={f.label}>
								<span className={'m-feature-label'}>{f.label}</span>
								<strong className={'m-feature-value'}>{f.value}</strong>
							</div>
						))}
					</div>
				</section>

				{/* 6. MAP */}
				<section className={'m-section'}>
					<h2 className={'m-section-title'}>{t('Location')}</h2>
					<div className={'m-map'}>
						{mapQuery ? (
							<iframe
								title={'vehicle-location'}
								src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
								width="100%"
								height="100%"
								style={{ border: 0 }}
								allowFullScreen={true}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							></iframe>
						) : (
							<div className={'m-map-placeholder'}>
								<PlaceOutlinedIcon />
								<span>{t('Location not specified')}</span>
							</div>
						)}
					</div>
				</section>

				{/* 7. DEALER */}
				<section className={'m-section m-dealer'} id={'m-dealer'}>
					<h2 className={'m-section-title'}>{t('Contact Dealer')}</h2>
					<div className={'m-dealer-info'}>
						<img
							className={'m-dealer-avatar'}
							src={
								product?.memberData?.memberImage
									? `${REACT_APP_API_URL}/${product?.memberData?.memberImage}`
									: '/img/profile/defaultUser.svg'
							}
							alt={'dealer'}
						/>
						<div className={'m-dealer-meta'}>
							<span className={'m-dealer-badge'}>
								<VerifiedOutlinedIcon /> {t('Verified Dealer')}
							</span>
							<Link href={`/member?memberId=${product?.memberData?._id}`}>
								<span className={'m-dealer-name'}>{product?.memberData?.memberNick}</span>
							</Link>
							<span className={'m-dealer-phone'}>{product?.memberData?.memberPhone}</span>
						</div>
					</div>
					<div className={'m-dealer-form'}>
						<input type={'text'} placeholder={t('Your name')} />
						<input type={'text'} placeholder={t('Your phone')} />
						<textarea placeholder={t('Hello, I am interested in this vehicle.')}></textarea>
						<Button className={'m-send-inquiry'}>
							<ChatBubbleOutlineRoundedIcon />
							Send Inquiry
						</Button>
					</div>
				</section>

				{/* 8. REVIEWS */}
				{commentTotal !== 0 && (
					<section className={'m-section'}>
						<h2 className={'m-section-title'}>{t('review_other', { count: commentTotal })}</h2>
						<div className={'m-review-list'}>
							{productComments?.map((comment: Comment) => (
								<Review comment={comment} key={comment?._id} />
							))}
							<Box component={'div'} className={'m-pagination'}>
								<MuiPagination
									page={commentInquiry.page}
									count={Math.ceil(commentTotal / commentInquiry.limit)}
									onChange={commentPaginationChangeHandler}
									shape="circular"
									color="primary"
								/>
							</Box>
						</div>
					</section>
				)}

				<section className={'m-section'}>
					<h2 className={'m-section-title'}>{t('Leave A Review')}</h2>
					<textarea
						className={'m-review-input'}
						placeholder={t('Share your experience with this vehicle...')}
						onChange={({ target: { value } }: any) => {
							setInsertCommentData({ ...insertCommentData, commentContent: value });
						}}
						value={insertCommentData.commentContent}
					></textarea>
					<Button
						className={'m-submit-review'}
						disabled={insertCommentData.commentContent === '' || user?._id === ''}
						onClick={createCommentHandler}
					>
						Submit Review
						<EastIcon />
					</Button>
				</section>

				{/* 9. SIMILAR CARS */}
				{destinationProducts.length !== 0 && (
					<section className={'m-section m-similar'}>
						<h2 className={'m-section-title'}>{t('Similar Cars')}</h2>
						<Swiper className={'m-similar-swiper'} slidesPerView={'auto'} spaceBetween={14} modules={[]}>
							{destinationProducts.map((p: Product) => (
								<SwiperSlide className={'m-similar-slide'} key={p?._id}>
									<ProductBigCard product={p} likePropertyHandler={likeProductHandler} />
								</SwiperSlide>
							))}
						</Swiper>
					</section>
				)}

				{/* STICKY ACTION BAR */}
				<div className={'m-action-bar'}>
					<div className={'m-action-price'}>
						<span className={'lbl'}>{t('Price')}</span>
						<strong>${formatterStr(product?.productPrice)}</strong>
					</div>
					<button type={'button'} className={'m-action-btn'} onClick={scrollToDealer}>
						<ChatBubbleOutlineRoundedIcon />
						Contact dealer
					</button>
				</div>
			</div>
		);
	} else {
		return (
			<div id={'carlen-product-detail-page'}>
				<div className={'container'}>
					{/* 1. HERO GALLERY */}
					<motion.section className={'carlen-product-hero'} {...reveal}>
						<div className={'carlen-product-gallery'}>
							<div className={'main-image'}>
								<AnimatePresence mode={'wait'}>
									<motion.img
										key={slideImage}
										src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/cars/bigImage.png'}
										alt={'main-image'}
										initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
										transition={{ duration: 0.3 }}
									/>
								</AnimatePresence>
								<div className={'hero-overlay'}>
									<div className={'hero-top'}>
										<span className={'hero-badge verified'}>
											<VerifiedOutlinedIcon /> Verified
										</span>
										{product?.productType && <span className={'hero-badge type'}>{product?.productType}</span>}
									</div>
									<div className={'hero-bottom'}>
										<div className={'hero-price'}>${formatterStr(product?.productPrice)}</div>
										<div className={'hero-stats'}>
											<span className={'stat'}>
												<RemoveRedEyeIcon /> {product?.productViews}
											</span>
											<span
												className={isLiked ? 'stat like active' : 'stat like'}
												onClick={() => likeProductHandler(user, product?._id as string)}
											>
												{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />} {product?.productLikes}
											</span>
											<span className={'stat'}>{moment().diff(product?.createdAt, 'days')} days ago</span>
										</div>
									</div>
								</div>
							</div>
							<div className={'thumbs'}>
								{product?.productImages.map((subImg: string) => {
									const imagePath: string = `${REACT_APP_API_URL}/${subImg}`;
									return (
										<div
											className={subImg === slideImage ? 'thumb active' : 'thumb'}
											onClick={() => changeImageHandler(subImg)}
											key={subImg}
										>
											<img src={imagePath} alt={'sub-image'} />
										</div>
									);
								})}
							</div>
						</div>
					</motion.section>

					{/* 2. OVERVIEW SUMMARY */}
					<motion.section className={'carlen-product-summary'} {...reveal}>
						<h1 className={'title'}>{product?.productTitle}</h1>
						<div className={'sub'}>
							<span className={'location'}>
								<PlaceOutlinedIcon /> {product?.productLocation}
							</span>
						</div>
						<div className={'pills'}>
							{summaryPills.map((pill: string, i: number) => (
								<span className={'pill'} key={`${pill}-${i}`}>
									{pill}
								</span>
							))}
						</div>
					</motion.section>

					<div className={'carlen-product-body'}>
						<div className={'carlen-product-left'}>
							{/* 3. SPECS GRID */}
							<motion.section
								className={'carlen-product-specs'}
								variants={gridStagger}
								initial={'hidden'}
								whileInView={'visible'}
								viewport={{ once: true, margin: '-80px' }}
							>
								{specs.map((spec) => (
									<motion.div className={'spec-card'} variants={gridItem} key={spec.label}>
										<span className={'spec-icon'}>{spec.icon}</span>
										<div className={'spec-text'}>
											<span className={'spec-label'}>{spec.label}</span>
											<strong className={'spec-value'}>{spec.value}</strong>
										</div>
									</motion.div>
								))}
							</motion.section>

							{/* 4. DESCRIPTION */}
							<motion.section className={'carlen-product-description'} {...reveal}>
								<h2 className={'section-title'}>{t('Vehicle Description')}</h2>
								<p className={'desc'}>{product?.productDesc ?? t('No description available.')}</p>
							</motion.section>

							{/* 5. VEHICLE FEATURES */}
							<motion.section className={'carlen-product-features'} {...reveal}>
								<h2 className={'section-title'}>{t('Vehicle Features')}</h2>
								<div className={'feature-grid'}>
									{features.map((f) => (
										<div className={'feature-card'} key={f.label}>
											<span className={'feature-label'}>{f.label}</span>
											<strong className={'feature-value'}>{f.value}</strong>
										</div>
									))}
								</div>
							</motion.section>

							{/* 6. LOCATION / MAP */}
							<motion.section className={'carlen-product-map'} {...reveal}>
								<h2 className={'section-title'}>{t('Location')}</h2>
								<div className={'map-box'}>
									{mapQuery ? (
										<iframe
											title={'vehicle-location'}
											src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
											width="100%"
											height="100%"
											style={{ border: 0 }}
											allowFullScreen={true}
											loading="lazy"
											referrerPolicy="no-referrer-when-downgrade"
										></iframe>
									) : (
										<div className={'map-placeholder'}>
											<PlaceOutlinedIcon />
											<span>{t('Location not specified')}</span>
										</div>
									)}
								</div>
							</motion.section>

							{/* 8. REVIEWS */}
							{commentTotal !== 0 && (
								<motion.section className={'carlen-product-reviews'} {...reveal}>
									<div className={'reviews-head'}>
										<StarRoundedIcon />
										<h2 className={'section-title'}>{t('review_other', { count: commentTotal })}</h2>
									</div>
									<div className={'review-list'}>
										{productComments?.map((comment: Comment) => {
											return <Review comment={comment} key={comment?._id} />;
										})}
										<Box component={'div'} className={'pagination-box'}>
											<MuiPagination
												page={commentInquiry.page}
												count={Math.ceil(commentTotal / commentInquiry.limit)}
												onChange={commentPaginationChangeHandler}
												shape="circular"
												color="primary"
											/>
										</Box>
									</div>
								</motion.section>
							)}

							<motion.section className={'carlen-leave-review'} {...reveal}>
								<h2 className={'section-title'}>{t('Leave A Review')}</h2>
								<textarea
									placeholder={t('Share your experience with this vehicle...')}
									onChange={({ target: { value } }: any) => {
										setInsertCommentData({ ...insertCommentData, commentContent: value });
									}}
									value={insertCommentData.commentContent}
								></textarea>
								<Button
									className={'submit-review'}
									disabled={insertCommentData.commentContent === '' || user?._id === ''}
									onClick={createCommentHandler}
								>
									{t('Submit Review')}
									<EastIcon />
								</Button>
							</motion.section>
						</div>

						{/* 7. DEALER CONTACT CARD */}
						<motion.aside
							className={'carlen-dealer-card'}
							initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
							whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-80px' }}
							transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
						>
							<h3 className={'dealer-title'}>{t('Contact Dealer')}</h3>
							<div className={'dealer-info'}>
								<img
									className={'dealer-avatar'}
									src={
										product?.memberData?.memberImage
											? `${REACT_APP_API_URL}/${product?.memberData?.memberImage}`
											: '/img/profile/defaultUser.svg'
									}
									alt={'dealer'}
								/>
								<div className={'dealer-meta'}>
									<span className={'dealer-badge'}>
										<VerifiedOutlinedIcon /> {t('Verified Dealer')}
									</span>
									<Link href={`/member?memberId=${product?.memberData?._id}`}>
										<span className={'dealer-name'}>{product?.memberData?.memberNick}</span>
									</Link>
									<span className={'dealer-phone'}>{product?.memberData?.memberPhone}</span>
									<span className={'dealer-listings'}>{t('listing_other', { count: product?.memberData?.memberProducts ?? 0 })}</span>
								</div>
							</div>
							<div className={'dealer-form'}>
								<input type={'text'} placeholder={t('Your name')} />
								<input type={'text'} placeholder={t('Your phone')} />
								<input type={'text'} placeholder={t('Your email')} />
								<textarea placeholder={t('Hello, I am interested in this vehicle.')}></textarea>
								<Button className={'send-inquiry'}>
									<ChatBubbleOutlineRoundedIcon />
									{t('Send Inquiry')}
								</Button>
							</div>
						</motion.aside>
					</div>

					{/* 9. SIMILAR CARS */}
					{destinationProducts.length !== 0 && (
						<motion.section className={'carlen-similar-products'} {...reveal}>
							<div className={'carlen-similar-wrapper'}>
								<div className={'carlen-similar-header'}>
									<div className={'carlen-similar-titles'}>
										<span className={'carlen-similar-eyebrow'}>{t('Recommended For You')}</span>
										<h2 className={'carlen-similar-title'}>{t('Similar Cars')}</h2>
										<span className={'carlen-similar-subtitle'}>{t('Vehicles you may also like')}</span>
									</div>
									<div className={'carlen-similar-controls'}>
										<button className={'carlen-similar-prev swiper-similar-prev'} aria-label={t('Previous')}>
											<WestIcon />
										</button>
										<div className={'carlen-similar-pagination swiper-similar-pagination'}></div>
										<button className={'carlen-similar-next swiper-similar-next'} aria-label={t('Next')}>
											<EastIcon />
										</button>
									</div>
								</div>
								<Swiper
									className={'carlen-similar-swiper'}
									slidesPerView={'auto'}
									spaceBetween={28}
									modules={[Autoplay, Navigation, Pagination]}
									navigation={{
										nextEl: '.carlen-similar-next.swiper-similar-next',
										prevEl: '.carlen-similar-prev.swiper-similar-prev',
									}}
									pagination={{
										el: '.carlen-similar-pagination.swiper-similar-pagination',
										clickable: true,
									}}
								>
									{destinationProducts.map((product: Product, i: number) => {
										return (
											<SwiperSlide className={'carlen-similar-slide'} key={product?._id}>
												<motion.div
													initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
													whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
													viewport={{ once: true, margin: '-60px' }}
													transition={{ type: 'spring', stiffness: 320, damping: 28, delay: Math.min(i, 5) * 0.06 }}
												>
													<ProductBigCard product={product} likePropertyHandler={likeProductHandler} key={product?._id} />
												</motion.div>
											</SwiperSlide>
										);
									})}
								</Swiper>
							</div>
						</motion.section>
					)}
				</div>
			</div>
		);
	}
};

ProductDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(ProductDetail);
