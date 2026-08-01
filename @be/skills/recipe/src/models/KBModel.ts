import { PromiseUtils } from '../utils/PromiseUtils';
import { userModel as user } from './UserModel';
import jibo = require('jibo');
import path = require('path');

type Node = jibo.kb.Node;
type Model = jibo.kb.Model;

class KBModel {

  public KB_MODEL: string = '/recipe-skill';
  public KB_EDGE: string = 'user';

  public model: Model;
  public rootNode: Node;
  public userNode: Node;

  constructor () {

  }

  async init (): Promise<void> {
    this.model = jibo.kb.createModel(this.KB_MODEL);
    this.rootNode = await PromiseUtils.promisify<Node>(name => this.model.loadRoot(name));

    const edges = this.rootNode.getEdges(this.KB_EDGE);

    if (edges.length === 0) {
      this.userNode = this.model.createNode(this.KB_EDGE, { description: 'User' });
      await PromiseUtils.promisify(h => this.userNode.save(h));
      this.rootNode.addEdges(this.userNode);
      await PromiseUtils.promisify(h => this.rootNode.save(h));
    } else if (edges.length === 1) {
      this.userNode = await PromiseUtils.promisify<Node>(h => this.model.load(edges[0], h));
    } else {
      throw new Error('Recipe Skill cannot have more than one user node.');
    }
  }

	/**
	 * Gets or creates a user node for a user id
	 * @return {Node}
	 */
  async getUserNode (): Promise<Node> {
    const userEdges = this.userNode.getEdges(user.id);
    let userNode: Node;
    // If no user exists
    if (userEdges.length === 0) {
      userNode = this.model.createNode(user.id);
      await PromiseUtils.promisify(h => userNode.save(h));
      this.userNode.addEdges(userNode);
      await PromiseUtils.promisify(h => this.userNode.save(h));
    } else {
      userNode = await PromiseUtils.promisify<Node>(h => this.model.load(userEdges[0], h));
    }
    return userNode;
  }

  /**
   * Returns user's spoken name
   * @return {Promise<string>}
   */
  async getSpokenName () {
    // jibo 14 removed kb.loop.getSpokenNameById; degrade gracefully.
    if (!jibo.kb.loop || typeof jibo.kb.loop.getSpokenNameById !== 'function') {
      return '';
    }
    return PromiseUtils.promisify(h => jibo.kb.loop.getSpokenNameById(user.id, h));
  }

  /**
   * Returns user's written name
   * @return {Promise<string>}
   */
  async getWrittenName () {
    // jibo 14 removed kb.loop.getWrittenNameById; degrade gracefully.
    if (!jibo.kb.loop || typeof jibo.kb.loop.getWrittenNameById !== 'function') {
      return '';
    }
    return PromiseUtils.promisify(h => jibo.kb.loop.getWrittenNameById(user.id, h));
  }

	/**
	 * Save's the player's game state
	 * @param {string} state
	 */
  async saveState (state: string): Promise<void> {
    const userNode = await this.getUserNode();
    userNode.data = { state };
    await PromiseUtils.promisify(h => userNode.save(h));
  }

	/**
	 * Load player's game state
	 * @return {Promise<string>}
	 */
  async loadState (): Promise<string> {
    const userNode = await this.getUserNode();
    return userNode.data.state;
  }

}

export const kbModel = new KBModel();
