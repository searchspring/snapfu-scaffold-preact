async function scrollToTop(search, next) {
	setTimeout(() => {
		window.scroll({ top: 0, left: 0, behavior: 'smooth' });
	});
	await next();
}

export const plugin = (controller) => {
	// log the store
	controller.on('afterStore', async ({ controller }, next) => {
		controller.log.debug('store', controller.store.toJSON());
		await next();
	});

	controller.on('afterStore', scrollToTop);
};
