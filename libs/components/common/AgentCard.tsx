import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';

interface AgentCardProps {
	agent: any;
	likeMemberHandler?: any;
	variant?: 'dealer';
}

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler, variant } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return <div>AGENT CARD</div>;
	} else if (variant === 'dealer') {
		return (
			<Stack className={'carlen-agent-card'}>
				<span className={'carlen-agent-card-badge'}>
					<VerifiedOutlinedIcon /> Verified Dealer
				</span>
				<Link href={{ pathname: '/agent/detail', query: { agentId: agent?._id } }}>
					<div className={'carlen-agent-card-avatar'} style={{ backgroundImage: `url(${imagePath})` }} />
				</Link>
				<strong className={'carlen-agent-card-name'}>{agent?.memberFullName ?? agent?.memberNick}</strong>
				<span className={'carlen-agent-card-location'}>{agent?.memberAddress ?? 'Korea'}</span>
				<div className={'carlen-agent-card-stats'}>
					<div>
						<strong>{agent?.memberProducts ?? 0}</strong>
						<span>Listings</span>
					</div>
					<div>
						<strong>{agent?.memberLikes ?? 0}</strong>
						<span>Likes</span>
					</div>
					<div>
						<strong>{agent?.memberViews ?? 0}</strong>
						<span>Views</span>
					</div>
				</div>
				<div className={'carlen-agent-card-actions'}>
					<IconButton
						className={'like'}
						color={'default'}
						aria-label={'Like'}
						onClick={() => likeMemberHandler && likeMemberHandler(user, agent._id)}
					>
						{agent?.meLiked && agent?.meLiked[0]?.myFavorite ? (
							<FavoriteIcon color={'primary'} />
						) : (
							<FavoriteBorderIcon />
						)}
					</IconButton>
					<Link
						href={{ pathname: '/agent/detail', query: { agentId: agent?._id } }}
						className={'view-profile'}
					>
						View Profile
					</Link>
				</div>
			</Stack>
		);
	} else {
		return (
			<Stack className="agent-general-card">
				<Link
					href={{
						pathname: '/agent/detail',
						query: { agentId: agent?._id },
					}}
				>
					<Box
						component={'div'}
						className={'agent-img'}
						style={{
							backgroundImage: `url(${imagePath})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
						}}
					>
						<div>{agent?.memberProducts} products</div>
					</Box>
				</Link>

				<Stack className={'agent-desc'}>
					<Box component={'div'} className={'agent-info'}>
						<Link
							href={{
								pathname: '/agent/detail',
								query: { agentId: 'id' },
							}}
						>
							<strong>{agent?.memberFullName ?? agent?.memberNick}</strong>
						</Link>
						<span>Agent</span>
					</Box>
					<Box component={'div'} className={'buttons'}>
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{agent?.memberViews}</Typography>
						<IconButton color={'default'} onClick={() => likeMemberHandler(user, agent._id)}>
							{agent?.meLiked && agent?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color={'primary'} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{agent?.memberLikes}</Typography>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default AgentCard;
