import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Typography, Pagination } from '@mui/material';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import CommunityCard from '../../libs/components/common/CommunityCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CATEGORY_TABS: { value: BoardArticleCategory; label: string; icon: React.ReactNode }[] = [
	{ value: BoardArticleCategory.FREE, label: 'Free Discussion', icon: <ForumOutlinedIcon /> },
	{ value: BoardArticleCategory.RECOMMEND, label: 'Recommendations', icon: <StarOutlineRoundedIcon /> },
	{ value: BoardArticleCategory.NEWS, label: 'Automotive News', icon: <ArticleOutlinedIcon /> },
	{ value: BoardArticleCategory.HUMOR, label: 'Humor & Fun', icon: <SentimentSatisfiedAltOutlinedIcon /> },
];

const CATEGORY_META: Record<string, { title: string; subtitle: string }> = {
	FREE: { title: 'Free Discussion', subtitle: 'Open conversations from the Carlen community.' },
	RECOMMEND: { title: 'Recommendations', subtitle: 'Trusted picks and tips shared by fellow enthusiasts.' },
	NEWS: { title: 'Automotive News', subtitle: 'The latest stories moving the car world.' },
	HUMOR: { title: 'Humor & Fun', subtitle: 'Lighthearted moments from the Carlen garage.' },
};

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const { t } = useTranslation('common');
	const { query } = router;
	const articleCategory = query?.articleCategory as string;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>(initialInput);
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	if (articleCategory) initialInput.search.articleCategory = articleCategory;

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE)
		const {
			loading: boardArticlesLoading,
			data: getBoardArticlesData,
			error: getBoardArticlesError,
			refetch: getBoardArticlesRefetch,
		} = useQuery(GET_BOARD_ARTICLES, {
			fetchPolicy: 'cache-and-network',
			variables: {input: searchCommunity},
			notifyOnNetworkStatusChange: true,
			onCompleted: (data : T) => {
				setBoardArticles(data?.getBoardArticles?.list);
				setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total);
			},
		}
	)



	/** LIFECYCLES **/
	useEffect(() => {
		if (!query?.articleCategory)
			router.push(
				{
					pathname: router.pathname,
					query: { articleCategory: 'FREE' },
				},
				router.pathname,
				{ shallow: true },
			);
	}, []);

	/** HANDLERS **/
	const tabChangeHandler = async (e: T, value: string) => {
		console.log(value);

		setSearchCommunity({ ...searchCommunity, page: 1, search: { articleCategory: value as BoardArticleCategory } });
		await router.push(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			router.pathname,
			{ shallow: true },
		);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const writeArticleHandler = () => {
		router.push({
			pathname: '/mypage',
			query: {
				category: 'writeArticle',
			},
		});
	};

	const likeArticleHandler = async (e: any ,user: T, id: string) => {
			try {
				e.stopPropagation();
				if (!id) return;
				if (!user._id) throw new Error(Messages.error2);

				await likeTargetBoardArticle({ variables: { input: id } });

				await getBoardArticlesRefetch({
					input: searchCommunity,
				});

				await sweetTopSmallSuccessAlert('success', 800);
			} catch (err: any) {
				console.log('ERROR, likePropertyHandler:', err.message);
				sweetMixinErrorAlert(err.message).then();
			}
		};

	/** FRAMER VARIANTS **/
	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08, delayChildren: 0.05 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
	};

	const activeCategory = (searchCommunity.search.articleCategory as string) || 'FREE';
	const meta = CATEGORY_META[activeCategory] ?? CATEGORY_META.FREE;

	if (device === 'mobile') {
		return <h1>COMMUNITY PAGE MOBILE</h1>;
	} else {
		return (
			<div id="carlen-community-page">
				<div className="container">
					<motion.section
						className="carlen-community-header"
						variants={container}
						initial="hidden"
						animate="visible"
					>
						<motion.div className="header-text" variants={item}>
							<span className="header-eyebrow">{t('Carlen Community')}</span>
							<h1 className="header-title">{t('Join the Automotive Conversation')}</h1>
							<p className="header-subtitle">
								{t('Share experiences, recommendations, reviews, and automotive news with enthusiasts.')}
							</p>
						</motion.div>
						<motion.div className="header-aside" variants={item}>
							<motion.button
								type="button"
								className="cta-primary"
								onClick={writeArticleHandler}
								whileHover={shouldReduceMotion ? undefined : { y: -2 }}
								whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
							>
								<EditOutlinedIcon />
								{t('Write Article')}
							</motion.button>
							<div className="header-stats">
								{['5K+ Members', 'Daily Discussions', 'Verified Community'].map((stat) => (
									<span className="stat-chip" key={stat}>
										<i className="dot" />
										{t(stat)}
									</span>
								))}
							</div>
						</motion.div>
					</motion.section>

					<Stack className="carlen-community-layout">
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
										className={`nav-item ${activeCategory === tab.value ? 'active' : ''}`}
										onClick={(e: T) => tabChangeHandler(e, tab.value)}
									>
										<span className="nav-icon">{tab.icon}</span>
										<span className="nav-label">{t(tab.label)}</span>
									</motion.button>
								))}
							</nav>
						</motion.aside>

						<Stack className="carlen-community-content">
							<Stack className="carlen-community-panel">
								<Stack className="content-header">
									<Typography className="content-title">{t(meta.title)}</Typography>
									<Typography className="content-subtitle">{t(meta.subtitle)}</Typography>
								</Stack>

								{boardArticlesLoading && !boardArticles?.length ? (
									<Stack className="carlen-community-grid">
										{Array.from({ length: 6 }).map((_, idx) => (
											<div className="skeleton-card" key={idx}>
												<div className="skeleton-img" />
												<div className="skeleton-line w-60" />
												<div className="skeleton-line w-90" />
											</div>
										))}
									</Stack>
								) : totalCount ? (
									<motion.div
										className="carlen-community-grid"
										variants={container}
										initial="hidden"
										animate="visible"
										key={activeCategory + searchCommunity.page}
									>
										{boardArticles?.map((boardArticle: BoardArticle) => (
											<motion.div variants={item} key={boardArticle?._id}>
												<CommunityCard boardArticle={boardArticle} likeArticleHandler={likeArticleHandler} />
											</motion.div>
										))}
									</motion.div>
								) : (
									<Stack className="carlen-community-empty">
										<span className="empty-icon">
											<ForumRoundedIcon />
										</span>
										<Typography className="empty-title">{t('No discussions yet')}</Typography>
										<Typography className="empty-subtitle">{t('Be the first to start the conversation.')}</Typography>
										<motion.button
											type="button"
											className="cta-primary"
											onClick={writeArticleHandler}
											whileHover={shouldReduceMotion ? undefined : { y: -2 }}
											whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
										>
											<EditOutlinedIcon />
											{t('Write Article')}
										</motion.button>
									</Stack>
								)}
							</Stack>
						</Stack>
					</Stack>

					{totalCount > 0 && (
						<Stack className="carlen-community-pagination">
							<Stack className="pagination-box">
								<Pagination
									count={Math.ceil(totalCount / searchCommunity.limit)}
									page={searchCommunity.page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</Stack>
							<Stack className="total-result">
								<Typography>{t('totalDiscussionsAvailable', { count: totalCount })}</Typography>
							</Stack>
						</Stack>
					)}
				</div>
			</div>
		);
	}
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			articleCategory: 'FREE',
		},
	},
};

export default withLayoutBasic(Community);
