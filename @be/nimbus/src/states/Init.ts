import jibo = require('jibo');
import { Nimbus } from '../Nimbus';
import { Dataflow } from '../common/Types';
import { libraries, utils } from '@be/be-framework';

export import State = libraries.jibo_state_machine.State;
type StateMachine = libraries.jibo_state_machine.StateMachine;
type Transition = libraries.jibo_state_machine.Transition;

/**
 * @internal
 */
export class InitState extends libraries.jibo_state_machine.State {

    constructor(sm: StateMachine, private nimbus: Nimbus, name: string) {
        super(sm, name);

        this.onEntry = async (transition: Transition, data: Dataflow): Promise<Dataflow> => {

            // Placeholder for any other initialization we decide we need

            return data;
        };
    }
}
