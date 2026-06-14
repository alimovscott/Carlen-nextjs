import React from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Moment from 'react-moment';
import { motion, useReducedMotion } from 'framer-motion';
import EastIcon from '@mui/icons-material/East';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticleCategory } from '../../enums/board-article.enum';

interface CommunityCardProps {
	variant: 'featured' | 'feed';
	article: BoardArticle;
	index: number;
}

const CATEGORY_LABEL: Record<string, string> = {
	[BoardArticleCategory.NEWS]: 'News',
	[BoardArticleCategory.FREE]: 'Free Board',
	[BoardArticleCategory.RECOMMEND]: 'Recommend',
	[BoardArticleCategory.HUMOR]: 'Humor',
};

const CommunityCard = (props: CommunityCardProps) => {
	const { variant, article, index } = props;
	const device = useDeviceDetect();
	const shouldReduceMotion = useReducedMotion();
	const articleImage = article?.articleImage
		? `${process.env.REACT_APP_API_URL}/${article?.articleImage}`
		: '/img/event.svg';
	const author = article?.memberData?.memberNick ?? 'Carlen Member';
	const preview = (article?.articleContent ?? '').replace(/<[^>]+>/g, '').slice(0, 120);
	const categoryLabel = CATEGORY_LABEL[article?.articleCategory] ?? 'Community';
	const detailHref = `/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`;

	const motionProps = {
		initial: shouldReduceMotion ? false : { opacity: 0, y: 20 },
		whileInView: shouldReduceMotion
			? undefined
			: {
					opacity: 1,
					y: 0,
					transition: { type: 'spring' as const, stiffness: 300, damping: 28, delay: (index % 5) * 0.08 },
			  },
		viewport: { once: true, margin: '-80px' },
		whileHover: shouldReduceMotion ? undefined : ('hover' as const),
	};

	if (device === 'mobile') {
		return <div>COMMUNITY CARD (MOBILE)</div>;
	}

	if (variant === 'featured') {
		return (
			<Link href={detailHref}>
				<motion.article
					className={'carlen-community-card featured'}
					{...motionProps}
					variants={{ hover: { y: -6, transition: { type: 'spring', stiffness: 300, damping: 26 } } }}
				>
					<div className={'carlen-community-featured-img'}>
						<motion.div
							className={'img-bg'}
							style={{ backgroundImage: `url(${articleImage})` }}
							variants={{ hover: { scale: 1.03 } }}
							transition={{ type: 'spring', stiffness: 220, damping: 30 }}
						/>
						<span className={'carlen-community-badge'}>{categoryLabel}</span>
					</div>
					<div className={'carlen-community-featured-body'}>
						<strong className={'title'}>{article?.articleTitle}</strong>
						<p className={'preview'}>{preview}</p>
						<div className={'carlen-community-meta'}>
							<div className={'author'}>
								<span className={'avatar'} />
								<span className={'name'}>{author}</span>
								<span className={'dot'} />
								<span className={'date'}>
									<Moment format="DD MMM YYYY">{article?.createdAt}</Moment>
								</span>
							</div>
							<div className={'carlen-community-stats'}>
								<span className={'stat'}>
									<FavoriteBorderRoundedIcon />
									{article?.articleLikes}
								</span>
								<span className={'stat'}>
									<ChatBubbleOutlineRoundedIcon />
									{article?.articleComments}
								</span>
							</div>
						</div>
					</div>
				</motion.article>
			</Link>
		);
	}

	return (
		<Link href={detailHref}>
			<motion.article
				className={'carlen-community-card feed'}
				{...motionProps}
				variants={{ hover: { y: -3, transition: { type: 'spring', stiffness: 300, damping: 26 } } }}
			>
				<div className={'carlen-community-feed-thumb'} style={{ backgroundImage: `url(${articleImage})` }} />
				<div className={'carlen-community-feed-body'}>
					<span className={'carlen-community-chip'}>{categoryLabel}</span>
					<strong className={'title'}>{article?.articleTitle}</strong>
					<p className={'preview'}>{preview}</p>
					<div className={'carlen-community-feed-meta'}>
						<span className={'name'}>{author}</span>
						<span className={'dot'} />
						<span className={'date'}>
							<Moment format="DD.MM.YY">{article?.createdAt}</Moment>
						</span>
						<span className={'stat'}>
							<ChatBubbleOutlineRoundedIcon />
							{article?.articleComments}
						</span>
						<span className={'stat'}>
							<FavoriteBorderRoundedIcon />
							{article?.articleLikes}
						</span>
					</div>
				</div>
				<motion.span className={'arrow'} variants={{ hover: { x: 3 } }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
					<EastIcon />
				</motion.span>
			</motion.article>
		</Link>
	);
};

export default CommunityCard;
