import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import CommunityCard from '../common/CommunityCard';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Messages } from '../../config';

const MemberArticles: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const shouldReduceMotion = useReducedMotion();
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(initialInput);
	const [memberArticles, setMemberArticles] = useState<BoardArticle[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: getBoardArticlesLoading,
		data: getBoardArticlesData,
		error: getBoardArticlesError,
		refetch: getBoardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setMemberArticles(data?.getBoardArticles?.list);
			setTotal(data?.getBoardArticles?.metaCounter[0]?.total || 0);
		},
	});
	/** LIFECYCLES **/
	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { memberId: memberId } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({ variables: { input: id } });

			await getBoardArticlesRefetch({ input: searchFilter });

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

	if (device === 'mobile') {
		return <div>MEMBER ARTICLES MOBILE</div>;
	} else {
		return (
			<div id="carlen-member-articles-page">
				<motion.div className="carlen-section-header" variants={container} initial="hidden" animate="visible">
					<motion.span className="eyebrow" variants={item}>
						MEMBER STORIES
					</motion.span>
					<motion.h1 className="title" variants={item}>
						Published Articles
					</motion.h1>
					<motion.p className="subtitle" variants={item}>
						Explore community posts and insights shared by this member.
					</motion.p>
					{total > 0 && (
						<motion.span className="stat-chip" variants={item}>
							<i className="dot" />
							Total {total} article{total !== 1 ? 's' : ''}
						</motion.span>
					)}
				</motion.div>

				{getBoardArticlesLoading && !memberArticles.length ? (
					<Stack className="carlen-member-articles-grid">
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
				) : memberArticles?.length === 0 ? (
					<motion.div
						className="carlen-member-articles-empty"
						variants={container}
						initial="hidden"
						animate="visible"
					>
						<motion.span className="empty-icon" variants={item}>
							<ArticleOutlinedIcon />
						</motion.span>
						<motion.p className="empty-title" variants={item}>
							No articles yet
						</motion.p>
						<motion.p className="empty-helper" variants={item}>
							This member has not published any community posts yet.
						</motion.p>
					</motion.div>
				) : (
					<motion.div
						className="carlen-member-articles-grid"
						variants={container}
						initial="hidden"
						animate="visible"
						key={searchFilter.page}
					>
						{memberArticles.map((boardArticle: BoardArticle) => (
							<motion.div className="grid-item" variants={item} key={boardArticle?._id}>
								<CommunityCard boardArticle={boardArticle} likeArticleHandler={likeArticleHandler} size={'small'} />
							</motion.div>
						))}
					</motion.div>
				)}

				{memberArticles?.length !== 0 && (
					<Stack className="carlen-member-articles-pagination">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFilter.limit) || 1}
								page={searchFilter.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								Total {total} article{total !== 1 ? 's' : ''} available
							</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	}
};

MemberArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MemberArticles;
