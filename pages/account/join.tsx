import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useRouter } from 'next/router';
import { motion, useReducedMotion } from 'framer-motion';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const BENEFITS = [
	{ Icon: CheckCircleOutlineRoundedIcon, title: 'Verified listings', desc: 'Every vehicle vetted before it reaches you.' },
	{ Icon: SpaceDashboardOutlinedIcon, title: 'Dealer dashboard', desc: 'Manage inventory and inquiries in one place.' },
	{ Icon: ForumOutlinedIcon, title: 'Community access', desc: 'Join discussions with owners and enthusiasts.' },
];

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const shouldReduceMotion = useReducedMotion();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const fadeUp = (delay: number) => ({
		initial: shouldReduceMotion ? false : { opacity: 0, y: 16 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.45, delay, ease: [0.23, 1, 0.32, 1] as const },
	});

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	} else {
		return (
			<Stack className={'carlen-auth-page'} component={'section'} aria-label={'Carlen account access'}>
				<Stack className={'container'}>
					<Stack className={'carlen-auth-shell'}>
						{/* LEFT — form panel */}
						<motion.div className={'carlen-auth-panel'} {...fadeUp(0)}>
							{/* @ts-ignore */}
							<Box className={'logo'}>
								<img src="/img/logo/logoText.svg" alt="Carlen" className={'carlen-logo-hover'} />
								<span>Carlen</span>
							</Box>

							<Box className={'info'}>
								<span className={'eyebrow'}>{loginView ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
								<h1>{loginView ? 'Welcome back' : 'Create your account'}</h1>
								<p>
									{loginView
										? 'Access your Carlen account, listings, and dashboard.'
										: 'Join Carlen to buy, sell, and connect across the marketplace.'}
								</p>
							</Box>

							<motion.div
								key={loginView ? 'login-fields' : 'signup-fields'}
								initial={shouldReduceMotion ? false : { opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
							>
								<Box className={'carlen-auth-fields'}>
									<div className={'carlen-auth-field'}>
										<label htmlFor={'auth-nick'}>Nickname</label>
										<input
											id={'auth-nick'}
											type="text"
											placeholder={'Enter Nickname'}
											onChange={(e) => handleInput('nick', e.target.value)}
											required={true}
											onKeyDown={(event) => {
												if (event.key == 'Enter' && loginView) doLogin();
												if (event.key == 'Enter' && !loginView) doSignUp();
											}}
										/>
									</div>
									<div className={'carlen-auth-field'}>
										<label htmlFor={'auth-password'}>Password</label>
										<input
											id={'auth-password'}
											type="password"
											placeholder={'Enter Password'}
											onChange={(e) => handleInput('password', e.target.value)}
											required={true}
											onKeyDown={(event) => {
												if (event.key == 'Enter' && loginView) doLogin();
												if (event.key == 'Enter' && !loginView) doSignUp();
											}}
										/>
									</div>
									{!loginView && (
										<div className={'carlen-auth-field'}>
											<label htmlFor={'auth-phone'}>Phone</label>
											<input
												id={'auth-phone'}
												type="tel"
												placeholder={'Enter Phone'}
												onChange={(e) => handleInput('phone', e.target.value)}
												required={true}
												onKeyDown={(event) => {
													if (event.key == 'Enter') doSignUp();
												}}
											/>
										</div>
									)}
								</Box>

								<Box className={'carlen-auth-actions'}>
									{!loginView && (
										<div className={'type-option'} role={'radiogroup'} aria-label={'Account type'}>
											<span className={'text'}>I want to be registered as:</span>
											<div className={'type-cards'}>
												<button
													type={'button'}
													role={'radio'}
													aria-checked={input?.type === 'USER'}
													className={`type-card ${input?.type === 'USER' ? 'active' : ''}`}
													onClick={() => handleInput('type', 'USER')}
												>
													<PersonOutlineRoundedIcon />
													<strong>Buyer</strong>
													<span>Browse and buy vehicles</span>
												</button>
												<button
													type={'button'}
													role={'radio'}
													aria-checked={input?.type === 'AGENT'}
													className={`type-card ${input?.type === 'AGENT' ? 'active' : ''}`}
													onClick={() => handleInput('type', 'AGENT')}
												>
													<StorefrontOutlinedIcon />
													<strong>Dealer / Agent</strong>
													<span>List and manage inventory</span>
												</button>
											</div>
										</div>
									)}

									{loginView && (
										<div className={'remember-info'}>
											<FormGroup>
												<FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
											</FormGroup>
											<span className={'lost-pw'}>
												Lost your password? <em>soon</em>
											</span>
										</div>
									)}

									{loginView ? (
										<Button
											className={'cta'}
											variant="contained"
											disableElevation
											disabled={input.nick == '' || input.password == ''}
											onClick={doLogin}
										>
											Sign In
										</Button>
									) : (
										<Button
											className={'cta'}
											variant="contained"
											disableElevation
											disabled={input.nick == '' || input.password == '' || input.phone == '' || input.type == ''}
											onClick={doSignUp}
										>
											Create Account
										</Button>
									)}
								</Box>
							</motion.div>

							<Box className={'carlen-auth-switch'}>
								{loginView ? (
									<p>
										Not registered yet?
										<b
											onClick={() => {
												viewChangeHandler(false);
											}}
										>
											Create Account
										</b>
									</p>
								) : (
									<p>
										Have an account?
										<b onClick={() => viewChangeHandler(true)}>Sign In</b>
									</p>
								)}
							</Box>
						</motion.div>

						{/* RIGHT — premium automotive visual */}
						<Stack className={'carlen-auth-visual'}>
							<div className={'visual-overlay'} />
							<div className={'visual-content'}>
								<h2>Premium access to the Carlen marketplace.</h2>
								<div className={'benefit-cards'}>
									{BENEFITS.map((b, i) => (
										<motion.div className={'benefit-card'} key={b.title} {...fadeUp(0.15 + i * 0.08)}>
											<span className={'benefit-icon'}>
												<b.Icon />
											</span>
											<div className={'benefit-meta'}>
												<strong>{b.title}</strong>
												<span>{b.desc}</span>
											</div>
										</motion.div>
									))}
								</div>
							</div>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
