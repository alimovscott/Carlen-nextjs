import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Typography } from '@mui/material';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { GET_MEMBER } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';

interface MemberMenuProps {
	subscribeHandler: any;
	unsubscribeHandler: any;
}

const MemberMenu = (props: MemberMenuProps) => {
	const { subscribeHandler, unsubscribeHandler } = props;
	const device = useDeviceDetect();
	const shouldReduceMotion = useReducedMotion();
	const router = useRouter();
	const category: any = router.query?.category;
	const [member, setMember] = useState<Member | null>(null);
	const { memberId } = router.query;

	/** APOLLO REQUESTS **/
	const {
		loading: getMemberLoading,
		data: getMemberData,
		error: getMemberError,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMember(data?.getMember);
		},
	});

	/** ANIMATION **/
	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06, delayChildren: 0.04 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
	};

	/** NAV CONFIG **/
	const navSections = [
		{
			heading: 'Details',
			items: [
				...(member?.memberType === 'AGENT'
					? [
							{
								category: 'products',
								label: 'Products',
								count: member?.memberProducts,
								Icon: DirectionsCarFilledOutlinedIcon,
							},
					  ]
					: []),
				{ category: 'followers', label: 'Followers', count: member?.memberFollowers, Icon: PeopleAltOutlinedIcon },
				{ category: 'followings', label: 'Followings', count: member?.memberFollowings, Icon: HowToRegOutlinedIcon },
			],
		},
		{
			heading: 'Community',
			items: [{ category: 'articles', label: 'Articles', count: member?.memberArticles, Icon: ArticleOutlinedIcon }],
		},
	];

	const isFollowing = !!(member?.meFollowed && member?.meFollowed[0]?.myFollowing);

	if (device === 'mobile') {
		return <div>MEMBER MENU MOBILE</div>;
	} else {
		return (
			<motion.div className="carlen-member-menu" variants={container} initial="hidden" animate="visible">
				{getMemberLoading && !member ? (
					<div className="menu-skeleton">
						<span className="sk-avatar" />
						<span className="sk-line w-60" />
						<span className="sk-line w-40" />
						<span className="sk-cta" />
						<div className="sk-rows">
							{Array.from({ length: 4 }).map((_, idx) => (
								<span className="sk-row" key={idx} />
							))}
						</div>
					</div>
				) : (
					<>
						<motion.div className="profile" variants={item}>
							<div className="avatar-ring">
								<img
									className="avatar-img"
									src={
										member?.memberImage
											? `${REACT_APP_API_URL}/${member?.memberImage}`
											: '/img/profile/defaultUser.svg'
									}
									alt="member-photo"
								/>
							</div>
							<Typography className="user-name">{member?.memberNick}</Typography>
							<span className="member-type-badge">
								{member?.memberType === 'AGENT' && <VerifiedOutlinedIcon />}
								{member?.memberType}
							</span>
							{member?.memberPhone && (
								<span className="phone-row">
									<PhoneOutlinedIcon />
									<Typography className="p-number">{member?.memberPhone}</Typography>
								</span>
							)}
						</motion.div>

						<motion.div className="follow-cta-box" variants={item}>
							{isFollowing ? (
								<>
									<span className="following-chip">Following</span>
									<motion.button
										className="cta-unfollow"
										whileHover={shouldReduceMotion ? undefined : { y: -2 }}
										whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
										onClick={() => unsubscribeHandler(member?._id, getMemberRefetch, memberId)}
									>
										Unfollow
									</motion.button>
								</>
							) : (
								<motion.button
									className="cta-follow"
									whileHover={shouldReduceMotion ? undefined : { y: -2 }}
									whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
									onClick={() => subscribeHandler(member?._id, getMemberRefetch, memberId)}
								>
									Follow
								</motion.button>
							)}
						</motion.div>

						<div className="menu-nav">
							{navSections.map((sec) => (
								<motion.div className="nav-section" variants={item} key={sec.heading}>
									<Typography className="section-title">{sec.heading}</Typography>
									{sec.items.map(({ category: cat, label, count, Icon }) => (
										<Link
											key={cat}
											href={{ pathname: '/member', query: { ...router.query, category: cat } }}
											scroll={false}
											style={{ width: '100%' }}
										>
											<motion.div
												className={category === cat ? 'nav-item active' : 'nav-item'}
												whileHover={shouldReduceMotion ? undefined : { x: 2 }}
											>
												<span className="nav-icon">
													<Icon />
												</span>
												<Typography className="nav-label">{label}</Typography>
												<span className="nav-count">{count}</span>
											</motion.div>
										</Link>
									))}
								</motion.div>
							))}
						</div>
					</>
				)}
			</motion.div>
		);
	}
};

export default MemberMenu;
