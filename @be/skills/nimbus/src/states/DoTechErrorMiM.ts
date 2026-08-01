import { Nimbus } from '../Nimbus';
import { DoCloudActionState } from './DoCloudAction';
import { libraries } from '@be/be-framework';
const { State } = libraries.jibo_state_machine;

type StateMachine = libraries.jibo_state_machine.StateMachine;

export class DoTechErrorMiMState extends DoCloudActionState {

    constructor(sm: StateMachine, nimbus: Nimbus, name: string) {
        super(sm, nimbus, name, 'mims/CloudSkillError.mim');
    }
}
