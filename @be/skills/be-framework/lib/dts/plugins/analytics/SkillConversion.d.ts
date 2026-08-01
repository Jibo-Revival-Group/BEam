export declare const SkillRename: {
    'tutorial': string;
    'friendly-tips': string;
    'create': string;
};
export declare const IntentDefaults: {
    'idle': string;
    'surprises': string;
    'surprises-date': string;
    'surprises-ota': string;
    'first-contact': string;
    'main-menu': string;
    'restore': string;
    'bot-basics': string;
};
export declare const IntentRename: {
    'chitchat': {
        'scripted': string;
        'gqa': string;
        'emotionQuery': string;
        'specificEmotionQuery': string;
    };
    'circuit-saver': {
        'launchGame': string;
        'menu': string;
    };
    'clock': {
        'askForTime': string;
        'askForDay': string;
        'askForDate': string;
        'whenIsHoliday': string;
        'whenIsBirthday': string;
    };
    'photos': {
        'createOnePhoto': string;
        'createSomePhotos': string;
    };
    'what-can-you-do': {
        'whatCanIDo': string;
        'frustrated': string;
    };
    'gallery': {
        'galleryOpen': string;
    };
    'greetings': {
        'whatsUp': string;
        'goodMorning': string;
        'goodAfternoon': string;
        'goodEvening': string;
        'goodNight': string;
        'goodBye': string;
        'imHome': string;
        'imBack': string;
        'selfId': string;
    };
    'settings': {
        'battery': string;
        'volumeQuery': string;
        'wifiStatus': string;
        'wifiAddNetwork': string;
        'wifiRemoveNetwork': string;
        'menu': string;
    };
    'bot-basics': {
        'tutorialOpen': string;
        'menu': string;
    };
    'introductions': {
        'enrollment': string;
        'menu': string;
    };
};
export declare function renameSkill(skillName: string): string;
export declare function getIntent(skill: string, launchData: any, prevSkill: string): any;
