import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Pagination, Stack, Typography } from '@mui/material';
import CommunityCard from '../common/CommunityCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState({
		...initialInput,
		search: { memberId: user._id },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: boardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const writeArticleHandler = () => {
		router.push({ pathname: '/mypage', query: { category: 'writeArticle' } });
	};

	// LIKE BOARD ARTICLE HANDLER
	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({ variables: { input: id } });

			await boardArticlesRefetch({ input: searchCommunity });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeBoardArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	/** ANIMATION **/
	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.07, delayChildren: 0.04 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
	};

	return (
			<div id="carlen-my-articles-page">
				<motion.div className="carlen-section-header" variants={container} initial="hidden" animate="visible">
					<motion.div className="head-text" variants={item}>
						<span className="eyebrow">{t('PUBLISHING CENTER')}</span>
						<Typography className="title">{t('My Articles')}</Typography>
						<Typography className="subtitle">{t('Manage your published community posts and insights.')}</Typography>
						{totalCount > 0 && (
							<span className="stat-chip">
								<i className="dot" />
								{t('totalArticles', { count: totalCount })}
							</span>
						)}
					</motion.div>
					<motion.button
						className="cta-primary"
						variants={item}
						onClick={writeArticleHandler}
						whileHover={shouldReduceMotion ? undefined : { y: -2 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
					>
						<AddRoundedIcon />
						{t('Write New Article')}
					</motion.button>
				</motion.div>

				{boardArticlesLoading && !boardArticles.length ? (
					<Stack className="carlen-my-articles-grid">
						{Array.from({ length: 6 }).map((_, idx) => (
							<div className="skeleton-card" key={idx}>
								<span className="skeleton-img" />
								<div className="skeleton-body">
									<span className="skeleton-line w-40" />
									<span className="skeleton-line w-80" />
									<span className="skeleton-line w-60" />
								</div>
							</div>
						))}
					</Stack>
				) : boardArticles?.length === 0 ? (
					<motion.div className="carlen-my-articles-empty" variants={container} initial="hidden" animate="visible">
						<motion.span className="empty-icon" variants={item}>
							<ArticleOutlinedIcon />
						</motion.span>
						<motion.p className="empty-title" variants={item}>
							{t('No articles published yet')}
						</motion.p>
						<motion.p className="empty-helper" variants={item}>
							{t('Start sharing your thoughts with the Carlen community.')}
						</motion.p>
						<motion.button
							className="cta-primary"
							variants={item}
							onClick={writeArticleHandler}
							whileHover={shouldReduceMotion ? undefined : { y: -2 }}
							whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
						>
							<AddRoundedIcon />
							{t('Write Article')}
						</motion.button>
					</motion.div>
				) : (
					<motion.div
						className="carlen-my-articles-grid"
						variants={container}
						initial="hidden"
						animate="visible"
						key={searchCommunity.page}
					>
						{boardArticles.map((boardArticle: BoardArticle) => (
							<motion.div className="grid-item" variants={item} key={boardArticle?._id}>
								<CommunityCard boardArticle={boardArticle} likeArticleHandler={likeArticleHandler} size={'small'} />
							</motion.div>
						))}
					</motion.div>
				)}

				{boardArticles?.length > 0 && (
					<Stack className="carlen-my-articles-pagination">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(totalCount / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total">
							<Typography>{t('totalArticlesAvailable', { count: totalCount ?? 0 })}</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;
