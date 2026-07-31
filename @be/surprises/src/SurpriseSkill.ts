/**
 * @EosBase
 *
 * Created on 6/25/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import * as jibo from 'jibo';
import * as path from 'path';
import { BeSkill } from '@be/be-framework';
import { SurpriseElement, LaunchContext } from './SurpriseElement';
import {
	SelectionPolicy,
	HighestPriorityPolicy,
	CategoryResult
} from "./policies";
import {
	KBTools,
	CategoryKBNode,
	EoSKBNode
} from './kb';
import { EoSControl } from './EoSControl';


export type AsyncCallback = (err?: any)=>void;


export class SurpriseSkill extends BeSkill {

	public static OPEN_WAIT_TIME_MS = 150; // time to wait in open method before checking for environmental inhibiting signals
	categories: SurpriseElement[];
	selectionPolicy: SelectionPolicy = new HighestPriorityPolicy(this);
	eosControl = new EoSControl(null);
	openPromise: Promise<void> = Promise.resolve();
	isActive: boolean = false;

	constructor(assetPack) {
		super(assetPack);
	}

	postInit(done: AsyncCallback) {
		this._postInit().then(done).catch(done);
	}

	async _postInit(): Promise<void> {
		await KBTools.getRoot(); // Workaround for a kb bug

		this.eosControl.identity = jibo.lps.identity;
		await this.eosControl.init(path.join(jibo.utils.PathUtils.findRoot(), 'testConfig.json'));
	}

	/**
	 * Provide categories. This is either called from Be during setup or
	 * the constructor in standalone mode
	 * @param {SurpriseElement[]} categories
	 */
	supplyCategories(categories: SurpriseElement[]) {
		categories.forEach( cat => {
			if (!cat.isElementOfSurprise) {
				throw Error(`Invalid EoS category: ${cat.assetPack}`);
			}
		});
		this.categories = categories;
	}

	/**
	 * Called just before skill starts
	 * @param done
	 */
	preload(done:(err?:any) => void) {
		done();
	}

	open(result?: any): void {
		// Needed to make sure that the Be LOADED state gets set
		// in case we redirect immediately
		process.nextTick( () => {
			this._open(result)
				.then( ([categoryName, context]) => {
					if (categoryName) {
						this.redirect(categoryName, context);
					}
					else {
						this.exit();
					}
				})
				.catch( e => {
					this.log.error(`error opening: `, e);
					this.exit();
				});
		});
	}

	/**
	 * Called when skill is closing
	 * @param {function} done
	 */
	close(done: Function): void {
		this.log.info(`Exiting`);
		this.isActive = false;
		this.openPromise
			.then(() => done())
			.catch(error => done(error));
	}

	/**
	 * Internal async open method, mostly exists to make open async
	 * @param result
	 * @private
	 */
	private async _open(result?: any): Promise<[string, any]> {
		this.eosControl.defaultLastSkill = (result && result.lastSkill) ? result.lastSkill : '';

		// Wait to allow some VAD samples in
		this.isActive = true;
		this.openPromise = new Promise(resolve => setTimeout(resolve, SurpriseSkill.OPEN_WAIT_TIME_MS));
		await this.openPromise;
		if (!this.isActive) {
			// close was called while we were waiting
			return [null, null];
		}

		if (!jibo.action.checkEnvironmentContext()) {
			this.log.info(`No EoS because environment context is loud or detected people talking.`);
			return [null, null];
		} else if (await this.eosControl.pickNoCategory()) {
			this.log.info(`No EoS category selected because of 'pickNoCategory' option`);
			return [null, null];
		}

		// First we construct the context
		const context = await this._constructContext(result);
		// We then select the category based on this context
		const categoryName = await this._selectCategory(context);

		if (!categoryName) {
			this.log.info(`No EoS category selected`);
			return [null, null];
		}
		else {
			this.log.info(`EoS category '${categoryName}' selected`);
			return [categoryName, context];
		}
	}

	/**
	 * Builds the launch context for all Surprise categories. They use this as a basis for
	 * whether or not they want to be selected
	 * @param {Object} result Input results that were originally passed in through open
	 * @return {LaunchContext}
	 * @private
	 */
	private async _constructContext(result?: any): Promise<LaunchContext> {
		const lastSkill = await this.eosControl.getLastSkill();
		let context: LaunchContext = { lastSkill };
		context.userID = await this.eosControl.getUserID();
		return context;
	}

	/**
	 * Selects what category to run
	 * Selects what category to run
	 * @param {LaunchContext} context
	 */
	private async _selectCategory(context: LaunchContext): Promise<string> {
		// Ask all installed categories how much they want to be selected
		const priorityPrs = this.categories.map( (cat: SurpriseElement) => {
			return cat.getContextualPriority(context)
				.then(priority => {
					return {
						category: cat,
						contextualPriority: priority,
						totalPriority: priority * cat.getCategoryPriority()
					};
				});
		});

		let categories: CategoryResult[] = await Promise.all(priorityPrs);
		// Remove all categories with 0 priority
		categories = categories.filter((res: CategoryResult) => res.totalPriority > 0);
		// Sort in reverse order (highest first)
		categories.sort((a, b) => {
			return b.totalPriority - a.totalPriority;
		});

		if (categories.length === 0) {
			// If no categories remain then we're done
			this.log.info(`No Eos categories participating`);
		}
		else {
			// Get the selected category using our installed selection policy
			const category = await this.selectionPolicy.select(context, categories);
			const selectedCategoryName = category ? category.assetPack : null;

			const [catNode, eosNode] = await Promise.all([
				CategoryKBNode.getOrCreate(selectedCategoryName),
				EoSKBNode.getOrCreate(),
			]);
			await Promise.all([
				catNode.markSelected(),
				eosNode.markDelivered(),
			]);

			return selectedCategoryName;
		}
	}
}
