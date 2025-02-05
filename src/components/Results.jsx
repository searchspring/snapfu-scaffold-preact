import { h, Fragment } from 'preact';
import { observer } from 'mobx-react';
import { Result, InlineBanner, withController, useMediaQuery } from '@searchspring/snap-preact-components';

export const Results = withController(
	observer((props) => {
		const controller = props.controller;
		const { results } = controller.store;

		const isMobile = useMediaQuery('(max-width: 767px)');

		return (
			<div className="ss__results" style={{ display: 'grid', gap: '40px', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)` }}>
				{results.map((result) => (
					<>
						{{
							banner: <InlineBanner banner={result} />,
						}[result.type] || <Result result={result} />}
					</>
				))}
			</div>
		);
	})
);

export const NoResults = withController(
	observer((props) => {
		const controller = props.controller;
		const store = controller.store;
		const dym = store.search.didYouMean;
		const contactEmail = 'contact@thesite.com';

		return (
			<div className="ss__no-results">
				<div className="ss__no-results__container">
					{dym && (
						<p className="ss__did-you-mean">
							Did you mean <a href={dym.url.href}>{dym.string}</a>?
						</p>
					)}
				</div>

				<div className="ss__no-results__container">
					<h4 style="margin-bottom: 5px;">Suggestions</h4>

					<ul className="ss__no-results__suggestions">
						<li>Check for misspellings.</li>
						<li>Remove possible redundant keywords (ie. "products").</li>
						<li>Use other words to describe what you are searching for.</li>
					</ul>

					<p>
						Still can't find what you're looking for?{' '}
						<a href="/contact-us/" style="font-size: 14px;">
							Contact us
						</a>
						.
					</p>

					<hr />

					<div className="ss__no-results__container">
						<div className="ss__no-results__contact">
							<div className="ss__no-results__contact__phone">
								<h4 style="margin-bottom: 5px;">Call Us</h4>
								<p>555-555-5555</p>
							</div>

							<div className="ss__no-results__contact__email">
								<h4 style="margin-bottom: 5px;">Email Us</h4>
								<p>
									<a href={`mailto:${contactEmail}`} style="font-size: 14px;">
										{contactEmail}
									</a>
								</p>
							</div>

							<div className="ss__no-results__contact__location">
								<h4 style="margin-bottom: 5px;">Physical Address</h4>
								<p>
									123 Street Address
									<br />
									City, State, Zipcode
								</p>
							</div>

							<div className="ss__no-results__contact__hours">
								<h4 style="margin-bottom: 5px;">Hours</h4>
								<p>Monday - Friday: 8am - 9pm MDT</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	})
);
