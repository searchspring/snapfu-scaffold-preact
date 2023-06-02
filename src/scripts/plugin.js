async function restorePosition({ element }, next) {
	// scroll to top only if we are not going to be scrolling to stored element
	if (!element) {
		setTimeout(() => {
			window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
		});
	}

	await next();
}

export const plugin = (controller) => {
	// log the store
	controller.on('afterStore', async ({ controller }, next) => {
		controller.log.debug('store', controller.store.toJSON());
		await next();
	});

	controller.on('restorePosition', restorePosition);
};
