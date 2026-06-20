import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { Box, InputAdornment } from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';

const AdminUsers: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [membersInquiry, setMembersInquiry] = useState<MembersInquiry>(initialInquiry);
	const [members, setMembers] = useState<Member[]>([]);
	const [membersTotal, setMembersTotal] = useState<number>(0);
	const [value, setValue] = useState(
		membersInquiry?.search?.memberStatus ? membersInquiry?.search?.memberStatus : 'ALL',
	);
	const [searchText, setSearchText] = useState('');
	const [searchType, setSearchType] = useState('ALL');
	const shouldReduceMotion = useReducedMotion();

	/** APOLLO REQUESTS **/
	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const {
		loading: getAllMembersByAdminLoading,
		error: getAllMembersByAdminError,
		data: getAllMembersByAdminData,
		refetch: getAllMembersRefetch,
	} = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {input: membersInquiry},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data) => {
			setMembers(data?.getAllMembersByAdmin?.list);
			setMembersTotal(data?.getAllMembersByAdmin?.metaCounter[0]?.total ?? 0);
		}
	});
	

	/** LIFECYCLES **/
	useEffect(() => {
		getAllMembersRefetch({input: membersInquiry}).then();
	}, [membersInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		membersInquiry.page = newPage + 1;
		await getAllMembersRefetch({input: membersInquiry})
		setMembersInquiry({ ...membersInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		membersInquiry.limit = parseInt(event.target.value, 10);
		membersInquiry.page = 1;
		await getAllMembersRefetch({input: membersInquiry})
		setMembersInquiry({ ...membersInquiry });
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
		setSearchText('');

		setMembersInquiry({ ...membersInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setMembersInquiry({ ...membersInquiry, search: { memberStatus: MemberStatus.ACTIVE } });
				break;
			case 'BLOCK':
				setMembersInquiry({ ...membersInquiry, search: { memberStatus: MemberStatus.BLOCK } });
				break;
			case 'DELETE':
				setMembersInquiry({ ...membersInquiry, search: { memberStatus: MemberStatus.DELETE } });
				break;
			default:
				delete membersInquiry?.search?.memberStatus;
				setMembersInquiry({ ...membersInquiry });
				break;
		}
	};

	const updateMemberHandler = async (updateData: MemberUpdate) => {
		try {
			await updateMemberByAdmin({ 
				variables: { 
					input: updateData,
				 }
			 });

			menuIconCloseHandler();
			await getAllMembersRefetch({input: membersInquiry});
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const textHandler = useCallback((value: string) => {
		try {
			setSearchText(value);
		} catch (err: any) {
			console.log('textHandler: ', err.message);
		}
	}, []);

	const searchTextHandler = () => {
		try {
			setMembersInquiry({
				...membersInquiry,
				search: {
					...membersInquiry.search,
					text: searchText,
				},
			});
		} catch (err: any) {
			console.log('searchTextHandler: ', err.message);
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setMembersInquiry({
					...membersInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...membersInquiry.search,
						memberType: newValue as MemberType,
					},
				});
			} else {
				delete membersInquiry?.search?.memberType;
				setMembersInquiry({ ...membersInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

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
		{ id: 'BLOCK', label: 'Blocked' },
		{ id: 'DELETE', label: 'Deleted' },
	];

	return (
		<Box component={'div'} className={'content carlen-admin-users'}>
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
							<h1>Member Management</h1>
							<p>Monitor and manage Carlen members, roles and access.</p>
						</motion.div>

						{/* TOOLBAR: segmented tabs + search/filter */}
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
								<OutlinedInput
									value={searchText}
									onChange={(e: any) => textHandler(e.target.value)}
									className={'cap-search'}
									placeholder="Search user name"
									onKeyDown={(event) => {
										if (event.key == 'Enter') searchTextHandler();
									}}
									endAdornment={
										<>
											{searchText && (
												<CancelRoundedIcon
													className={'cap-search-clear'}
													style={{ cursor: 'pointer' }}
													onClick={async () => {
														setSearchText('');
														setMembersInquiry({
															...membersInquiry,
															search: {
																...membersInquiry.search,
																text: '',
															},
														});
														await getAllMembersRefetch({ input: membersInquiry });
													}}
												/>
											)}
											<InputAdornment position="end" onClick={() => searchTextHandler()}>
												<img src="/img/icons/search_icon.png" alt={'searchIcon'} />
											</InputAdornment>
										</>
									}
								/>
								<Select
									className={'cap-type-select'}
									value={searchType}
									MenuProps={{ classes: { paper: 'carlen-admin-select-menu' } }}
								>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										All
									</MenuItem>
									<MenuItem value={'USER'} onClick={() => searchTypeHandler('USER')}>
										User
									</MenuItem>
									<MenuItem value={'AGENT'} onClick={() => searchTypeHandler('AGENT')}>
										Agent
									</MenuItem>
									<MenuItem value={'ADMIN'} onClick={() => searchTypeHandler('ADMIN')}>
										Admin
									</MenuItem>
								</Select>
							</div>
						</motion.div>

						{/* TABLE */}
						<motion.div className={'cap-table'} variants={fadeItem}>
							<MemberPanelList
								members={members}
								anchorEl={anchorEl}
								menuIconClickHandler={menuIconClickHandler}
								menuIconCloseHandler={menuIconCloseHandler}
								updateMemberHandler={updateMemberHandler}
							/>

							<TablePagination
								rowsPerPageOptions={[10, 20, 40, 60]}
								component="div"
								count={membersTotal}
								rowsPerPage={membersInquiry?.limit}
								page={membersInquiry?.page - 1}
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

AdminUsers.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		search: {},
	},
};

export default withAdminLayout(AdminUsers);
