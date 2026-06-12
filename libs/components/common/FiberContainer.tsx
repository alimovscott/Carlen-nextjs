import React, { CSSProperties } from 'react';

/**
 * Carlen premium automotive showcase.
 *
 * A lightweight, CSS-only layered "floating gallery" that replaces the previous
 * Three.js / @react-three/fiber WebGL canvas. Purely decorative: it lives on the
 * hero right side, never intercepts pointer events, and is hidden from assistive
 * tech. All positioning, glass styling and motion live in scss/pc/main.scss
 * (`.carlen-showcase`); only the per-card depth/stagger index `--i` is inline.
 */

type ShowcaseCard = {
	src: string;
	/** depth/stagger layer — drives float amplitude, delay and z-order in SCSS */
	depth: number;
};

// Same 8 assets the old WebGL gallery used, composed into an editorial stack.
const CARDS: ShowcaseCard[] = [
	{ src: '/img/fiber/img7.jpg', depth: 0 },
	{ src: '/img/fiber/img1.jpg', depth: 1 },
	{ src: '/img/fiber/img4.jpg', depth: 2 },
	{ src: '/img/fiber/img5.jpg', depth: 3 },
	{ src: '/img/fiber/img8.jpg', depth: 4 },
	{ src: '/img/fiber/img2.jpg', depth: 5 },
];

export default function FiberContainer() {
	return (
		<div className="carlen-showcase" aria-hidden="true">
			<div className="carlen-showcase__ambient" />
			<div className="carlen-showcase__stage">
				{CARDS.map((card, index) => (
					<figure
						key={`${card.src}-${index}`}
						className={`carlen-showcase__card depth-${card.depth}`}
						style={{ '--i': card.depth } as CSSProperties}
					>
						<img src={card.src} alt="" loading="lazy" decoding="async" draggable={false} />
						<span className="carlen-showcase__sheen" />
					</figure>
				))}
			</div>
		</div>
	);
}
