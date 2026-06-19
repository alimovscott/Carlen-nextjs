import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Following } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface MemberFollowingsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowings = (props: MemberFollowingsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, redirectToMemberPageHandler, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const [total, setTotal] = useState<number>(0);
	const category: any = router.query?.category ?? 'products';
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowings, setMemberFollowings] = useState<Following[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const {
			loading: getMemberFollowingsLoading,
			data: getMemberFollowingsData,
			error: getMemberFollowingsError,
			refetch: getMemberFollowingsRefetch,
		} = useQuery(GET_MEMBER_FOLLOWINGS, {
			fetchPolicy: 'network-only',
			variables: { input: followInquiry },
			skip: !followInquiry?.search?.followerId,
			notifyOnNetworkStatusChange: true,
			onCompleted: (data: T) => {
				setMemberFollowings(data?.getMemberFollowings?.list);
				setTotal(data?.getMemberFollowings?.metaCounter[0]?.total || 0);
			},
		});


	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followerId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followerId: user?._id } });
	}, [router]);

	useEffect(() => {getMemberFollowingsRefetch({ input: followInquiry }).then();}, [followInquiry]);

	/** HANDLERS **/
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
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
		return <div>MEMBER FOLLOWINGS MOBILE</div>;
	} else {
		return (
			<div id="carlen-member-network-page">
				<motion.div className="carlen-section-header" variants={container} initial="hidden" animate="visible">
					<motion.span className="eyebrow" variants={item}>
						Carlen Network
					</motion.span>
					<motion.h1 className="title" variants={item}>
						{category === 'followers' ? 'Followers' : 'Followings'}
					</motion.h1>
					<motion.p className="subtitle" variants={item}>
						Manage your Carlen network and connect with automotive members.
					</motion.p>
					{total > 0 && (
						<motion.span className="stat-chip" variants={item}>
							<i className="dot" />
							Total {total} member{total > 1 ? 's' : ''}
						</motion.span>
					)}
				</motion.div>

				{memberFollowings?.length === 0 ? (
					<motion.div
						className="carlen-network-empty"
						initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
						animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					>
						<span className="empty-icon">
							<GroupOutlinedIcon />
						</span>
						<Typography className="empty-title">No members found</Typography>
						<Typography className="empty-helper">
							Your network will appear here as you connect with other members.
						</Typography>
					</motion.div>
				) : (
					<motion.div
						className="carlen-network-list"
						variants={container}
						initial="hidden"
						animate="visible"
						key={followInquiry.page}
					>
						{memberFollowings.map((follower: Following) => {
							const imagePath: string = follower?.followingData?.memberImage
								? `${REACT_APP_API_URL}/${follower?.followingData?.memberImage}`
								: '/img/profile/defaultUser.svg';
							return (
								<motion.div className="carlen-network-card" key={follower._id} variants={item}>
									<Stack className={'info'} onClick={() => redirectToMemberPageHandler(follower?.followingData?._id)}>
										<Stack className="image-box">
											<img src={imagePath} alt="" />
										</Stack>
										<Stack className="information-box">
											<Typography className="name">{follower?.followingData?.memberNick}</Typography>
										</Stack>
									</Stack>
									<Stack className={'carlen-network-stats'}>
										<Box className={'info-box'} component={'div'}>
											<p>Followers</p>
											<span>({follower?.followingData?.memberFollowers})</span>
										</Box>
										<Box className={'info-box'} component={'div'}>
											<p>Followings</p>
											<span>({follower?.followingData?.memberFollowings})</span>
										</Box>
										<Box className={'info-box'} component={'div'}>
											{follower?.meLiked && follower?.meLiked[0]?.myFavorite ? (
												<FavoriteIcon
													color="primary"
													onClick={() => likeMemberHandler(follower?.followingData?._id, getMemberFollowingsRefetch, followInquiry)}
												/>
											) : (
												<FavoriteBorderIcon
													onClick={() => likeMemberHandler(follower?.followingData?._id, getMemberFollowingsRefetch, followInquiry)}
												/>
											)}
											<span>({follower?.followingData?.memberLikes})</span>
										</Box>
									</Stack>
									{user?._id !== follower?.followingId && (
										<Stack className="carlen-network-actions">
											{follower.meFollowed && follower.meFollowed[0]?.myFollowing ? (
												<>
													<Typography className="following-label">Following</Typography>
													<motion.button
														type="button"
														className="btn-unfollow"
														onClick={() => unsubscribeHandler(follower?.followingData?._id, getMemberFollowingsRefetch, followInquiry)}
														whileHover={shouldReduceMotion ? undefined : { y: -2 }}
														whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
													>
														Unfollow
													</motion.button>
												</>
											) : (
												<motion.button
													type="button"
													className="btn-follow"
													onClick={() => subscribeHandler(follower?.followingData?._id, getMemberFollowingsRefetch, followInquiry)}
													whileHover={shouldReduceMotion ? undefined : { y: -2 }}
													whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
												>
													Follow
												</motion.button>
											)}
										</Stack>
									)}
								</motion.div>
							);
						})}
					</motion.div>
				)}

				{memberFollowings.length !== 0 && (
					<motion.div
						className="carlen-network-pagination"
						initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
						animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
						transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
					>
						<Stack className="pagination-box">
							<Pagination
								page={followInquiry.page}
								count={Math.ceil(total / followInquiry.limit)}
								onChange={paginationHandler}
								shape="circular"
								color="primary"
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								Total {total} member{total > 1 ? 's' : ''}
							</Typography>
						</Stack>
					</motion.div>
				)}
			</div>
		);
	}
};

MemberFollowings.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followerId: '',
		},
	},
};

export default MemberFollowings;
