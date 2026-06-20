import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Button, InputAdornment } from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { FaqArticlesPanelList } from '../../../libs/components/admin/cs/FaqList';

const FaqArticles: NextPage = (props: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [tab, setTab] = useState('ALL'); // UI-only: drives the active tab highlight (no filtering)
	const shouldReduceMotion = useReducedMotion();

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

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
		// @ts-ignore
		<Box component={'div'} className={'content carlen-admin-faq'}>
			<motion.div
				className={'cap-shell'}
				initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
			>
				<TabContext value={tab}>
					<motion.div variants={stagger} initial={'hidden'} animate={'visible'}>
						{/* HEADER */}
						<motion.div className={'cap-head'} variants={fadeItem}>
							<div className={'cap-head-text'}>
								<span className={'eyebrow'}>SUPPORT</span>
								<h1>FAQ Management</h1>
								<p>Manage support questions and customer guidance for Carlen.</p>
							</div>
							<Button
								className={'cap-add-btn'}
								// onClick={() => router.push(`/_admin/cs/faq_create`)}
							>
								<AddRoundedIcon />
								New FAQ
							</Button>
						</motion.div>

						{/* TOOLBAR: segmented tabs + filters */}
						<motion.div className={'cap-toolbar'} variants={fadeItem}>
							<div className={'cap-tabs'} role={'tablist'}>
								{TABS.map((t) => (
									<button
										type={'button'}
										role={'tab'}
										aria-selected={tab === t.id}
										key={t.id}
										className={`cap-tab ${tab === t.id ? 'active' : ''}`}
										onClick={() => setTab(t.id)}
									>
										{t.label}
									</button>
								))}
							</div>

							<div className={'cap-filter'}>
								<Select
									className={'cap-type-select'}
									value={'category'}
									MenuProps={{ classes: { paper: 'carlen-admin-select-menu' } }}
								>
									<MenuItem value={'category'}>Category</MenuItem>
									<MenuItem value={'keyword'}>Keyword</MenuItem>
								</Select>

								<OutlinedInput
									value={''}
									className={'cap-search'}
									placeholder="Search FAQ"
									onKeyDown={(event) => {
										// if (event.key == 'Enter') searchTargetHandler().then();
									}}
									endAdornment={
										<InputAdornment position="end" onClick={() => {}}>
											<img src="/img/icons/search_icon.png" alt={'searchIcon'} />
										</InputAdornment>
									}
								/>
							</div>
						</motion.div>

						{/* TABLE */}
						<motion.div className={'cap-table'} variants={fadeItem}>
							<FaqArticlesPanelList
								// dense={dense}
								// membersData={membersData}
								// searchMembers={searchMembers}
								anchorEl={anchorEl}
								// handleMenuIconClick={handleMenuIconClick}
								// handleMenuIconClose={handleMenuIconClose}
								// generateMentorTypeHandle={generateMentorTypeHandle}
							/>

							<TablePagination
								rowsPerPageOptions={[20, 40, 60]}
								component="div"
								count={4}
								rowsPerPage={10}
								page={1}
								onPageChange={() => {}}
								onRowsPerPageChange={() => {}}
							/>
						</motion.div>
					</motion.div>
				</TabContext>
			</motion.div>
		</Box>
	);
};

export default withAdminLayout(FaqArticles);
