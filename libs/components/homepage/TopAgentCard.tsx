import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';
import { motion, useReducedMotion } from 'framer-motion';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { formatterStr } from '../../utils';

interface TopAgentProps {
	agent: Member;
	index?: number;
}
const TopAgentCard = (props: TopAgentProps) => {
	const { agent, index = 0 } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const agentImage = agent?.memberImage
		? `${process.env.REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/
	const pushAgentHandler = async () => {
		await router.push({ pathname: '/agent/detail', query: { agentId: agent?._id } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="top-agent-card">
				<img src={agentImage} alt="" />

				<strong>{agent?.memberNick}</strong>
				<span>{agent?.memberType}</span>
			</Stack>
		);
	} else {
		return (
			<motion.article
				className={'carlen-top-agent-card'}
				onClick={pushAgentHandler}
				initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
				whileInView={
					shouldReduceMotion
						? undefined
						: {
								opacity: 1,
								y: 0,
								transition: { type: 'spring', stiffness: 300, damping: 28, delay: (index % 4) * 0.08 },
						  }
				}
				viewport={{ once: true, margin: '-80px' }}
				whileHover={shouldReduceMotion ? undefined : 'hover'}
				variants={{ hover: { y: -8, transition: { type: 'spring', stiffness: 300, damping: 26 } } }}
			>
				<div className={'carlen-top-agent-top'}>
					<span className={'carlen-top-agent-badge'}>
						<VerifiedOutlinedIcon />
						Verified Dealer
					</span>
					<button
						className={'carlen-top-agent-contact'}
						aria-label={'Contact'}
						onClick={(e) => {
							e.stopPropagation();
							pushAgentHandler();
						}}
					>
						<ChatBubbleOutlineRoundedIcon />
					</button>
				</div>
				<div className={'carlen-top-agent-avatar'}>
					<motion.div
						className={'avatar-img'}
						style={{ backgroundImage: `url(${agentImage})` }}
						variants={{ hover: { scale: 1.03 } }}
						transition={{ type: 'spring', stiffness: 220, damping: 30 }}
					/>
					<span className={'status-dot'} />
				</div>
				<strong className={'carlen-top-agent-name'}>{agent?.memberFullName ?? agent?.memberNick}</strong>
				<span className={'carlen-top-agent-location'}>{agent?.memberAddress ?? 'Seoul, KR'}</span>
				<div className={'carlen-top-agent-stats'}>
					<div className={'stat'}>
						<strong>{formatterStr(agent?.memberProducts) || 0}</strong>
						<span>Listings</span>
					</div>
					<div className={'stat'}>
						<strong>{formatterStr(agent?.memberLikes) || 0}</strong>
						<span>Likes</span>
					</div>
					<div className={'stat'}>
						<strong>{formatterStr(agent?.memberViews) || 0}</strong>
						<span>Views</span>
					</div>
				</div>
				<button
					className={'carlen-top-agent-cta'}
					onClick={(e) => {
						e.stopPropagation();
						pushAgentHandler();
					}}
				>
					View Profile
				</button>
			</motion.article>
		);
	}
};

export default TopAgentCard;
