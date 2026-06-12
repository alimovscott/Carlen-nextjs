import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import HeaderFilter from '../homepage/HeaderFilter';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const FiberContainer = dynamic(() => import('../common/FiberContainer'), { ssr: false });

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Carlen</title>
						<meta name={'title'} content={`Carlen`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={'header-main mobile-header-main'}>
							<Stack className={'container'}>
								<Stack className={'carlen-hero-copy'}>
									<span className={'eyebrow'}>CARLEN · PREMIUM MARKETPLACE</span>
									<strong>Find the car you&apos;ll love to drive.</strong>
									<p>Premium listings and smart filters in one place.</p>
								</Stack>
								<HeaderFilter />
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Carlen</title>
						<meta name={'title'} content={`Carlen`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={'header-main'}>
							<Stack className={'carlen-hero-fiber'} aria-hidden={'true'}>
								<FiberContainer />
							</Stack>
							<Stack className={'container'}>
								<Stack className={'carlen-hero-copy'}>
									<span className={'eyebrow'}>CARLEN · PREMIUM MARKETPLACE</span>
									<strong>Find the car you&apos;ll love to drive.</strong>
									<p>Premium listings, smart filters, and a faster road from first look to test drive.</p>
									<Stack className={'carlen-hero-cta'}>
										<Link href={'/cars'} className={'cta-primary'}>
											Explore all cars
										</Link>
										<Link href={'/agent'} className={'cta-secondary'}>
											Browse dealers
										</Link>
									</Stack>
								</Stack>
								<HeaderFilter />
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutMain;
