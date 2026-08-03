import { Nimbus } from '../Nimbus';
import { libraries } from '@be/be-framework';
import { Dataflow } from '../common/Types';
export import State = libraries.jibo_state_machine.State;
const { PromiseUtils, RandomUtils } = libraries.jibo_cai_utils;

type StateMachine = libraries.jibo_state_machine.StateMachine;
type Transition = libraries.jibo_state_machine.Transition;

/**
 * @internal
 */
export class OuterInitState extends State {

    protected _successState: State;
    protected _errorState: State;

    constructor(sm: StateMachine, private nimbus: Nimbus, private coreSM: StateMachine, name: string, private transitionNames = ['Success', 'Error']) {
        super(sm, name);
        this.onStop = () => {
            return this.coreSM.stop();
        };
    }

    installTransitions(successState: State, errorState: State) {
        this._successState = successState;
        this._errorState = errorState;
        this.addInternalTransition(this.transitionNames[0], this._successState);
        this.addInternalTransition(this.transitionNames[1], this._errorState);
    }

    onEntry = (transition: Transition, data: Dataflow) => {
        this.coreSM.start(data)
            .then(error => {
                if (error) {
                    this.handleError(error, data);
                } else {
                    if (this.isCurrent()) {
                        this.transitionTo(this._successState, data);
                    }
                }
            })
            .catch(error => {
                this.handleError(error, data);
            });
    }

    handleError(error: Error, data: Dataflow) {
        this.nimbus.log.warn('Error in Core Nimbus Logic: ', error);
        this.nimbus.log.warn('Proceeding to fallback error MiM');
        this.nimbus.log.debug(this.coreSM.traceToString());
        if (this.isCurrent()) {
            this.transitionTo(this._errorState, data);
        }
    }
}