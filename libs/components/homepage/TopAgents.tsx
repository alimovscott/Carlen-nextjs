import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import Link from 'next/link';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import TopAgentCard from './TopAgentCard';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { GET_AGENTS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';

interface TopAgentsProps {
	initialInput: AgentsInquiry;
}

const TRUST_ITEMS = [
	{ label: 'Verified Dealers', desc: 'Every expert is vetted before listing.', icon: <VerifiedUserOutlinedIcon /> },
	{ label: 'Quality Listings', desc: 'Hand-checked premium vehicles only.', icon: <WorkspacePremiumOutlinedIcon /> },
	{ label: 'Expert Support', desc: 'Real specialists, any time of day.', icon: <SupportAgentOutlinedIcon /> },
	{ label: 'Trusted Network', desc: 'A community built on reputation.', icon: <HubOutlinedIcon /> },
];

const TopAgents = (props: TopAgentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topAgents, setTopAgents] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
	const { loading: getAgentsLoading, data: getAgentsData, error: getAgentsError } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopAgents(data?.getAgents?.list ?? []);
		},
	});

	useEffect(() => {
		if (getAgentsData?.getAgents?.list) {
			setTopAgents(getAgentsData.getAgents.list);
		}
	}, [getAgentsData]);

	/** HANDLERS **/
	if (getAgentsLoading && topAgents.length === 0) {
		return (
			<Stack alignItems="center" py={4}>
				<CircularProgress />
			</Stack>
		);
	}

	if (getAgentsError) {
		return <Alert severity="error">{getAgentsError.message}</Alert>;
	}

	if (topAgents.length === 0) return null;




	if (device === 'mobile') {
		return (
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack component={'header'} className={'agents-responsive-header'}>
						<Stack className={'agents-responsive-copy'}>
							<span className={'eyebrow'}>Top Rated Dealers</span>
							<strong>Meet Carlen Experts</strong>
							<p>Verified specialists ready to help you find the right car.</p>
						</Stack>
						<Link href={'/agent'} className={'agents-responsive-view-all'}>
							View all
						</Link>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-agents-swiper'}
							slidesPerView={1.12}
							spaceBetween={16}
							centeredSlides={false}
							grabCursor={true}
							breakpoints={{ 769: { slidesPerView: 2, spaceBetween: 18 } }}
						>
							{topAgents.slice(0, 6).map((agent: Member) => {
								return (
									<SwiperSlide className={'top-agents-slide'} key={agent?._id}>
										<TopAgentCard agent={agent} key={agent?.memberNick} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-agents carlen-top-agents'}>
				<Stack className={'container'}>
					<Stack className={'carlen-top-agents-header'}>
						<Box component={'div'} className={'carlen-top-agents-head-left'}>
							<span className={'carlen-top-agents-eyebrow'}>Trusted Professionals</span>
							<h2 className={'carlen-top-agents-title'}>Verified Car Experts</h2>
							<p className={'carlen-top-agents-subtitle'}>
								Connect with trusted dealers behind Carlen’s premium listings.
							</p>
						</Box>
						<Link href={'/agent'} className={'carlen-top-agents-cta-all'}>
							<span>View All Agents</span>
							<img src="/img/icons/rightup.svg" alt="" />
						</Link>
					</Stack>
					<div className={'carlen-top-agents-grid'}>
						{topAgents.slice(0, 4).map((agent: Member, index: number) => (
							<TopAgentCard agent={agent} index={index} key={agent?._id} />
						))}
					</div>
					<div className={'carlen-top-agents-trust'}>
						{TRUST_ITEMS.map((item) => (
							<div className={'carlen-top-agents-trust-item'} key={item.label}>
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

TopAgents.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopAgents;
