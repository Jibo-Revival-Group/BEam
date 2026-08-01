import jibo = require('jibo');
import { libraries, utils } from '@be/be-framework';
import { Nimbus } from '../Nimbus';
import { Dataflow } from '../common/Types';
import { DoneState } from './Done';

import cu = libraries.jibo_cai_utils;

export import State = libraries.jibo_state_machine.State;
type StateMachine = libraries.jibo_state_machine.StateMachine;
type Transition = libraries.jibo_state_machine.Transition;

/**
 * @internal
 */
export class WaitForAdditionalState extends State {

    protected _completeState: DoneState;

    private stopped = false;
    private redirectTimer: any;

    constructor(sm: StateMachine, private nimbus: Nimbus, name: string, private transitionNames = ['Complete']) {
        super(sm, name);

        this.onEntry = async (transition: Transition, data: Dataflow) => {
            this.stopped = false;
            this.redirectTimer = null;
            try {
                const turnResult = await this.nimbus.getNextAction();
                if (turnResult && !this.stopped) {
                    this.nimbus.redirect('@be/nimbus', turnResult);
                    this.redirectTimer = this.nimbus.jibo.timer.setTimeout(() => {
                        this.nimbus.log.warn('Nimbus self-redirect likely failed, exit Nimbus');
                        this.transitionTo(this._completeState, data);
                    }, 5000);
                } else {
                    this.transitionTo(this._completeState, data);
                }
            } catch (error) {
                this.nimbus.log.warn('Next action could not retrieved, abandoning wait', error);
                this.transitionTo(this._completeState, data);
            }
        };

        this.onStop = () => {
            this.stopped = true;
            if (this.redirectTimer) {
                this.nimbus.jibo.timer.clearTimeout(this.redirectTimer);
            }
        };
    }

    installTransitions(completeState: DoneState) {
        this._completeState = completeState;
        this.addInternalTransition(this.transitionNames[0], this._completeState);
    }
}
