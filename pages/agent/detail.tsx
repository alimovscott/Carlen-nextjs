import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';
import ReviewCard from '../../libs/components/agent/ReviewCard';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Product } from '../../libs/types/product/product';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_COMMENTS, GET_MEMBER, GET_PRODUCTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { CREATE_COMMENT, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const shouldReduceMotion = useReducedMotion();
	const [agentId, setAgentId] = useState<string | null>(null);
	const [agent, setAgent] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(initialInput);
	const [agentProducts, setAgentProducts] = useState<Product[]>([]);
	const [productTotal, setPropertyTotal] = useState<number>(0);
	const [likeLoadingProductId, setLikeLoadingProductId] = useState<string | null>(null);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [agentComments, setAgentComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const likeLoadingProductIdRef = useRef<string | null>(null);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
			loading: getMemberLoading,
			data:getMemberData,
			error: getMemberError,
			refetch: getMemgerRefetch,
		} = useQuery(GET_MEMBER, {
			fetchPolicy: 'network-only',
			variables: { input: agentId},
			skip: !agentId,
			onCompleted: (data: T) => {
				setAgent(data?.getMember);
				setSearchFilter({
					...searchFilter,
					search: {
						memberId: data?.getMember?._id,
					},
				});
				setCommentInquiry({
					...commentInquiry,
					search:{
						commentRefId: data?.getMember?._id,
					},
				});
				setInsertCommentData({
					...insertCommentData,
					commentRefId: data?.getMember?._id,
				})
			}
		})

		const {
			loading: getProductsLoading,
			data:getProductsData,
			error: getProductsError,
			refetch: getProductsRefetch,
		} = useQuery(GET_PRODUCTS, {
			fetchPolicy: 'network-only',
			variables: { input: searchFilter},
			skip: !searchFilter.search.memberId,
			notifyOnNetworkStatusChange: true,
			onCompleted: (data: T) => {
				setAgentProducts(data?.getProducts?.list);
				setPropertyTotal(data?.getProducts?.metaCounter[0]?.total ?? 0);
			}
		})

		const {
			loading: getCommentsLoading,
			data:getCommentsData,
			error: getCommentsError,
			refetch: getCommentsRefetch,
		} = useQuery(GET_COMMENTS, {
			fetchPolicy: 'network-only',
			variables: { input: commentInquiry},
			skip: !commentInquiry.search.commentRefId,
			notifyOnNetworkStatusChange: true,
			onCompleted: (data: T) => {
				setAgentComments(data?.getComments?.list);
				setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
			}
		})
	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.agentId) setAgentId(router.query.agentId as string);
	}, [router]);

	useEffect(() => {
		if (searchFilter.search.memberId) {
			getProductsRefetch({ input: searchFilter }).then();
		}
	}, [searchFilter]);

	useEffect(() => {
		if(commentInquiry.search.commentRefId) {
			getCommentsRefetch({ variables: { inquiry: commentInquiry } }).then();
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const productPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		setSearchFilter({ ...searchFilter });
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};



	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === agentId) throw new Error('Cannot write a review for yourself');
			await createComment({
				 variables: { input: insertCommentData,
				 } });

			setInsertCommentData({ ...insertCommentData, commentContent: '' });

			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			if (likeLoadingProductIdRef.current === id) return;

			const currentProduct = agentProducts.find((product) => product?._id === id);
			const wasLiked = currentProduct?.meLiked?.[0]?.myFavorite ?? false;
			const fallbackLikes = Math.max((currentProduct?.productLikes ?? 0) + (wasLiked ? -1 : 1), 0);

			likeLoadingProductIdRef.current = id;
			setLikeLoadingProductId(id);

			const { data } = await likeTargetProduct({ variables: { input: id } });
			const updatedProduct = data?.likeTargetProduct as Product | undefined;
			const nextLiked = !wasLiked;
			const nextLikes =
				typeof updatedProduct?.productLikes === 'number' ? updatedProduct.productLikes : fallbackLikes;

			setAgentProducts((prevProducts) =>
				prevProducts.map((product) => {
					if (product?._id !== id) return product;

					return {
						...product,
						productLikes: nextLikes,
						meLiked: [
							{
								...(product?.meLiked?.[0] ?? {}),
								memberId: user._id,
								likeRefId: id,
								myFavorite: nextLiked,
							},
						],
					};
				}),
			);

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			likeLoadingProductIdRef.current = null;
			setLikeLoadingProductId(null);
		}
	};

	/** PREMIUM MOTION (reduced-motion aware) **/
	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08, delayChildren: 0.05 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
	};

	const dealerName = agent?.memberFullName ?? agent?.memberNick;
	const dealerStats = [
		{ key: 'listings', label: 'Listings', value: productTotal, icon: <DirectionsCarFilledOutlinedIcon /> },
		{ key: 'likes', label: 'Likes', value: agent?.memberLikes ?? 0, icon: <FavoriteBorderIcon /> },
		{ key: 'views', label: 'Views', value: agent?.memberViews ?? 0, icon: <VisibilityOutlinedIcon /> },
	];

	if (device === 'mobile') {
		return <div>AGENT DETAIL PAGE MOBILE</div>;
	} else {
		return (
			<Stack className={'carlen-agent-detail-page'}>
				<Stack className={'container'}>
					{/* 1 + 2. PREMIUM DEALER HERO */}
					<motion.section
						className={'carlen-agent-hero'}
						variants={container}
						initial={'hidden'}
						animate={'visible'}
					>
						<motion.div className={'carlen-agent-profile'} variants={item}>
							<div className={'avatar-ring'} onClick={() => redirectToMemberPageHandler(agent?._id as string)}>
								<img
									src={
										agent?.memberImage
											? `${REACT_APP_API_URL}/${agent?.memberImage}`
											: '/img/profile/defaultUser.svg'
									}
									alt=""
								/>
							</div>
							<Box component={'div'} className={'info'}>
								<span className={'verified-chip'}>
									<VerifiedOutlinedIcon />
									Verified Dealer
								</span>
								<strong onClick={() => redirectToMemberPageHandler(agent?._id as string)}>{dealerName}</strong>
								<div className={'phone-row'}>
									<PhoneOutlinedIcon />
									<span>{agent?.memberPhone}</span>
								</div>
								<p className={'dealer-desc'}>
									{agent?.memberDesc ?? 'Premium verified Carlen dealer offering hand-picked vehicles and trusted service.'}
								</p>
								<div className={'cta-row'}>
									<motion.a
										href={`tel:${agent?.memberPhone ?? ''}`}
										className={'cta-primary'}
										whileHover={shouldReduceMotion ? undefined : { y: -2 }}
										whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
									>
										<PhoneOutlinedIcon />
										Contact Dealer
									</motion.a>
									<motion.button
										type={'button'}
										className={'cta-secondary'}
										whileHover={shouldReduceMotion ? undefined : { y: -2 }}
										whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
										onClick={() => redirectToMemberPageHandler(agent?._id as string)}
									>
										View Profile
									</motion.button>
								</div>
							</Box>
						</motion.div>

						<motion.div className={'carlen-agent-stats'} variants={container}>
							{dealerStats.map((stat) => (
								<motion.div
									className={'stat-card'}
									key={stat.key}
									variants={item}
									whileHover={shouldReduceMotion ? undefined : { y: -4 }}
								>
									<span className={'stat-icon'}>{stat.icon}</span>
									<strong className={'stat-value'}>{stat.value}</strong>
									<span className={'stat-label'}>{stat.label}</span>
								</motion.div>
							))}
						</motion.div>
					</motion.section>

					{/* 3. DEALER PRODUCTS */}
					<Stack className={'carlen-agent-products'}>
						<div className={'carlen-agent-section-head'}>
							<h2>Dealer Listings</h2>
							<p>Premium vehicles from this dealer</p>
						</div>
						<motion.div
							className={'card-wrap'}
							variants={container}
							initial={'hidden'}
							animate={'visible'}
							viewport={{ once: true, amount: 0.1 }}
						>
							{getProductsLoading && agentProducts.length === 0 ? (
								<>
									{[0, 1, 2].map((i) => (
										<div className={'carlen-agent-product-skeleton'} key={i} />
									))}
								</>
							) : (
								agentProducts.map((product: Product) => {
									return (
										<motion.div
											className={
												likeLoadingProductId === product?._id
													? 'carlen-agent-product-wrap is-liking'
													: 'carlen-agent-product-wrap'
											}
											key={product?._id}
											variants={item}
											initial={'hidden'}
											animate={'visible'}
										>
											<PropertyBigCard product={product} key={product?._id} likePropertyHandler={likePropertyHandler} />
										</motion.div>
									);
								})
							)}
						</motion.div>
						<Stack className={'pagination'}>
							{productTotal ? (
								<>
									<Stack className="pagination-box">
										<Pagination
											page={searchFilter.page}
											count={Math.ceil(productTotal / searchFilter.limit) || 1}
											onChange={productPaginationChangeHandler}
											shape="circular"
											color="primary"
										/>
									</Stack>
									<span>
										Total {productTotal} product{productTotal > 1 ? 's' : ''} available
									</span>
								</>
							) : (
								!getProductsLoading && (
									<div className={'no-data'}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p>No products found!</p>
									</div>
								)
							)}
						</Stack>
					</Stack>

					{/* 4 + 5. REVIEWS + LEAVE REVIEW */}
					<Stack className={'carlen-agent-reviews'}>
						<div className={'carlen-agent-section-head'}>
							<h2>Customer Reviews</h2>
							<p>See what customers are saying</p>
						</div>
						{commentTotal !== 0 && (
							<Stack className={'review-wrap'}>
								<Box component={'div'} className={'title-box'}>
									<StarIcon />
									<span>
										{commentTotal} review{commentTotal > 1 ? 's' : ''}
									</span>
								</Box>
								{agentComments?.map((comment: Comment) => {
									return (
										<motion.div
											key={comment?._id}
											initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
											whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
											viewport={{ once: true, amount: 0.2 }}
											transition={{ type: 'spring', stiffness: 300, damping: 30 }}
										>
											<ReviewCard comment={comment} />
										</motion.div>
									);
								})}
								<Box component={'div'} className={'pagination-box'}>
									<Pagination
										page={commentInquiry.page}
										count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
										onChange={commentPaginationChangeHandler}
										shape="circular"
										color="primary"
									/>
								</Box>
							</Stack>
						)}

						<Stack className={'carlen-agent-review-form'}>
							<Typography className={'main-title'}>Leave A Review</Typography>
							<Typography className={'review-title'}>Review</Typography>
							<textarea
								placeholder={'Share your experience with this dealer...'}
								onChange={({ target: { value } }: any) => {
									setInsertCommentData({ ...insertCommentData, commentContent: value });
								}}
								value={insertCommentData.commentContent}
							></textarea>
							<Box className={'submit-btn'} component={'div'}>
								<motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
									<Button
										className={'submit-review'}
										disabled={insertCommentData.commentContent === '' || user?._id === ''}
										onClick={createCommentHandler}
									>
										<Typography className={'title'}>Submit Review</Typography>
										<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
											<g clipPath="url(#clip0_6975_3642)">
												<path
													d="M16.1571 0.5H6.37936C6.1337 0.5 5.93491 0.698792 5.93491 0.944458C5.93491 1.19012 6.1337 1.38892 6.37936 1.38892H15.0842L0.731781 15.7413C0.558156 15.915 0.558156 16.1962 0.731781 16.3698C0.818573 16.4566 0.932323 16.5 1.04603 16.5C1.15974 16.5 1.27345 16.4566 1.36028 16.3698L15.7127 2.01737V10.7222C15.7127 10.9679 15.9115 11.1667 16.1572 11.1667C16.4028 11.1667 16.6016 10.9679 16.6016 10.7222V0.944458C16.6016 0.698792 16.4028 0.5 16.1571 0.5Z"
													fill="#181A20"
												/>
											</g>
											<defs>
												<clipPath id="clip0_6975_3642">
													<rect width="16" height="16" fill="white" transform="translate(0.601562 0.5)" />
												</clipPath>
											</defs>
										</svg>
									</Button>
								</motion.div>
							</Box>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

AgentDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 3,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(AgentDetail);
