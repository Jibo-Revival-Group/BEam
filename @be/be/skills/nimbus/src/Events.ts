import { Event, EventContainer } from 'jibo-typed-events';


export class IncomingEvents extends EventContainer {
  cloudSkillResult = new Event(`Cloud Skill Result`);

  constructor() {
    super();
  }
}