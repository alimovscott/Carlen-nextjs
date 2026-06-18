import React, { useEffect, useState } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Viewer } from '@toast-ui/react-editor';
import { motion, useReducedMotion } from 'framer-motion';

const TViewer = (props: any) => {
	const [editorLoaded, setEditorLoaded] = useState(false);
	const shouldReduceMotion = useReducedMotion();

	/** LIFECYCLES **/
	useEffect(() => {
		if (props.markdown) {
			setEditorLoaded(true);
		} else {
			setEditorLoaded(false);
		}
	}, [props.markdown]);

	return (
		<motion.div
			className="carlen-community-viewer"
			initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
			animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
		>
			<div className="viewer-body">
				{editorLoaded ? (
					<Viewer
						initialValue={props.markdown}
						customHTMLRenderer={{
							htmlBlock: {
								iframe(node: any) {
									return [
										{
											type: 'openTag',
											tagName: 'iframe',
											outerNewLine: true,
											attributes: node.attrs,
										},
										{ type: 'html', content: node.childrenHTML ?? '' },
										{ type: 'closeTag', tagName: 'iframe', outerNewLine: true },
									];
								},
								div(node: any) {
									return [
										{ type: 'openTag', tagName: 'div', outerNewLine: true, attributes: node.attrs },
										{ type: 'html', content: node.childrenHTML ?? '' },
										{ type: 'closeTag', tagName: 'div', outerNewLine: true },
									];
								},
							},
							htmlInline: {
								big(node: any, { entering }: any) {
									return entering
										? { type: 'openTag', tagName: 'big', attributes: node.attrs }
										: { type: 'closeTag', tagName: 'big' };
								},
							},
						}}
					/>
				) : (
					<div className="viewer-loading" aria-label="Loading article">
						<span className="viewer-skeleton-line w-40" />
						<span className="viewer-skeleton-line w-90" />
						<span className="viewer-skeleton-line w-80" />
						<span className="viewer-skeleton-line w-95" />
						<span className="viewer-skeleton-line w-60" />
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default TViewer;
