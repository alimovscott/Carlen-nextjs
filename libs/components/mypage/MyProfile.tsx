import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Typography } from '@mui/material';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import axios from 'axios';
import { Messages, REACT_APP_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation } from '@apollo/client';

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const shouldReduceMotion = useReducedMotion();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);
	const [imageLoading, setImageLoading] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		setUpdateData({
			...updateData,
			memberNick: user.memberNick,
			memberPhone: user.memberPhone,
			memberAddress: user.memberAddress,
			memberImage: user.memberImage,
		});
	}, [user]);

	/** HANDLERS **/
	const uploadImage = async (e: any) => {
		try {
			setImageLoading(true);
			const image = e.target.files[0];

			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`,
					variables: {
						file: null,
						target: 'member',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			setUpdateData((prev) => ({ ...prev, memberImage: responseImage }));

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		} finally {
			setImageLoading(false);
		}
	};

	const updateProfileHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			const input = { ...updateData, _id: user._id };
			const result = await updateMember({
				variables: {
					input,
				},
			});

			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember?.accessToken);
			await sweetMixinSuccessAlert('Information updated successfully.');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData]);

	const doDisabledCheck = () => {
		if (
			updateData.memberNick === '' ||
			updateData.memberPhone === '' ||
			updateData.memberAddress === '' ||
			updateData.memberImage === ''
		) {
			return true;
		}
	};

	const isProfileReady = !doDisabledCheck();

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
		return <>MY PROFILE PAGE MOBILE</>;
	} else
		return (
			<div id="carlen-my-profile-page">
				<motion.div className="carlen-section-header" variants={container} initial="hidden" animate="visible">
					<motion.div className="head-text" variants={item}>
						<span className="eyebrow">ACCOUNT SETTINGS</span>
						<Typography className="title">My Profile</Typography>
						<Typography className="subtitle">Update your personal information and profile image.</Typography>
					</motion.div>
					<motion.span className={isProfileReady ? 'completeness-chip ready' : 'completeness-chip missing'} variants={item}>
						<i className="dot" />
						{isProfileReady ? 'Profile Ready' : 'Missing Information'}
					</motion.span>
				</motion.div>

				<motion.div className="carlen-profile-panel" variants={container} initial="hidden" animate="visible">
					<motion.div className="carlen-profile-photo-card" variants={item}>
						<div className="avatar-ring">
							<img
								className="avatar-img"
								src={
									updateData?.memberImage
										? `${REACT_APP_API_URL}/${updateData?.memberImage}`
										: '/img/profile/defaultUser.svg'
								}
								alt="profile"
							/>
						</div>
						<div className="photo-actions">
							<input
								type="file"
								hidden
								id="hidden-input"
								onChange={uploadImage}
								accept="image/jpg, image/jpeg, image/png"
							/>
							<label htmlFor="hidden-input" className={imageLoading ? 'upload-btn loading' : 'upload-btn'}>
								<CloudUploadOutlinedIcon />
								<Typography>{imageLoading ? 'Uploading…' : 'Upload Profile Image'}</Typography>
							</label>
							<Typography className="upload-text">JPG, JPEG or PNG format only</Typography>
						</div>
					</motion.div>

					<motion.div className="carlen-profile-fields" variants={item}>
						<div className="field">
							<Typography className="field-label">Username</Typography>
							<input
								type="text"
								placeholder="Your username"
								value={updateData.memberNick}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
							/>
						</div>
						<div className="field">
							<Typography className="field-label">Phone</Typography>
							<input
								type="text"
								placeholder="Your phone"
								value={updateData.memberPhone}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
							/>
						</div>
					</motion.div>

					<motion.div className="carlen-profile-address" variants={item}>
						<Typography className="field-label">Address</Typography>
						<input
							type="text"
							placeholder="Your address"
							value={updateData.memberAddress}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
						/>
					</motion.div>

					<motion.div className="carlen-profile-actions" variants={item}>
						<motion.button
							className="cta-primary"
							onClick={updateProfileHandler}
							disabled={doDisabledCheck()}
							whileHover={shouldReduceMotion ? undefined : { y: -2 }}
							whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
						>
							Update Profile
							<NorthEastRoundedIcon />
						</motion.button>
					</motion.div>
				</motion.div>
			</div>
		);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
	},
};

export default MyProfile;
