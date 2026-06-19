import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Follower } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	likeMemberHandler: any;
	unsubscribeHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, likeMemberHandler, redirectToMemberPageHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const [total, setTotal] = useState<number>(0);
	const category: any = router.query?.category ?? 'products';
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/

		const {
		loading: getMemberFollowersLoading,
		data: getMemberFollowersData,
		error: getMemberFollowersError,
		refetch: getMemberFollowersRefetch,
	} = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followingId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowers(data?.getMemberFollowers?.list);
			setTotal(data?.getMemberFollowers?.metaCounter[0]?.total || 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followingId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followingId: user?._id } });
	}, [router]);

	useEffect(() => {
		getMemberFollowersRefetch({ input: followInquiry }).then();
	}, [followInquiry]);

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
		return <div>MEMBER FOLLOWERS MOBILE</div>;
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

				{memberFollowers?.length === 0 ? (
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
						{memberFollowers.map((follower: Follower) => {
							const imagePath: string = follower?.followerData?.memberImage
								? `${REACT_APP_API_URL}/${follower?.followerData?.memberImage}`
								: '/img/profile/defaultUser.svg';
							return (
								<motion.div className="carlen-network-card" key={follower._id} variants={item}>
									<Stack className={'info'} onClick={() => redirectToMemberPageHandler(follower?.followerData?._id)}>
										<Stack className="image-box">
											<img src={imagePath} alt="" />
										</Stack>
										<Stack className="information-box">
											<Typography className="name">{follower?.followerData?.memberNick}</Typography>
										</Stack>
									</Stack>
									<Stack className={'carlen-network-stats'}>
										<Box className={'info-box'} component={'div'}>
											<p>Followers</p>
											<span>({follower?.followerData?.memberFollowers})</span>
										</Box>
										<Box className={'info-box'} component={'div'}>
											<p>Followings</p>
											<span>({follower?.followerData?.memberFollowings})</span>
										</Box>
										<Box className={'info-box'} component={'div'}>
											{follower?.meLiked && follower?.meLiked[0]?.myFavorite ? (
												<FavoriteIcon
													color="primary"
													onClick={() => likeMemberHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
												/>
											) : (
												<FavoriteBorderIcon
													onClick={() => likeMemberHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
												/>
											)}
											<span>({follower?.followerData?.memberLikes})</span>
										</Box>
									</Stack>
									{user?._id !== follower?.followerId && (
										<Stack className="carlen-network-actions">
											{follower.meFollowed && follower.meFollowed[0]?.myFollowing ? (
												<>
													<Typography className="following-label">Following</Typography>
													<motion.button
														type="button"
														className="btn-unfollow"
														onClick={() => unsubscribeHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
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
													onClick={() => subscribeHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
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

				{memberFollowers.length !== 0 && (
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

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followingId: '',
		},
	},
};

export default MemberFollowers;
