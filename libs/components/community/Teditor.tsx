import React, { useRef, useState } from 'react';
import { FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useMutation, useReactiveVar } from '@apollo/client';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_MEMBER } from '../../../apollo/user/query';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { userVar } from '../../../apollo/store';

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null),
		token = getJwtToken(),
		router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const user = useReactiveVar(userVar);
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
	const [articleTitle, setArticleTitle] = useState<string>('');
	const [articleImage, setArticleImage] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	/** ANIMATION **/
	const container: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1, delayChildren: 0.05 } },
	};
	const item: Variants = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
		visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
	};

	/** HANDLERS **/
	const uploadImage = async (image: any) => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`,
					variables: {
						file: null,
						target: 'article',
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
			console.log('=responseImage: ', responseImage);
			setArticleImage(responseImage);

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		setArticleTitle(e.target.value);
	};

	const handleRegisterButton = async () => {
		try {
			setLoading(true);
			const raw = (editorRef.current?.getInstance().getHTML() ?? '') as string;
			const articleContent = raw === '<p><br></p>' ? '' : raw;

			if (!articleTitle.trim() || !articleContent.trim()) {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			await createBoardArticle({
				variables: {
					input: { articleTitle, articleContent, articleImage, articleCategory },
				},
				refetchQueries: user?._id ? [{ query: GET_MEMBER, variables: { input: user._id } }] : [],
				awaitRefetchQueries: true,
			});

			await sweetTopSuccessAlert('Article is created successfully', 700);
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myArticles',
				},
			});
		} catch (err: any) {
			console.log(err);
			sweetErrorHandling(new Error(Message.INSERT_ALL_INPUTS)).then();
		} finally {
			setLoading(false);
		}
	};

	const cancelHandler = () => {
		router.push('/community');
	};

	return (
		<Stack className="carlen-community-editor">
			<motion.div
				className="editor-hero"
				variants={container}
				initial="hidden"
				animate="visible"
			>
				<motion.span className="editor-eyebrow" variants={item}>
					Community Studio
				</motion.span>
				<motion.h1 className="editor-title" variants={item}>
					Create a New Discussion
				</motion.h1>
				<motion.p className="editor-subtitle" variants={item}>
					Share updates, recommendations, and stories with the Carlen community.
				</motion.p>
			</motion.div>

			<motion.div
				className="editor-meta-row"
				variants={container}
				initial="hidden"
				animate="visible"
			>
				<motion.div className="meta-field" variants={item}>
					<Typography className="meta-label">Category</Typography>
					<FormControl fullWidth className="meta-select">
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': 'Article category' }}
						>
							<MenuItem value={BoardArticleCategory.FREE}>Free Discussion</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
						</Select>
					</FormControl>
				</motion.div>

				<motion.div className="meta-field" variants={item}>
					<Typography className="meta-label">Title</Typography>
					<TextField
						fullWidth
						className="meta-input"
						value={articleTitle}
						onChange={articleTitleHandler}
						placeholder="Write a clear title for your discussion"
						inputProps={{ 'aria-label': 'Article title' }}
					/>
				</motion.div>
			</motion.div>

			<motion.div
				className="editor-panel"
				initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
				animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
			>
				<Editor
					initialValue={'Type here'}
					placeholder={'Type here'}
					previewStyle={'vertical'}
					height={'640px'}
					// @ts-ignore
					initialEditType={'WYSIWYG'}
					toolbarItems={[
						['heading', 'bold', 'italic', 'strike'],
						['image', 'table', 'link'],
						['ul', 'ol', 'task'],
					]}
					ref={editorRef}
					hooks={{
						addImageBlobHook: async (image: any, callback: any) => {
							const uploadedImageURL = await uploadImage(image);
							callback(uploadedImageURL);
							return false;
						},
					}}
					events={{
						load: function (param: any) {},
					}}
				/>
			</motion.div>

			<Stack className="editor-actions">
				<motion.button
					type="button"
					className="cta-secondary"
					onClick={cancelHandler}
					whileHover={shouldReduceMotion ? undefined : { y: -2 }}
					whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
				>
					Cancel
				</motion.button>
				<motion.button
					type="button"
					className="cta-primary"
					onClick={handleRegisterButton}
					disabled={loading}
					whileHover={shouldReduceMotion || loading ? undefined : { y: -2 }}
					whileTap={shouldReduceMotion || loading ? undefined : { scale: 0.97 }}
				>
					{loading ? 'Publishing…' : 'Publish Discussion'}
				</motion.button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
