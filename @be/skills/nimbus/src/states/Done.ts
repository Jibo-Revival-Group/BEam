import { libraries } from '@be/be-framework';
const { State } = libraries.jibo_state_machine;
const { PromiseUtils, RandomUtils } = libraries.jibo_cai_utils;

type StateMachine = libraries.jibo_state_machine.StateMachine;
type Transition = libraries.jibo_state_machine.Transition;


/**
 * @internal
 */
export class DoneState extends State {

    constructor(sm: StateMachine) {
        super(sm, 'Done');

        this.onEntry = () => {
            this.sm.stop();
        };
    }
}