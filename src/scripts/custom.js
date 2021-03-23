async function scrollToTop(search, next) {
	window.scroll({ top: 0, left: 0, behavior: 'smooth' });
	await next();
}

export const middleware = (controller) => {
	controller.on('init', async ({ controller }, next) => {
		const versionText = 'SNAPreact 0.2.1';

		controller.log.imageText({
			url: 'https://searchspring.com/wp-content/themes/SearchSpring-Theme/dist/images/favicons/favicon.svg',
			text: `   ${versionText}`,
			style: `color: ${colors.indigo}; font-weight: bold;`,
		});

		await next();
	});

	controller.on('afterStore', scrollToTop);
};
