import React, { useState } from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import { motion } from 'framer-motion';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import CommunityCard from './CommunityCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { T } from '../../types/common';

const TABS: { label: string; value: BoardArticleCategory }[] = [
	{ label: 'News', value: BoardArticleCategory.NEWS },
	{ label: 'Free Board', value: BoardArticleCategory.FREE },
];

const TRUST_ITEMS = [
	{ label: 'Active Community', desc: 'Join thousands of active members.', icon: <Diversity3OutlinedIcon /> },
	{ label: 'Safe & Trusted', desc: 'Verified members and secure environment.', icon: <ShieldOutlinedIcon /> },
	{ label: 'Share & Connect', desc: 'Discuss ideas and connect with others.', icon: <ForumOutlinedIcon /> },
	{ label: 'Free Opportunities', desc: 'Explore free board updates and opportunities.', icon: <RedeemOutlinedIcon /> },
];

const CommunityBoards = () => {
	const device = useDeviceDetect();
	const [searchCommunity, setSearchCommunity] = useState({
		page: 1,
		sort: 'articleViews',
		direction: 'DESC',
	});
	const [newsArticles, setNewsArticles] = useState<BoardArticle[]>([]);
	const [freeArticles, setFreeArticles] = useState<BoardArticle[]>([]);
	const [activeTab, setActiveTab] = useState<BoardArticleCategory>(BoardArticleCategory.NEWS);

	/** APOLLO REQUESTS **/
	const {
				loading: getNewArticlesLoading, 
				data: getNewArticlesData, 
				error: getNewArticlesError,
				refetch: getNewArticlesRefetch
			} = useQuery(GET_BOARD_ARTICLES, {
				fetchPolicy: 'network-only',
				variables: {input: {...searchCommunity,limit:6, search:{articleCategory: BoardArticleCategory.NEWS}}},
				notifyOnNetworkStatusChange: true,
				onCompleted	: (data: T) => {
					setNewsArticles(data?.getBoardArticles?.list);
				}
			});


	const {
				loading: getFreeArticlesLoading, 
				data: getFreeArticlesData, 
				error: getFreeArticlesError,
				refetch: getFreeArticlesRefetch
			} = useQuery(GET_BOARD_ARTICLES, {
				fetchPolicy: 'network-only',
				variables: {input: {...searchCommunity,limit:6, search:{articleCategory: BoardArticleCategory.FREE}}},
				notifyOnNetworkStatusChange: true,
				onCompleted	: (data: T) => {
					setFreeArticles(data?.getBoardArticles?.list);
				}
			});		

	const articles = activeTab === BoardArticleCategory.NEWS ? newsArticles : freeArticles;
	const featured = articles?.[0];
	const feed = articles?.slice(1, 5) ?? [];

	if (device === 'mobile') {
		return <div>COMMUNITY BOARDS (MOBILE)</div>;
	} else {
		return (
			<Stack className={'community-board carlen-community-board'}>
				<Stack className={'container'}>
					<Stack className={'carlen-community-header'}>
						<Box component={'div'} className={'carlen-community-head-left'}>
							<span className={'carlen-community-eyebrow'}>Community</span>
							<h2 className={'carlen-community-title'}>Community Board Highlights</h2>
							<p className={'carlen-community-subtitle'}>
								Stay updated with the latest news, discussions and free board posts from our community.
							</p>
						</Box>
						<Link href={`/community?articleCategory=${activeTab}`} className={'carlen-community-view-all'}>
							<span>View All</span>
							<img src="/img/icons/rightup.svg" alt="" />
						</Link>
					</Stack>

					<div className={'carlen-community-tabs'} role={'tablist'}>
						{TABS.map((t) => (
							<button
								key={t.value}
								className={activeTab === t.value ? 'tab active' : 'tab'}
								onClick={() => setActiveTab(t.value)}
							>
								{activeTab === t.value && (
									<motion.span
										layoutId={'carlen-community-tab'}
										className={'tab-bg'}
										transition={{ type: 'spring', stiffness: 380, damping: 32 }}
									/>
								)}
								<span className={'tab-label'}>{t.label}</span>
							</button>
						))}
					</div>

					<div className={'carlen-community-layout'}>
						<div className={'carlen-community-featured'}>
							{featured && <CommunityCard variant={'featured'} article={featured} index={0} />}
						</div>
						<div className={'carlen-community-feed'}>
							{feed.map((article, i) => (
								<CommunityCard key={article?._id} variant={'feed'} article={article} index={i} />
							))}
						</div>
					</div>

					<div className={'carlen-community-trust'}>
						{TRUST_ITEMS.map((item) => (
							<div className={'carlen-community-trust-item'} key={item.label}>
								<span className={'icon'}>{item.icon}</span>
								<div className={'text'}>
									<strong>{item.label}</strong>
									<p>{item.desc}</p>
								</div>
							</div>
						))}
					</div>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityBoards;
