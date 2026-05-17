import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopAgentCard from './TopAgentCard';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { GET_AGENTS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';

interface TopAgentsProps {
	initialInput: AgentsInquiry;
}

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
					<Stack className={'info-box'}>
						<span>Top Agents</span>
					</Stack>
					<Stack className={'wrapper'}>
						<Swiper
							className={'top-agents-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={29}
							modules={[Autoplay]}
						>
							{topAgents.map((agent: Member) => {
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
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top Agents</span>
							<p>Our Top Agents always ready to serve you</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<span>See All Agents</span>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'switch-btn swiper-agents-prev'}>
							<ArrowBackIosNewIcon />
						</Box>
						<Box component={'div'} className={'card-wrapper'}>
							<Swiper
								className={'top-agents-swiper'}
								slidesPerView={'auto'}
								spaceBetween={29}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-agents-next',
									prevEl: '.swiper-agents-prev',
								}}
							>
								{topAgents.map((agent: Member) => {
									return (
										<SwiperSlide className={'top-agents-slide'} key={agent?._id}>
											<TopAgentCard agent={agent} key={agent?.memberNick} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						</Box>
						<Box component={'div'} className={'switch-btn swiper-agents-next'}>
							<ArrowBackIosNewIcon />
						</Box>
					</Stack>
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
