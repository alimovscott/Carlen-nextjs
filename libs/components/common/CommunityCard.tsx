import React from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { motion, useReducedMotion } from 'framer-motion';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTranslation } from 'next-i18next';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	likeArticleHandler?: any;
}

const stripHtml = (html?: string): string =>
	(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const CommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, size = 'normal', likeArticleHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const shouldReduceMotion = useReducedMotion();
	const imagePath: string = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: '/img/community/communityImg.png';
	const liked = !!(boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite);
	const preview = stripHtml(boardArticle?.articleContent);

	/** HANDLERS **/
	const chooseArticleHandler = (e: React.SyntheticEvent, boardArticle: BoardArticle) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	if (device === 'mobile') {
		return <div>COMMUNITY CARD MOBILE</div>;
	} else {
		return (
			<Stack
				className={`community-general-card-config carlen-community-card ${size === 'small' ? 'small' : 'normal'}`}
				onClick={(e: React.MouseEvent) => chooseArticleHandler(e, boardArticle)}
			>
				<Stack className="image-box">
					<img src={imagePath} alt="" className="card-img" />
					<span className="img-overlay" aria-hidden="true" />
					<span className="category-chip">{boardArticle?.articleCategory}</span>
					<Stack className="date-box">
						<Moment className="month" format={'MMM'}>
							{boardArticle?.createdAt}
						</Moment>
						<Typography className="day">
							<Moment format={'DD'}>{boardArticle?.createdAt}</Moment>
						</Typography>
					</Stack>
				</Stack>

				<Stack className="desc-box">
					<Typography
						className="desc"
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation();
							goMemberPage(boardArticle?.memberData?._id as string);
						}}
					>
						{boardArticle?.memberData?.memberNick}
					</Typography>
					<Typography className="title">{boardArticle?.articleTitle}</Typography>
					{preview && <Typography className="preview">{preview}</Typography>}

					<Stack className={'buttons'}>
						<IconButton className="stat-btn" color={'default'} aria-label={t('Views')} disableRipple>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{boardArticle?.articleViews}</Typography>
						<IconButton
							component={motion.button}
							whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
							className="stat-btn like-btn"
							color={'default'}
							aria-label={liked ? t('Unlike article') : t('Like article')}
							onClick={(e: any) => {
								e.stopPropagation();
								if (likeArticleHandler) likeArticleHandler(e, user, boardArticle?._id);
							}}
						>
							{liked ? <FavoriteIcon color={'primary'} /> : <FavoriteBorderIcon />}
						</IconButton>
						<Typography className="view-cnt">{boardArticle?.articleLikes}</Typography>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityCard;
