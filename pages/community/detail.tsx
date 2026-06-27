import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Typography, IconButton, Backdrop, Pagination } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import CommunityCard from '../../libs/components/common/CommunityCard';
import dynamic from 'next/dynamic';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import EditIcon from '@mui/icons-material/Edit';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLE, GET_BOARD_ARTICLES, GET_COMMENTS } from '../../apollo/user/query';
import {  sweetConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import { useTranslation } from 'next-i18next';
const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CATEGORY_TABS: { value: string; label: string; icon: React.ReactNode }[] = [
	{ value: 'FREE', label: 'Free Discussion', icon: <ForumOutlinedIcon /> },
	{ value: 'RECOMMEND', label: 'Recommendations', icon: <StarOutlineRoundedIcon /> },
	{ value: 'NEWS', label: 'Automotive News', icon: <ArticleOutlinedIcon /> },
	{ value: 'HUMOR', label: 'Humor & Fun', icon: <SentimentSatisfiedAltOutlinedIcon /> },
];

const CATEGORY_META: Record<string, string> = {
	FREE: 'Free Discussion',
	RECOMMEND: 'Recommendations',
	NEWS: 'Automotive News',
	HUMOR: 'Humor & Fun',
};

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const { query } = router;
	const shouldReduceMotion = useReducedMotion();
	const { t } = useTranslation('common');

	const articleId = query?.id as string;
	const articleCategory = query?.articleCategory as string;

	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [updatedCommentWordsCnt, setUpdatedCommentWordsCnt] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({
		...initialInput,
	});
	const [memberImage, setMemberImage] = useState<string>('/img/community/articleImg.png');
	const [anchorEl, setAnchorEl] = useState<any | null>(null);
	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [boardArticle, setBoardArticle] = useState<BoardArticle>();
	const [relatedArticles, setRelatedArticles] = useState<BoardArticle[]>([]);
	const commentsInquiryInput: CommentsInquiry = {
		...searchFilter,
		search: {
			...searchFilter.search,
			commentRefId: articleId || searchFilter.search.commentRefId,
		},
	};

	/** APOLLO REQUESTS **/
	// MUTATIONS
	const [likeTargetBoartArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const {
		loading: getBoardArticleLoading,
		data: getBoardArticleData,
		error: getBoardArticleError,
		refetch: getBoardArticleRefetch,
	} = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: { input: articleId },
		skip: !articleId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			{
				console.log('data', data.getBoardArticle);
			}
			setBoardArticle(data?.getBoardArticle);
			if (data?.getBoardArticle?.memberData?.memberImage) {
				setMemberImage(`${process.env.REACT_APP_API_URL}/${data?.getBoardArticle?.memberData?.memberImage}`);
			}
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentsInquiryInput },
		skip: !articleId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
			setTotal(data?.getComments?.metaCounter[0]?.total || 0);
		},
	});

	const { refetch: getRelatedArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: 'DESC',
				search: { articleCategory },
			},
		},
		notifyOnNetworkStatusChange: true,
		skip: !articleCategory,
		onCompleted: (data: T) => {
			setRelatedArticles(data?.getBoardArticles?.list ?? []);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (articleId) {
			setSearchFilter((prev) => ({ ...prev, search: { ...prev.search, commentRefId: articleId } }));
		}
	}, [articleId]);

	/** ANIMATION **/
	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08, delayChildren: 0.05 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
	};

	/** HANDLERS **/
	const tabChangeHandler = (event: React.SyntheticEvent, value: string) => {
		router.replace(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			'/community',
			{ shallow: true },
		);
	};

	const creteCommentHandler = async () => {
		if (!comment) return;
		try {
			if (!user?._id) throw new Error(Messages.error2);
			const commentInput: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment,
			};
			await createComment({
				variables: {
					input: commentInput,
				},
			});
			await getCommentsRefetch({ input: commentsInquiryInput });
			await getBoardArticleRefetch({ input: articleId });
			setComment('');
			setWordsCnt(0);
			await sweetTopSmallSuccessAlert(t('Successfully commented!'));
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			if (!commentId) throw new Error('Select a comment to update!');
			if (updatedComment === comments?.find((comment) => comment?._id === commentId)?.commentContent) return;

			const updateData: CommentUpdate = {
				_id: commentId,
				...(commentStatus && { commentStatus: commentStatus }),
				...(updatedComment && { commentContent: updatedComment }),
			};

			if (!updateData?.commentContent && !updateData?.commentStatus)
				throw new Error('Provide data to update your comment!');

			if (commentStatus) {
				if (await sweetConfirmAlert(t('Do you want to delete the comment?'))) {
					await updateComment({
						variables: {
							input: updateData,
						},
					});
				await sweetMixinSuccessAlert(t('Successfully deleted!'));
				} else return;
			} else {
				await updateComment({
					variables: {
						input: updateData,
					},
				});
				await sweetMixinSuccessAlert(t('Successfully updated!'));
			}
			await getCommentsRefetch({ input: commentsInquiryInput });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		} finally {
			setOpenBackdrop(false);
			setUpdatedComment('');
			setUpdatedCommentWordsCnt(0);
			setUpdatedCommentId('');
		}
	};


	const getCommentMemberImage = (imageUrl: string | undefined) => {
		if (imageUrl) return `${process.env.REACT_APP_API_URL}/${imageUrl}`;
		else return '/img/community/articleImg.png';
	};

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const cancelButtonHandler = () => {
		setOpenBackdrop(false);
		setUpdatedComment('');
		setUpdatedCommentWordsCnt(0);
	};

	const updateCommentInputHandler = (value: string) => {
		if (value.length > 100) return;
		setUpdatedCommentWordsCnt(value.length);
		setUpdatedComment(value);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};


	const likeBoardArticleHandler = async (user: T, id: string | undefined) => {
		try {
			if (likeLoading) return;
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			setLikeLoading(true);

			const { data } = await likeTargetBoartArticle({ variables: { input: id } });

			// Update like state locally (the mutation returns the new count) instead of
			// refetching GET_BOARD_ARTICLE, which would flash the article body skeleton.
			setBoardArticle((prev) => {
				if (!prev) return prev;
				const wasLiked = !!prev.meLiked?.[0]?.myFavorite;
				return {
					...prev,
					articleLikes: data?.likeTargetBoardArticle?.articleLikes ?? prev.articleLikes,
					meLiked: [{ memberId: user._id, likeRefId: id, myFavorite: !wasLiked }],
				};
			});

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeBoardArticleHandler:',	 err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setLikeLoading(false);
		}
	};

	const writeArticleHandler = () => {
		router.push({ pathname: '/mypage', query: { category: 'writeArticle' } });
	};

	const relatedLikeHandler = async (e: any, user: T, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoartArticle({ variables: { input: id } });
			await getRelatedArticlesRefetch();

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, relatedLikeHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const related = relatedArticles.filter((a) => a?._id !== articleId).slice(0, 3);
	const displayedCommentsCount = getCommentsData ? total : boardArticle?.articleComments ?? 0;

	return (
			<div id="carlen-community-detail-page">
				<div className="container">
					<Stack className="carlen-community-detail-layout">
						<motion.aside
							className="carlen-community-sidebar"
							variants={container}
							initial="hidden"
							animate="visible"
						>
							<Stack className="brand-row">
								<img src={'/img/logo/logoText.svg'} alt="Carlen" className={'carlen-logo-hover'} />
								<Typography className="brand-name">{t('Carlen Community')}</Typography>
							</Stack>
							<nav className="sidebar-nav">
								{CATEGORY_TABS.map((tab) => (
									<motion.button
										type="button"
										key={tab.value}
										variants={item}
										whileHover={shouldReduceMotion ? undefined : { x: 2 }}
										whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
										className={`nav-item ${articleCategory === tab.value ? 'active' : ''}`}
										onClick={(e: React.SyntheticEvent) => tabChangeHandler(e, tab.value)}
									>
										<span className="nav-icon">{tab.icon}</span>
										<span className="nav-label">{t(tab.label)}</span>
									</motion.button>
								))}
							</nav>
						</motion.aside>

						<Stack className="carlen-community-content">
							{/** ARTICLE HERO **/}
							<motion.section
								className="carlen-article-panel"
								variants={container}
								initial="hidden"
								animate="visible"
							>
								<motion.div className="panel-top" variants={item}>
									<span className="category-chip">{t(CATEGORY_META[articleCategory] ?? 'Discussion')}</span>
									<motion.button
										type="button"
										className="write-cta"
										onClick={writeArticleHandler}
										whileHover={shouldReduceMotion ? undefined : { y: -2 }}
										whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
									>
										<EditOutlinedIcon />
										{t('Write')}
									</motion.button>
								</motion.div>

								<motion.h1 className="article-title" variants={item}>
									{boardArticle?.articleTitle}
								</motion.h1>

								<motion.div className="author-row" variants={item}>
									{/* <img
										src={memberImage}
										alt=""
										className="author-avatar"
										onClick={() => goMemberPage(boardArticle?.memberData?._id)}
									/> */}
									<Stack className="author-meta">
										<Typography className="author-nick" onClick={() => goMemberPage(boardArticle?.memberData?._id)}>
											{boardArticle?.memberData?.memberNick}
										</Typography>
										<Moment className={'author-date'} format={'DD.MM.YY HH:mm'}>
											{boardArticle?.createdAt}
										</Moment>
									</Stack>

									{/* <Stack className="stat-chips">
										<span className="stat-chip">
											<ThumbUpOffAltIcon />
											{boardArticle?.articleLikes ?? 0}
										</span>
										<span className="stat-chip">
											<VisibilityIcon />
											{boardArticle?.articleViews ?? 0}
										</span>
										<span className="stat-chip">
											<ChatBubbleOutlineRoundedIcon />
											{boardArticle?.articleComments ?? 0}
										</span>
									</Stack> */}
								</motion.div>
							</motion.section>

							{/** ARTICLE BODY **/}
							<motion.div
								className="carlen-article-body"
								initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
								animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
								transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
							>
								{getBoardArticleLoading && !boardArticle ? (
									<div className="article-skeleton">
										<span className="sk-line w-90" />
										<span className="sk-line w-95" />
										<span className="sk-line w-80" />
										<span className="sk-line w-60" />
									</div>
								) : (
									<ToastViewerComponent key={boardArticle?._id} markdown={boardArticle?.articleContent} />
								)}
							</motion.div>

							{/** REACTION BAR **/}
							<Stack className="carlen-article-actions">
								<motion.button
									type="button"
									className={`reaction-btn ${boardArticle?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
									onClick={() => likeBoardArticleHandler(user, boardArticle?._id)}
									whileHover={shouldReduceMotion ? undefined : { y: -2 }}
									whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
								>
									{boardArticle?.meLiked?.[0]?.myFavorite ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
									<span className="reaction-label">{t('Like')}</span>
									<span className="reaction-count">{boardArticle?.articleLikes ?? 0}</span>
								</motion.button>
								<div className="reaction-btn static">
									<VisibilityIcon />
									<span className="reaction-label">{t('Views')}</span>
									<span className="reaction-count">{boardArticle?.articleViews ?? 0}</span>
								</div>
								<div className="reaction-btn static">
									<ChatBubbleOutlineRoundedIcon />
									<span className="reaction-label">{t('Comments')}</span>
									<span className="reaction-count">{displayedCommentsCount}</span>
								</div>
							</Stack>

							{/** RELATED ARTICLES **/}
							{/* {related.length > 0 && (
								<motion.section
									className="carlen-related-articles"
									variants={container}
									initial="hidden"
									animate="visible"
								>
									<Stack className="related-header">
										<Typography className="related-title">Related Articles</Typography>
									</Stack>
									<motion.div className="related-grid" variants={container}>
										{related.map((relatedArticle: BoardArticle) => (
											<motion.div variants={item} key={relatedArticle?._id}>
												<CommunityCard
													boardArticle={relatedArticle}
													size={'small'}
													likeArticleHandler={relatedLikeHandler}
												/>
											</motion.div>
										))}
									</motion.div>
								</motion.section>
							)} */}

							{/** COMMENTS **/}
							<Stack className="carlen-comment-form">
								<Stack className="discussion-header">
									<Typography className="discussion-title">{t('Discussion')}</Typography>
									<Typography className="discussion-subtitle">{t('Join the conversation.')}</Typography>
								</Stack>
								<Stack className="leave-comment">
									<textarea
										className="comment-textarea"
										placeholder={t('Share your thoughts with the community')}
										value={comment}
										maxLength={100}
										onChange={(e) => {
											if (e.target.value.length > 100) return;
											setWordsCnt(e.target.value.length);
											setComment(e.target.value);
										}}
									/>
									<Stack className="comment-actions">
										<Typography className="char-count">{wordsCnt}/100</Typography>
										<motion.button
											type="button"
											className="cta-primary"
											onClick={creteCommentHandler}
											whileHover={shouldReduceMotion ? undefined : { y: -2 }}
											whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
										>
											{t('Post Comment')}
										</motion.button>
									</Stack>
								</Stack>
							</Stack>

							{getCommentsLoading ? (
								<Stack className="comments-list">
									{Array.from({ length: 3 }).map((_, idx) => (
										<div className="comment-skeleton" key={idx}>
											<span className="sk-avatar" />
											<div className="sk-body">
												<span className="sk-line w-40" />
												<span className="sk-line w-90" />
											</div>
										</div>
									))}
								</Stack>
							) : total === 0 ? (
								<Stack className="comments-empty">
									<span className="empty-icon">
										<ForumOutlinedIcon />
									</span>
									<Typography className="empty-title">{t('No discussions yet')}</Typography>
									<Typography className="empty-subtitle">{t('Be the first to join the conversation.')}</Typography>
								</Stack>
							) : (
								<motion.div
									className="comments-list"
									variants={container}
									initial="hidden"
									animate="visible"
									key={searchFilter.page}
								>
									{comments?.map((commentData, index) => {
										return (
											<motion.div className="carlen-comment-card" key={commentData?._id} variants={item}>
												<Stack className="member-info">
													<Stack
														className="name-date"
														onClick={() => goMemberPage(commentData?.memberData?._id as string)}
													>
														<img src={getCommentMemberImage(commentData?.memberData?.memberImage)} alt="" />
														<Stack className="name-date-column">
															<Typography className="name">{commentData?.memberData?.memberNick}</Typography>
															<Typography className="date">
																<Moment className={'time-added'} format={'DD.MM.YY HH:mm'}>
																	{commentData?.createdAt}
																</Moment>
															</Typography>
														</Stack>
													</Stack>
													{commentData?.memberId === user?._id && (
														<Stack className="buttons">
															<IconButton
																className="ghost-icon"
																onClick={() => {
																	setUpdatedCommentId(commentData?._id);
																	updateButtonHandler(commentData?._id, CommentStatus.DELETE);
																}}
															>
																<DeleteForeverIcon />
															</IconButton>
															<IconButton
																className="ghost-icon"
																onClick={(e: any) => {
																	setUpdatedComment(commentData?.commentContent);
																	setUpdatedCommentWordsCnt(commentData?.commentContent?.length);
																	setUpdatedCommentId(commentData?._id);
																	setOpenBackdrop(true);
																}}
															>
																<EditIcon />
															</IconButton>
														</Stack>
													)}
												</Stack>
												<Stack className="comment-content">
													<Typography>{commentData?.commentContent}</Typography>
												</Stack>
											</motion.div>
										);
									})}
								</motion.div>
							)}

							{/** EDIT MODAL **/}
							<Backdrop className="carlen-edit-backdrop" open={openBackdrop}>
								<Stack className="carlen-edit-modal">
									<Typography className="modal-title">{t('Update comment')}</Typography>
									<textarea
										autoFocus
										className="modal-textarea"
										value={updatedComment}
										maxLength={100}
										onChange={(e) => updateCommentInputHandler(e.target.value)}
									/>
									<Stack className="modal-footer">
										<Typography className="char-count">{updatedCommentWordsCnt}/100</Typography>
										<Stack className="modal-buttons">
											<button type="button" className="cta-secondary" onClick={() => cancelButtonHandler()}>
												{t('Cancel')}
											</button>
											<button
												type="button"
												className="cta-primary"
												onClick={() => updateButtonHandler(updatedCommentId, undefined)}
											>
												{t('Update')}
											</button>
										</Stack>
									</Stack>
								</Stack>
							</Backdrop>

							{total > 0 && (
								<Stack className="carlen-community-pagination">
									<Pagination
										count={Math.ceil(total / searchFilter.limit) || 1}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
							)}
						</Stack>
					</Stack>
				</div>
			</div>
		);
};
CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);
