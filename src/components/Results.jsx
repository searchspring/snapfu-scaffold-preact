import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';
import { Price, InlineBanner, withController } from '@searchspring/snap-preact-components';

@withController
@observer
export class Results extends Component {
	componentDidMount() {
		// custom JS integration code
	}
	componentDidUpdate() {
		// custom JS integration code
	}

	render() {
		const controller = this.props.controller;
		const { results } = controller.store;

		return (
			<ul class="ss__results">
				{results.map((result) => (
					<li class="ss__result" key={result.id}>
						{{
							banner: <InlineBanner banner={result} />,
						}[result.type] || <Result result={result} />}
					</li>
				))}
			</ul>
		);
	}
}

@withController
@observer
class Result extends Component {
	render() {
		const { result, controller } = this.props;
		const {
			attributes,
			mappings: { core },
		} = result;
		const intellisuggest = (e) => controller.track.product.click(e, result);

		return (
			result && (
				<div>
					<a href={core.url} onClick={intellisuggest}>
						{core.name}
					</a>
					<hr />
					<Price value={core.price} />
				</div>
			)
		);
	}
}

@withController
@observer
export class NoResults extends Component {
	render() {
		const controller = this.props.controller;
		const store = controller.store;
		const dym = store.search.didYouMean;
		const contactEmail = 'contact@thesite.com';

		return (
			<div class="ss__no-results">
				<div class="ss__no-results__container">
					{dym && (
						<p class="ss__did-you-mean">
							Did you mean <a href={dym.url.href}>{dym.string}</a>?
						</p>
					)}
				</div>

				<div class="ss__no-results__container">
					<h4 style="margin-bottom: 5px;">Suggestions</h4>

					<ul class="ss__no-results__suggestions">
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

					<div class="ss__no-results__container">
						<div class="ss__no-results__contact">
							<div class="ss__no-results__contact__phone">
								<h4 style="margin-bottom: 5px;">Call Us</h4>
								<p>555-555-5555</p>
							</div>

							<div class="ss__no-results__contact__email">
								<h4 style="margin-bottom: 5px;">Email Us</h4>
								<p>
									<a href={`mailto:${contactEmail}`} style="font-size: 14px;">
										{contactEmail}
									</a>
								</p>
							</div>

							<div class="ss__no-results__contact__location">
								<h4 style="margin-bottom: 5px;">Physical Address</h4>
								<p>
									123 Street Address
									<br />
									City, State, Zipcode
								</p>
							</div>

							<div class="ss__no-results__contact__hours">
								<h4 style="margin-bottom: 5px;">Hours</h4>
								<p>Monday - Friday: 8am - 9pm MDT</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
