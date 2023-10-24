// TODO - move to toolbox
export async function until(thing, customOptions) {
	const options = {
		checkMax: 20,
		checkCount: 0,
		checkTime: 50,
		exponential: 1.2, // TODO
		defer: false,
		...customOptions,
	};

	return new Promise(async (resolve, reject) => {
		const thingCheck = await checkForThing(thing);
		if (thingCheck && !options.defer) {
			resolve(thingCheck);
		} else {
			waiting();
		}

		function waiting() {
			window.setTimeout(async () => {
				const thingCheck = await checkForThing(thing);
				if (thingCheck) {
					return resolve(thingCheck);
				}
				options.checkCount++;
				options.checkTime *= options.exponential;

				if (options.checkCount < options.checkMax) {
					return waiting();
				}

				// timeout reached
				return reject();
			}, options.checkTime);
		}

		function checkForThing(thing) {
			switch (typeof thing) {
				case 'function': {
					return thing();
				}
				default: {
					if (thing) {
						return thing;
					}
				}
			}
		}
	});
}
