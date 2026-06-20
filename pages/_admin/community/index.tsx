import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, MenuItem } from '@mui/material';
import Select from '@mui/material/Select';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { motion, useReducedMotion } from 'framer-motion';
import CommunityArticleList from '../../../libs/components/admin/community/CommunityArticleList';
import { AllBoardArticlesInquiry } from '../../../libs/types/board-article/board-article.input';
import { BoardArticle } from '../../../libs/types/board-article/board-article';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { BoardArticleUpdate } from '../../../libs/types/board-article/board-article.update';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { useMutation, useQuery } from '@apollo/client';
import { T } from '../../../libs/types/common';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';

const AdminCommunity: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<any>([]);
	const [communityInquiry, setCommunityInquiry] = useState<AllBoardArticlesInquiry>(initialInquiry);
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [articleTotal, setArticleTotal] = useState<number>(0);
	const [value, setValue] = useState(
		communityInquiry?.search?.articleStatus ? communityInquiry?.search?.articleStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');
	const shouldReduceMotion = useReducedMotion();

	/** APOLLO REQUESTS **/
	const [updateBoardArticleByAdmin] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeBoardArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

	const {
			loading: getAllBoardArticlesByAdminLoading,
			error: getAllBoardArticlesByAdminError,
			data: getAllBoardArticlesByAdminData,
			refetch: getAllBoardArticlesByAdminRefetch,
		} = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
			fetchPolicy: 'network-only',
			variables: { input: communityInquiry },
			notifyOnNetworkStatusChange: true,
			onCompleted: (data: T) => {
				setArticles(data?.getAllBoardArticlesByAdmin?.list);
				setArticleTotal(data?.getAllBoardArticlesByAdmin?.metaCounter[0]?.total ?? 0);
			}
		});

	/** LIFECYCLES **/
	useEffect(() => {}, [communityInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		communityInquiry.page = newPage + 1;
		await getAllBoardArticlesByAdminRefetch({ inquiry: communityInquiry });
		setCommunityInquiry({ ...communityInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		communityInquiry.limit = parseInt(event.target.value, 10);
		communityInquiry.page = 1;
		await getAllBoardArticlesByAdminRefetch({ inquiry: communityInquiry });
		setCommunityInquiry({ ...communityInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);

		setCommunityInquiry({ ...communityInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setCommunityInquiry({ ...communityInquiry, search: { articleStatus: BoardArticleStatus.ACTIVE } });
				break;
			case 'DELETE':
				setCommunityInquiry({ ...communityInquiry, search: { articleStatus: BoardArticleStatus.DELETE } });
				break;
			default:
				delete communityInquiry?.search?.articleStatus;
				setCommunityInquiry({ ...communityInquiry });
				break;
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setCommunityInquiry({
					...communityInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...communityInquiry.search,
						articleCategory: newValue as BoardArticleCategory,
					},
				});
			} else {
				delete communityInquiry?.search?.articleCategory;
				setCommunityInquiry({ ...communityInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updateArticleHandler = async (updateData: BoardArticleUpdate) => {
		try {
					console.log('+updateData: ', updateData);
					await updateBoardArticleByAdmin({
						variables: {
							input: updateData,
						},
					});
					
					menuIconCloseHandler();
					await getAllBoardArticlesByAdminRefetch({ inquiry: communityInquiry });
				} catch (err: any) {
					menuIconCloseHandler();
					sweetErrorHandling(err).then();
				}
	};

	const removeArticleHandler = async (id: string) => {
		try {
					if (await sweetConfirmAlert('Are you sure to remove?')) {
						await removeBoardArticleByAdmin({
							variables: {
								input: id,
							},
						});
						await getAllBoardArticlesByAdminRefetch({ inquiry: communityInquiry });
					}
					menuIconCloseHandler();
				} catch (err: any) {
					sweetErrorHandling(err).then();
				}
	};

	console.log('+communityInquiry', communityInquiry);
	console.log('+articles', articles);

	const stagger = {
		hidden: {},
		visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06 } },
	};
	const fadeItem = {
		hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
	};

	const TABS = [
		{ id: 'ALL', label: 'All' },
		{ id: 'ACTIVE', label: 'Active' },
		{ id: 'DELETE', label: 'Delete' },
	];

	return (
		<Box component={'div'} className={'content carlen-admin-community'}>
			<motion.div
				className={'cap-shell'}
				initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
			>
				<TabContext value={value}>
					<motion.div variants={stagger} initial={'hidden'} animate={'visible'}>
						{/* HEADER */}
						<motion.div className={'cap-head'} variants={fadeItem}>
							<span className={'eyebrow'}>OPERATIONS</span>
							<h1>Article Management</h1>
							<p>Review, filter, and manage community posts across Carlen.</p>
						</motion.div>

						{/* TOOLBAR: segmented tabs + category filter */}
						<motion.div className={'cap-toolbar'} variants={fadeItem}>
							<div className={'cap-tabs'} role={'tablist'}>
								{TABS.map((tab) => (
									<button
										type={'button'}
										role={'tab'}
										aria-selected={value === tab.id}
										key={tab.id}
										className={`cap-tab ${value === tab.id ? 'active' : ''}`}
										onClick={(e: any) => tabChangeHandler(e, tab.id)}
									>
										{tab.label}
									</button>
								))}
							</div>

							<div className={'cap-filter'}>
								<Select
									className={'cap-type-select'}
									value={searchType}
									MenuProps={{ classes: { paper: 'carlen-admin-select-menu' } }}
								>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										ALL
									</MenuItem>
									{Object.values(BoardArticleCategory).map((category: string) => (
										<MenuItem value={category} onClick={() => searchTypeHandler(category)} key={category}>
											{category}
										</MenuItem>
									))}
								</Select>
							</div>
						</motion.div>

						{/* TABLE */}
						<motion.div className={'cap-table'} variants={fadeItem}>
							<CommunityArticleList
								articles={articles}
								anchorEl={anchorEl}
								menuIconClickHandler={menuIconClickHandler}
								menuIconCloseHandler={menuIconCloseHandler}
								updateArticleHandler={updateArticleHandler}
								removeArticleHandler={removeArticleHandler}
							/>

							<TablePagination
								rowsPerPageOptions={[10, 20, 40, 60]}
								component="div"
								count={articleTotal}
								rowsPerPage={communityInquiry?.limit}
								page={communityInquiry?.page - 1}
								onPageChange={changePageHandler}
								onRowsPerPageChange={changeRowsPerPageHandler}
							/>
						</motion.div>
					</motion.div>
				</TabContext>
			</motion.div>
		</Box>
	);
};

AdminCommunity.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminCommunity);
