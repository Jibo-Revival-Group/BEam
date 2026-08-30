(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.beidle = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={"queries":[
		{
			"query": {
				"category": "ib",
				"includeMeta": [],
				"includeSomeMeta": [],
				"excludeMeta": ["seasonal", "shift", "shift-left", "shift-right", "postural-shift"]
				},
			"startDate": "2016-8-29",
			"endDate": "2100-11-29",
			"weight": 15
		},

		{
			"query": {
				"category": "ib",
				"includeMeta": [],
				"includeSomeMeta": ["shift", "shift-left", "shift-right", "postural-shift"],
				"excludeMeta": []
				},
			"startDate": "2016-8-29",
			"endDate": "2100-11-29",
			"weight": 6
		},

		{
		"query": {
			"category": "emoji",
			"includeMeta": ["flower"],
			"includeSomeMeta": [],
			"excludeMeta": ["hot-frame"]
			},
		"startDate": "2018-3-15",
		"endDate": "2018-5-31",
		"weight": 1
		},

		{
		"query": {
			"category": "emoji",
			"includeMeta": ["stork"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-5-13",
		"endDate": "2018-5-13",
		"weight": 2,
		"holiday": ["Mother's Day"]
		},

		{
		"query": {
			"category": "emoji",
			"includeMeta": ["ramadan-lantern"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-5-16",
		"endDate": "2018-6-13",
		"weight": 0.3,
		"holiday": ["Ramadan"]
		},

		{
		"query": {
			"category": "emoji",
			"includeMeta": ["american-flag"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-5-28",
		"endDate": "2018-5-28",
		"weight": 1,
		"holiday": ["Memorial Day"]
		},

		{
		"query": {
			"category": "jiboji",
			"includeMeta": ["beach-ball"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-6-15",
		"endDate": "2018-8-31",
		"weight": 0.3
		}

	]
}

},{}],2:[function(require,module,exports){
module.exports={"queries":[
		{
		"query": {
			"category": "ib",
			"includeMeta": [],
			"includeSomeMeta": [],
			"excludeMeta": ["seasonal", "shift", "shift-left", "shift-right", "postural-shift"]
			},
		"startDate": "2016-8-29",
		"endDate": "2100-11-29",
		"weight": 15
		},

		{
		"query": {
			"category": "emoji",
			"includeMeta": ["flower"],
			"includeSomeMeta": [],
			"excludeMeta": ["hot-frame"]
			},
		"startDate": "2018-3-15",
		"endDate": "2018-5-31",
		"weight": 1
		},

		{
		"query": {
			"category": "ib",
			"includeMeta": ["sunflower"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-4-15",
		"endDate": "2018-8-31",
		"weight": 0.2
		},

		{
		"query": {
			"category": "ib",
			"includeMeta": ["flower-bouquet"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-5-13",
		"endDate": "2018-5-13",
		"weight": 2,
		"holiday": ["Mother's Day"]
		},

		{
		"query": {
			"category": "emoji",
			"includeMeta": ["stork"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-5-13",
		"endDate": "2018-5-13",
		"weight": 2,
		"holiday": ["Mother's Day"]
		},

		{
		"query": {
			"category": "ib",
			"includeMeta": ["derby-hat"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-5-19",
		"endDate": "2018-5-19",
		"weight": 0.5
		},

		{
		"query": {
			"category": "ib",
			"includeMeta": ["derby-hat"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-6-9",
		"endDate": "2018-6-9",
		"weight": 0.5
		},

		{
		"query": {
			"category": "ib",
			"includeMeta": ["racecar"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-5-27",
		"endDate": "2018-5-27",
		"weight": 1
		},

		{
		"query": {
			"category": "emoji",
			"includeMeta": ["ramadan-lantern"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-5-16",
		"endDate": "2018-6-13",
		"weight": 0.3,
		"holiday": ["Ramadan"]
		},

		{
		"query": {
			"category": "emoji",
			"includeMeta": ["american-flag"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-5-28",
		"endDate": "2018-5-28",
		"weight": 1,
		"holiday": ["Memorial Day"]
		},

		{
		"query": {
			"category": "jiboji",
			"includeMeta": ["soccer-shoot"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-6-14",
		"endDate": "2018-7-15",
		"weight": 0.2
		},

		{
		"query": {
			"category": "jiboji",
			"includeMeta": ["beach-ball"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-6-15",
		"endDate": "2018-8-31",
		"weight": 0.1
		},

		{
		"query": {
			"category": "jiboji",
			"includeMeta": ["necktie"],
			"includeSomeMeta": [],
			"excludeMeta": []
			},
		"startDate": "2018-6-17",
		"endDate": "2018-6-17",
		"weight": 0.3,
		"holiday": ["Father's Day"]
		}

	]
}

},{}],3:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['a9e603e4-5235-42d1-89f8-5bb4130322b9'],
            'options': {}
        },
        'meta': { 'version': 1 },
        'a9e603e4-5235-42d1-89f8-5bb4130322b9': {
            'id': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Random',
            'children': [
                '395a8fc2-250d-43bf-b36d-c9e2a90dd393',
                '0504475c-f9d6-4646-bd12-a17c48ef7d00',
                '4bbc7049-cbf0-494e-a2e1-b5ddea0a886d'
            ],
            'options': {}
        },
        '395a8fc2-250d-43bf-b36d-c9e2a90dd393': function () {
            return {
                'id': '395a8fc2-250d-43bf-b36d-c9e2a90dd393',
                'name': 'normal',
                'parent': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Blinks/Eye_Blink_01_01.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'eye_blink_01',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '0504475c-f9d6-4646-bd12-a17c48ef7d00': function () {
            return {
                'id': '0504475c-f9d6-4646-bd12-a17c48ef7d00',
                'name': 'double',
                'parent': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Blinks/Eye_Double_Blink_03_01.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'eye_double_blink_03',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '4bbc7049-cbf0-494e-a2e1-b5ddea0a886d': function () {
            return {
                'id': '4bbc7049-cbf0-494e-a2e1-b5ddea0a886d',
                'name': 'quick',
                'parent': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Blinks/Eye_Quick_Blink_01_01.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'eye_quick_blink_01',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{}],4:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['736ad3a8-b561-4af6-a1ed-8b419c50f271'],
            'options': {}
        },
        'meta': { 'version': 1 },
        'a9e603e4-5235-42d1-89f8-5bb4130322b9': {
            'id': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
            'parent': '736ad3a8-b561-4af6-a1ed-8b419c50f271',
            'asset-pack': 'core',
            'class': 'Random',
            'children': [
                '395a8fc2-250d-43bf-b36d-c9e2a90dd393',
                '0504475c-f9d6-4646-bd12-a17c48ef7d00',
                '66ae4b21-9ec8-43e6-a0c9-097773110427'
            ],
            'options': {}
        },
        '395a8fc2-250d-43bf-b36d-c9e2a90dd393': function () {
            return {
                'id': '395a8fc2-250d-43bf-b36d-c9e2a90dd393',
                'name': 'confused_04',
                'parent': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Emotions/Confused/Confused_04-nm.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'confused_04_nm',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '0504475c-f9d6-4646-bd12-a17c48ef7d00': function () {
            return {
                'id': '0504475c-f9d6-4646-bd12-a17c48ef7d00',
                'name': 'confused_05',
                'parent': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Emotions/Confused/Confused_05-nm.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'confused_05_nm',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '66ae4b21-9ec8-43e6-a0c9-097773110427': function () {
            return {
                'id': '66ae4b21-9ec8-43e6-a0c9-097773110427',
                'name': 'confused_07',
                'parent': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Emotions/Confused/Confused_07-nm.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'confused_07_nm',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '736ad3a8-b561-4af6-a1ed-8b419c50f271': {
            'id': '736ad3a8-b561-4af6-a1ed-8b419c50f271',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Parallel',
            'children': [
                '0cf233d4-2c1b-4e49-b8a7-1b41bb3cda32',
                'a9e603e4-5235-42d1-89f8-5bb4130322b9'
            ],
            'options': { 'succeedOnOne': false }
        },
        '0cf233d4-2c1b-4e49-b8a7-1b41bb3cda32': function () {
            return {
                'id': '0cf233d4-2c1b-4e49-b8a7-1b41bb3cda32',
                'name': '1500ms wait',
                'parent': '736ad3a8-b561-4af6-a1ed-8b419c50f271',
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return 1500;
                    }
                }
            };
        }
    };
};
},{}],5:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['7194742f-c353-43be-9179-449be1b99dea'],
            'options': {}
        },
        'meta': { 'version': 1 },
        'n1': function () {
            return {
                'id': 'n1',
                'parent': '7194742f-c353-43be-9179-449be1b99dea',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Glances/Right/Glance_Right_01_01.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'glance_right_01',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        'n13': function () {
            return {
                'id': 'n13',
                'parent': '7194742f-c353-43be-9179-449be1b99dea',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Glances/Left/Glance_Left_01_01.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'glance_left_01',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        'n14': function () {
            return {
                'id': 'n14',
                'parent': '7194742f-c353-43be-9179-449be1b99dea',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Glances/Down/Glance_Down_01_01.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'glance_down_01',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '7194742f-c353-43be-9179-449be1b99dea': {
            'id': '7194742f-c353-43be-9179-449be1b99dea',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Random',
            'children': [
                'n14',
                'n13',
                'n1'
            ],
            'options': {}
        }
    };
};
},{}],6:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['75c4ad73-1b02-4922-b697-a1958c914859'],
            'options': {}
        },
        'meta': { 'version': 1 },
        'a9e603e4-5235-42d1-89f8-5bb4130322b9': {
            'id': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
            'parent': '75c4ad73-1b02-4922-b697-a1958c914859',
            'asset-pack': 'core',
            'class': 'Random',
            'children': [
                '395a8fc2-250d-43bf-b36d-c9e2a90dd393',
                'c95257c4-3124-40b7-bf55-313429c3b5f3',
                '5910c515-f209-4f92-a6dd-dfb5697839af'
            ],
            'options': {}
        },
        '395a8fc2-250d-43bf-b36d-c9e2a90dd393': function () {
            return {
                'id': '395a8fc2-250d-43bf-b36d-c9e2a90dd393',
                'name': 'reset - bellyroll',
                'parent': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Global_Motions/Body_Motions/Belly_Roll_01.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'belly_roll_01',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        'c95257c4-3124-40b7-bf55-313429c3b5f3': function () {
            return {
                'id': 'c95257c4-3124-40b7-bf55-313429c3b5f3',
                'name': 'reset - postural shift 5',
                'parent': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Shifts/Shift_05_01.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'shift_05',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '5910c515-f209-4f92-a6dd-dfb5697839af': function () {
            return {
                'id': '5910c515-f209-4f92-a6dd-dfb5697839af',
                'name': 'reset - postural shift 4',
                'parent': 'a9e603e4-5235-42d1-89f8-5bb4130322b9',
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'jibo-anim-db-animations://Shifts/Shift_04_01.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animSelector': 3,
                    'animName': 'shift_04',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '75c4ad73-1b02-4922-b697-a1958c914859': {
            'id': '75c4ad73-1b02-4922-b697-a1958c914859',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Parallel',
            'children': ['a9e603e4-5235-42d1-89f8-5bb4130322b9'],
            'options': { 'succeedOnOne': false }
        }
    };
};
},{}],7:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['8e3f8d63-77ac-413f-9784-6694bcaed837'],
            'options': {}
        },
        'meta': { 'version': 1 },
        '8e3f8d63-77ac-413f-9784-6694bcaed837': function () {
            return {
                'id': '8e3f8d63-77ac-413f-9784-6694bcaed837',
                'name': 'Eye buzz + nomatch sfx',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 3,
                    'animPath': 'jibo-anim-db-animations://Eye-Globals/no-match-eye.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animName': 'no-match-eye',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{}],8:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'blink',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/idle/src/flows/global/blink.flow'
        },
        '4ad28cd0-9428-4047-b2a9-27288fe81da9': function () {
            return {
                'id': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                        'to': '60cdd4a9-e67b-47e5-b4e6-b9ca65019d80',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1': function () {
            return {
                'id': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '60cdd4a9-e67b-47e5-b4e6-b9ca65019d80': function () {
            return {
                'id': '60cdd4a9-e67b-47e5-b4e6-b9ca65019d80',
                'name': 'blink',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '60cdd4a9-e67b-47e5-b4e6-b9ca65019d80',
                        'to': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subtree',
                'options': {
                    'behaviorPath': () => {
                        return require('../../behaviors/global/blink');
                    },
                    'getNotepad': () => {
                        return {};
                    },
                    'onResult': treeResult => {
                        return treeResult.transition;
                    }
                }
            };
        }
    };
};
},{"../../behaviors/global/blink":3}],9:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'confused-nomatch',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/idle/src/flows/nomatch/confused-nomatch.flow'
        },
        '4ad28cd0-9428-4047-b2a9-27288fe81da9': function () {
            return {
                'id': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                        'to': '3c4441cd-2b98-4f5e-a6a8-a9e08ca174b8',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1': function () {
            return {
                'id': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '3c4441cd-2b98-4f5e-a6a8-a9e08ca174b8': function () {
            return {
                'id': '3c4441cd-2b98-4f5e-a6a8-a9e08ca174b8',
                'name': 'confused-nomatch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3c4441cd-2b98-4f5e-a6a8-a9e08ca174b8',
                        'to': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subtree',
                'options': {
                    'behaviorPath': () => {
                        return require('../../behaviors/nomatch/confused-nomatch');
                    },
                    'getNotepad': () => {
                        return {};
                    },
                    'onResult': treeResult => {
                        return treeResult.transition;
                    }
                }
            };
        }
    };
};
},{"../../behaviors/nomatch/confused-nomatch":4}],10:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'glances-nomatch',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/idle/src/flows/nomatch/glances-nomatch.flow'
        },
        '4ad28cd0-9428-4047-b2a9-27288fe81da9': function () {
            return {
                'id': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                        'to': '63ad26ab-bcf7-45a6-9d2f-6fe0b1baceac',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1': function () {
            return {
                'id': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '63ad26ab-bcf7-45a6-9d2f-6fe0b1baceac': function () {
            return {
                'id': '63ad26ab-bcf7-45a6-9d2f-6fe0b1baceac',
                'name': 'glances-nomatch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '63ad26ab-bcf7-45a6-9d2f-6fe0b1baceac',
                        'to': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subtree',
                'options': {
                    'behaviorPath': () => {
                        return require('../../behaviors/nomatch/glances-nomatch');
                    },
                    'getNotepad': () => {
                        return {};
                    },
                    'onResult': treeResult => {
                        return treeResult.transition;
                    }
                }
            };
        }
    };
};
},{"../../behaviors/nomatch/glances-nomatch":5}],11:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'reset-nomatch',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/idle/src/flows/nomatch/reset-nomatch.flow'
        },
        '4ad28cd0-9428-4047-b2a9-27288fe81da9': function () {
            return {
                'id': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                        'to': '60cdd4a9-e67b-47e5-b4e6-b9ca65019d80',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1': function () {
            return {
                'id': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '60cdd4a9-e67b-47e5-b4e6-b9ca65019d80': function () {
            return {
                'id': '60cdd4a9-e67b-47e5-b4e6-b9ca65019d80',
                'name': 'reset-nomatch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '60cdd4a9-e67b-47e5-b4e6-b9ca65019d80',
                        'to': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subtree',
                'options': {
                    'behaviorPath': () => {
                        return require('../../behaviors/nomatch/reset-nomatch');
                    },
                    'getNotepad': () => {
                        return {};
                    },
                    'onResult': treeResult => {
                        return treeResult.transition;
                    }
                }
            };
        }
    };
};
},{"../../behaviors/nomatch/reset-nomatch":6}],12:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'thinking-nomatch',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/idle/src/flows/nomatch/thinking-nomatch.flow'
        },
        '4ad28cd0-9428-4047-b2a9-27288fe81da9': function () {
            return {
                'id': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                        'to': '58354942-17e7-45d3-af57-83621fb34f1f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1': function () {
            return {
                'id': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '58354942-17e7-45d3-af57-83621fb34f1f': function () {
            return {
                'id': '58354942-17e7-45d3-af57-83621fb34f1f',
                'name': 'thinking-nomatch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '58354942-17e7-45d3-af57-83621fb34f1f',
                        'to': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subtree',
                'options': {
                    'behaviorPath': () => {
                        return require('../../behaviors/nomatch/thinking-nomatch');
                    },
                    'getNotepad': () => {
                        return {};
                    },
                    'onResult': treeResult => {
                        return treeResult.transition;
                    }
                }
            };
        }
    };
};
},{"../../behaviors/nomatch/thinking-nomatch":7}],13:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'verbal-nomatch',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/idle/src/flows/nomatch/verbal-nomatch.flow'
        },
        '4ad28cd0-9428-4047-b2a9-27288fe81da9': function () {
            return {
                'id': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                        'to': 'f51c207f-7a9e-4382-8f13-4dbdb0e32443',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1': function () {
            return {
                'id': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        'f51c207f-7a9e-4382-8f13-4dbdb0e32443': function () {
            return {
                'id': 'f51c207f-7a9e-4382-8f13-4dbdb0e32443',
                'name': 'Idle NM Explanation',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f51c207f-7a9e-4382-8f13-4dbdb0e32443',
                        'to': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/IdleNMExplanation.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{}],14:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'turnAway',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/idle/src/flows/turnAway.flow'
        },
        '4ad28cd0-9428-4047-b2a9-27288fe81da9': function () {
            return {
                'id': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                        'to': '7c46fc22-9438-4e7c-9761-c09619af6187',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1': function () {
            return {
                'id': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '7c46fc22-9438-4e7c-9761-c09619af6187': function () {
            return {
                'id': '7c46fc22-9438-4e7c-9761-c09619af6187',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7c46fc22-9438-4e7c-9761-c09619af6187',
                        'to': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': '7c46fc22-9438-4e7c-9761-c09619af6187',
                        'to': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim',
                'options': {
                    'getMimPath': () => {
                        return blackboard.mimPath;
                    },
                    'getPromptData': () => {
                        return blackboard.promptData;
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': _results => {
                        blackboard.result = _results;
                    },
                    'onFailure': _results => {
                        blackboard.result = _results;
                    }
                }
            };
        }
    };
};
},{}],15:[function(require,module,exports){
module.exports = require("./main");

},{"./main":24}],16:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
class CancelableQueue {
    constructor() {
        this.prQueue = new be_framework_1.libraries.jibo_cai_utils.PromiseQueue();
        this.current = null;
    }
    add(element) {
        if (this.current && this.current.cancelWhenNewAdded) {
            this.current.cancel();
        }
        this.prQueue.add(() => __awaiter(this, void 0, void 0, function* () {
            this.current = element;
            try {
                yield this.current.promiseGenerator();
            }
            finally {
                this.current = null;
            }
        }));
    }
    waitUntilEmpty() {
        this.prQueue.waitUntilEmpty().catch(error => {
            console.error('CancelableQueue', error);
        });
    }
    clear() {
        this.prQueue.clear();
        if (this.current) {
            this.current.cancel();
        }
        this.current = null;
    }
    stop() {
        this.clear();
    }
}
exports.CancelableQueue = CancelableQueue;

},{"@be/be-framework":undefined}],17:[function(require,module,exports){
(function (global){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
var Orientation = jibo.animDB.Orientation;
const jibo_common_types_1 = require("jibo-common-types");
const CancelableQueue_1 = require("./CancelableQueue");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
const _ = require("lodash/lodash.min");
const promisify = cu.PromiseUtils.promisify;
const timeout = cu.PromiseUtils.timeout;
const long_idle_queries = require('../../config/idle_animation_long_time_config.json');
const short_idle_queries = require('../../config/idle_animation_short_time_config.json');
var MusingType;
(function (MusingType) {
    MusingType["BIG"] = "BIG";
    MusingType["SMALL"] = "SMALL";
})(MusingType = exports.MusingType || (exports.MusingType = {}));
class AnimationElement {
    constructor(parent, animPlayOptions, cancelWhenNewAdded, visual = false) {
        this.parent = parent;
        this.animPlayOptions = animPlayOptions;
        this.cancelWhenNewAdded = cancelWhenNewAdded;
        this.visual = visual;
        this.animationHandle = null;
    }
    promiseGenerator() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            this.animationHandle = yield this.parent.playAnimDBAnimation(this.animPlayOptions);
            if (this.animationHandle) {
                yield this.animationHandle.promise;
                this.animationHandle = null;
                if (this.visual) {
                    jibo.analytics.track('Idle behavior', { idle_behavior_class: 'visual' });
                }
            }
        });
    }
    cancel() {
        if (this.animationHandle) {
            this.animationHandle.cancel();
            this.animationHandle = null;
        }
    }
}
class CenterScreenDofsElement {
    promiseGenerator() {
        return __awaiter(this, void 0, void 0, function* () {
            yield jibo.expression.centerRobot({
                dofs: jibo.expression.dofs.SCREEN
            });
        });
    }
    cancel() {
    }
}
class ForceEyeViewElement {
    constructor(idle) {
        this.idle = idle;
    }
    promiseGenerator() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.idle.forceEyeView();
        });
    }
    cancel() {
    }
}
class OpenMenuElement {
    constructor(parent) {
        this.parent = parent;
    }
    promiseGenerator() {
        return __awaiter(this, void 0, void 0, function* () {
            this.parent.parent.parent.redirect('@be/main-menu', { intent: 'tap' });
        });
    }
    cancel() {
    }
}
class RampBrightnessElement {
    constructor(goal, skill) {
        this.goal = goal;
        this.skill = skill;
    }
    promiseGenerator() {
        return __awaiter(this, void 0, void 0, function* () {
            this.goal = Math.max(Math.min(this.goal, CircadianExpression.SCREEN_BRIGHTNESS_AWAKE), CircadianExpression.SCREEN_BRIGHTNESS_ASLEEP);
            let currentBacklight;
            try {
                currentBacklight = yield timeout(promisify(cb => jibo.system.getBacklight(cb)), 1000);
            }
            catch (error) {
                this.skill.log.error('Could not get current backlight value. Not setting backlight: ', error);
                throw error;
            }
            currentBacklight = Math.floor(currentBacklight * 10) / 10;
            this.skill.log.info(`Attempting to change brightness from ${currentBacklight} to ${this.goal}.`);
            const increment = (currentBacklight > this.goal) ? -0.1 : 0.1;
            const iterations = Math.round(Math.abs((this.goal - currentBacklight) / increment));
            for (let i = 1; i <= iterations; i++) {
                const val = Number((currentBacklight + i * increment).toFixed(1));
                try {
                    yield timeout(promisify(cb => jibo.system.setBacklight(val, cb)), 1000);
                }
                catch (error) {
                    this.skill.log.warn(`Timeout while setting brightness to ${val}`);
                }
                this.skill.log.debug(`Brightness set to ${val}.`);
            }
        });
    }
    cancel() {
    }
}
class CircadianExpression {
    constructor(parent) {
        this.parent = parent;
        this.cancellableQueue = new CancelableQueue_1.CancelableQueue();
        this.transitionAnimMap = new Map();
        this.disturbedTransitionAnimMap = new Map();
        this.weightedIdleQueries = [];
        this.skill = this.parent.parent;
        this.defaultIdleQuery = {
            category: 'ib',
            includeMeta: ['ib-drive-playful'],
            includeSomeMeta: [],
            excludeMeta: []
        };
        this.transitionSetup();
    }
    queueAnimation(animPlayOptions, cancelWhenNewAdded) {
        this.cancellableQueue.add(new AnimationElement(this, animPlayOptions, cancelWhenNewAdded));
    }
    clearAnimationQueue() {
        this.skill.log.info("Clearing animation queue.");
        this.cancellableQueue.clear();
    }
    emptyAnimationQueue() {
        this.cancellableQueue.waitUntilEmpty();
    }
    playAnimDBAnimation(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = options.query;
            let animation;
            let queryCategories = [];
            if (options.name) {
                animation = jibo.animDB.getAnimByName(options.name);
                queryCategories.push("Named");
            }
            else if (query) {
                const animRes = jibo.animDB.query(query);
                animation = _.sample(animRes.matching);
                if (query.category) {
                    queryCategories.push(query.category);
                }
                else if (query.categories) {
                    queryCategories.push(...queryCategories);
                }
                else {
                    queryCategories.push('NoCategory');
                }
            }
            else {
                this.skill.log.error("Attempted to play animation with incompatible AnimPlayOptions.");
                return;
            }
            if (animation) {
                const animConfig = {
                    cache: be_framework_1.libraries.jibo_cai_utils.CacheUtils.GlobalCacheName
                };
                if (options.randomOrientation) {
                    animConfig.orientation = (Math.random() > 0.5) ? Orientation.LEFT : Orientation.RIGHT;
                }
                let debugMsg = `Playing '${queryCategories}' animation '${animation.name}'`;
                if (animConfig.orientation) {
                    debugMsg += ` with orientation '${Orientation[animConfig.orientation]}'`;
                }
                this.skill.log.debug(debugMsg);
                if (typeof options.loops === 'number') {
                    animConfig.loops = options.loops;
                }
                if (options.eyeOnly) {
                    animConfig.mutes = { AUDIO: false, SCREEN: true, BODY: false };
                }
                else if (options.muteAudio) {
                    animConfig.mutes = { AUDIO: false, SCREEN: true, BODY: true };
                }
                const playback = yield animation.createFromConfig(animConfig);
                const animationHandle = {
                    promise: playback.play(),
                    cancel: () => playback.stop()
                };
                return animationHandle;
            }
            else {
                this.skill.log.warn(`Couldn't find any animations for options: ${JSON.stringify(options)}`);
            }
        });
    }
    playAnimationByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const animPlayOptions = {
                query: null,
                name: name,
                randomOrientation: false,
                muteAudio: false,
            };
            return this.playAnimDBAnimation(animPlayOptions);
        });
    }
    queueAnimationsForTransition(transition) {
        const sourceState = this.replaceInternalTransitions(transition.getSourceState());
        const destinationState = jibo_common_types_1.CircadianState[transition.getDestinationState().name];
        if (!destinationState) {
            this.skill.log.error(`Queue animations called for invalid transitions ${sourceState} and ${destinationState}`);
            return;
        }
        let transitions = this.transitionAnimMap.get(sourceState);
        if (!transitions) {
            this.skill.log.debug(`Circadian Expressions has no transition between ${sourceState} and ${destinationState}`);
            if (sourceState === jibo_common_types_1.CircadianState.HJ_NO_MATCH) {
                this.skill.log.info('Adding ForceEyeView element to queue to handle HJNoMatch global interruption.');
                this.cancellableQueue.add(new ForceEyeViewElement(this.skill));
            }
            return;
        }
        if (this.shouldClearAnimationQueue(transition)) {
            this.clearAnimationQueue();
        }
        if (!this.transitionHasExternalAnimation(transition)) {
            if (this.isDisturbedTransition(transition)) {
                const disturbedTransitions = this.disturbedTransitionAnimMap.get(sourceState);
                if (disturbedTransitions && disturbedTransitions.get(destinationState)) {
                    this.skill.log.info("Alternate transition found for environmental disturbance.");
                    transitions = disturbedTransitions;
                }
            }
            const transitionAnimations = transitions.get(destinationState);
            if (transitionAnimations && transitionAnimations.length > 0) {
                transitionAnimations.forEach((value) => {
                    if (value.animPlayOptions) {
                        const cancelWhenNewAdded = (value.animPlayOptions.loops === 0);
                        this.queueAnimation(value.animPlayOptions, cancelWhenNewAdded);
                    }
                    if (typeof value.brightnessGoal === 'number') {
                        this.createRampBrightnessElement(value.brightnessGoal);
                    }
                });
            }
            else {
                this.skill.log.info(`No transitions between ${sourceState} and ${destinationState}`);
            }
            if (this.transitionCausedByScreenTouch(transition)) {
                this.cancellableQueue.add(new OpenMenuElement(this));
            }
            if (destinationState === jibo_common_types_1.CircadianState.ALERT) {
                this.cancellableQueue.add(new CenterScreenDofsElement());
            }
            this.emptyAnimationQueue();
        }
        else {
            this.skill.log.info(`Transition should trigger external animation, not queueing any animations between ${sourceState} and ${destinationState}.`);
        }
        if (destinationState === jibo_common_types_1.CircadianState.ALERT || destinationState === jibo_common_types_1.CircadianState.RELAXED) {
            this.restoreScreenBrightness()
                .then(() => this.skill.log.info(`Brightness set to ${CircadianExpression.SCREEN_BRIGHTNESS_AWAKE}.`))
                .catch((error) => this.skill.log.error('Could not restore backlight: ', error));
        }
    }
    restoreScreenBrightness() {
        return promisify(cb => jibo.system.setBacklight(CircadianExpression.SCREEN_BRIGHTNESS_AWAKE, cb));
    }
    isDisturbedTransition(transition) {
        return (transition.name === "TEvent: " + this.parent.circadianSM.events.faceAppeared.name ||
            transition.name === "TEvent: " + this.parent.circadianSM.events.noise.name ||
            transition.name === "TEvent: " + this.parent.circadianSM.events.screenTouched.name);
    }
    transitionHasExternalAnimation(transition) {
        return (transition.name === "TEvent: " + this.parent.circadianSM.events.hjHeard.name);
    }
    transitionCausedByScreenTouch(transition) {
        return (transition.name === "TEvent: " + this.parent.circadianSM.events.screenTouched.name);
    }
    shouldClearAnimationQueue(transition) {
        let shouldClear = false;
        if (transition._isGlobal) {
            shouldClear = true;
        }
        return shouldClear;
    }
    replaceInternalTransitions(sourceState) {
        let replacementState = null;
        const sourceCircadianState = jibo_common_types_1.CircadianState[sourceState.name];
        if (sourceCircadianState) {
            if (sourceCircadianState === jibo_common_types_1.CircadianState.TIME_OF_DAY) {
                replacementState = jibo_common_types_1.CircadianState.ALERT;
            }
        }
        else {
            this.skill.log.error(`Unexpected transition. Replacing ${sourceState.name} with default ALERT.`);
            replacementState = jibo_common_types_1.CircadianState.ALERT;
        }
        if (replacementState) {
            this.skill.log.debug(`Replacing transition source state ${sourceState.name} with ${replacementState}`);
            return replacementState;
        }
        else {
            return sourceCircadianState;
        }
    }
    transitionSetup() {
        const alertMap = new Map();
        alertMap.set(jibo_common_types_1.CircadianState.ASLEEP, [relaxedToSleep, fadeToAsleep]);
        alertMap.set(jibo_common_types_1.CircadianState.FALLING_ASLEEP, [drift, napPose, fadeToNap, napNoLoop]);
        const relaxedMap = new Map();
        relaxedMap.set(jibo_common_types_1.CircadianState.ALERT, [relaxedToActive]);
        relaxedMap.set(jibo_common_types_1.CircadianState.DAYTIME_NAP, [relaxedToNap, napPose, fadeToNap, napLoop]);
        relaxedMap.set(jibo_common_types_1.CircadianState.FALLING_ASLEEP, [drift, yawn, napPose, fadeToNap, napNoLoop]);
        relaxedMap.set(jibo_common_types_1.CircadianState.ASLEEP, [relaxedToSleep, fadeToAsleep]);
        const napMap = new Map();
        napMap.set(jibo_common_types_1.CircadianState.ALERT, [napToAlert]);
        napMap.set(jibo_common_types_1.CircadianState.RELAXED, [napToRelaxed]);
        napMap.set(jibo_common_types_1.CircadianState.FALLING_ASLEEP, [napNoLoop]);
        napMap.set(jibo_common_types_1.CircadianState.ASLEEP, [fallingAsleep, fadeToAsleep]);
        const fallingAsleepMap = new Map();
        fallingAsleepMap.set(jibo_common_types_1.CircadianState.ALERT, [napToAlert]);
        fallingAsleepMap.set(jibo_common_types_1.CircadianState.ASLEEP, [fallingAsleep, fadeToAsleep]);
        const asleepMap = new Map();
        asleepMap.set(jibo_common_types_1.CircadianState.WAKING_UP, [fadeToNap, sleepToNap, napLoop]);
        asleepMap.set(jibo_common_types_1.CircadianState.ALERT, [sleepToAwake]);
        const wakingUpMap = new Map();
        wakingUpMap.set(jibo_common_types_1.CircadianState.ALERT, [napToAlert]);
        wakingUpMap.set(jibo_common_types_1.CircadianState.RELAXED, [napToRelaxed]);
        const intentMap = new Map();
        intentMap.set(jibo_common_types_1.CircadianState.ASLEEP, [relaxedToSleep, fadeToAsleep]);
        intentMap.set(jibo_common_types_1.CircadianState.TURN_AWAY, [lookAway, fadeToNap, lookAwayEye]);
        const turnAwayMap = new Map();
        turnAwayMap.set(jibo_common_types_1.CircadianState.RELAXED, [lookBackTowards]);
        turnAwayMap.set(jibo_common_types_1.CircadianState.ASLEEP, [fadeToAsleep]);
        this.transitionAnimMap.set(jibo_common_types_1.CircadianState.ALERT, alertMap);
        this.transitionAnimMap.set(jibo_common_types_1.CircadianState.RELAXED, relaxedMap);
        this.transitionAnimMap.set(jibo_common_types_1.CircadianState.DAYTIME_NAP, napMap);
        this.transitionAnimMap.set(jibo_common_types_1.CircadianState.FALLING_ASLEEP, fallingAsleepMap);
        this.transitionAnimMap.set(jibo_common_types_1.CircadianState.ASLEEP, asleepMap);
        this.transitionAnimMap.set(jibo_common_types_1.CircadianState.WAKING_UP, wakingUpMap);
        this.transitionAnimMap.set(jibo_common_types_1.CircadianState.SELECT_INTENT, intentMap);
        this.transitionAnimMap.set(jibo_common_types_1.CircadianState.TURN_AWAY, turnAwayMap);
        const wakingUpDisturbedMap = new Map();
        wakingUpDisturbedMap.set(jibo_common_types_1.CircadianState.RELAXED, [napDisturbedToRelaxed]);
        const napDisturbedMap = new Map();
        napDisturbedMap.set(jibo_common_types_1.CircadianState.RELAXED, [napDisturbedToRelaxed]);
        const asleepDisturbedMap = new Map();
        asleepDisturbedMap.set(jibo_common_types_1.CircadianState.ALERT, [napPose]);
        this.disturbedTransitionAnimMap.set(jibo_common_types_1.CircadianState.DAYTIME_NAP, napDisturbedMap);
        this.disturbedTransitionAnimMap.set(jibo_common_types_1.CircadianState.WAKING_UP, wakingUpDisturbedMap);
        this.disturbedTransitionAnimMap.set(jibo_common_types_1.CircadianState.ASLEEP, asleepDisturbedMap);
    }
    playBigMusing() {
        this.skill.log.info("Playing big musing.");
        this.playMusing(MusingType.BIG).catch(error => {
            this.skill.log.error('Could not play big musing: ', error);
        });
    }
    playSmallMusing() {
        this.skill.log.info("Playing small musing.");
        this.playMusing(MusingType.SMALL).catch(error => {
            this.skill.log.error('Could not play small musing: ', error);
        });
    }
    playMusing(type) {
        return __awaiter(this, void 0, void 0, function* () {
            let animQuery = yield this.filterAndSelectQuery(type);
            if (!animQuery || this.weightedIdleQueries.length === 0) {
                this.skill.log.warn("No idle query is applicable, using default query:" + JSON.stringify(this.defaultIdleQuery));
                animQuery = this.defaultIdleQuery;
            }
            else {
                this.skill.log.info("Randomly chosen idle animation query:" + JSON.stringify(animQuery));
            }
            const musingInclude = (type === MusingType.BIG) ? ['ib-idle-short-time'] : ['ib-idle-long-time'];
            if (!animQuery.includeMeta) {
                animQuery.includeMeta = musingInclude;
            }
            else {
                animQuery.includeMeta.push(...musingInclude);
            }
            const options = {
                query: animQuery,
                randomOrientation: false,
                muteAudio: true
            };
            const cancelWhenNewAdded = false;
            const visualAnimation = true;
            this.cancellableQueue.add(new AnimationElement(this, options, cancelWhenNewAdded, visualAnimation));
            this.emptyAnimationQueue();
        });
    }
    filterAndSelectQuery(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            const celebratedHolidays = yield be_framework_1.BeSkill.plugins.holiday.getActiveHolidaySet();
            const unfilteredQueries = (type === MusingType.BIG) ? short_idle_queries : long_idle_queries;
            const idleQueries = unfilteredQueries.queries.filter((idleQuery) => {
                if (idleQuery.holiday || idleQuery.notHoliday) {
                    if (!this.isValidForUserHolidays(idleQuery, celebratedHolidays)) {
                        return false;
                    }
                }
                const queryStartDate = be_framework_1.libraries.jibo_cai_utils.TimeUtils.dateFromString(idleQuery.startDate);
                const queryEndDate = be_framework_1.libraries.jibo_cai_utils.TimeUtils.dateFromString(idleQuery.endDate);
                if (queryStartDate && queryEndDate) {
                    return be_framework_1.libraries.jibo_cai_utils.TimeUtils.dateWithinInterval(queryStartDate, today, queryEndDate);
                }
                else {
                    this.skill.log.warn(`Malformed idle query found! ${JSON.stringify(idleQuery)}.`);
                    return false;
                }
            });
            this.skill.log.debug(`Read ${idleQueries.length} date-applicable queries from config file.`);
            this.weightedIdleQueries = idleQueries.map((idleQuery) => {
                return { data: idleQuery.query, weight: idleQuery.weight };
            });
            return _.cloneDeep(be_framework_1.libraries.jibo_cai_utils.RandomUtils.weightedRandomSample(this.weightedIdleQueries));
        });
    }
    isValidForUserHolidays(query, celebratedHolidays) {
        let celebratesDesiredHoliday = true;
        let doesNotCelebrateExcludedHoliday = true;
        if (query.holiday) {
            celebratesDesiredHoliday = query.holiday.some((holidayName) => {
                return celebratedHolidays.has(holidayName);
            });
        }
        if (query.notHoliday) {
            doesNotCelebrateExcludedHoliday = query.notHoliday.every((holidayName) => {
                return !celebratedHolidays.has(holidayName);
            });
        }
        return (celebratesDesiredHoliday && doesNotCelebrateExcludedHoliday);
    }
    createRampBrightnessElement(goal) {
        this.cancellableQueue.add(new RampBrightnessElement(goal, this.skill));
    }
}
CircadianExpression.SCREEN_BRIGHTNESS_AWAKE = 0.4;
CircadianExpression.SCREEN_BRIGHTNESS_NAP = 0.3;
CircadianExpression.SCREEN_BRIGHTNESS_ASLEEP = 0.1;
exports.CircadianExpression = CircadianExpression;
const yawn = {
    animPlayOptions: {
        query: {
            category: 'sleep',
            includeMeta: ['yawn']
        }
    }
};
const sleepToAwake = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['sleep-to-wake-to-relaxed-aware', 'transition']
        }
    }
};
const sleepDisturbedToAwake = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['sleep-to-wake-to-relaxed-aware', 'noise-heard', 'transition']
        }
    }
};
const sleepToNap = {
    animPlayOptions: {
        query: {
            includeMeta: ['sleep-to-nap']
        }
    }
};
const sleepLoop = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['sleep', 'breathing-eye']
        },
        loops: 0
    }
};
const sleepNoLoop = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['sleep', 'breathing-eye']
        }
    }
};
const relaxedToSleep = {
    animPlayOptions: {
        query: {
            includeMeta: ['relaxed-aware-to-sleep', 'transition']
        }
    }
};
const relaxedToNap = {
    animPlayOptions: {
        query: {
            includeMeta: ['relaxed-aware-to-nap', 'transition']
        },
        muteAudio: true
    }
};
const relaxedToActive = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['relaxed-aware-to-active-on-duty', 'transition']
        }
    }
};
const fallingAsleep = {
    animPlayOptions: {
        query: {
            includeMeta: ['nap-to-sleep', 'transition']
        }
    }
};
const drift = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['drifting']
        }
    }
};
const napPose = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['nap', 'pose']
        }
    }
};
const napToRelaxed = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['nap-to-wake-to-relaxed-aware', 'transition']
        }
    }
};
const napDisturbedToRelaxed = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['nap-to-wake-to-relaxed-aware', 'heard-noise', 'transition']
        }
    }
};
const napToAlert = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['nap-to-wake-to-idle', 'transition']
        }
    }
};
const napLoop = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['nap', 'breathing-eye']
        },
        loops: 0
    }
};
const napNoLoop = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['nap', 'breathing-eye']
        }
    }
};
const lookAway = {
    animPlayOptions: {
        query: {
            category: 'poses',
            includeMeta: ['look-back-down', 'body-only']
        }
    }
};
const lookAwayEye = {
    animPlayOptions: {
        query: {
            category: 'livability',
            includeMeta: ['sleep', 'breathing-eye']
        },
        eyeOnly: true
    }
};
const lookBackTowards = {
    animPlayOptions: {
        query: {
            category: 'poses',
            includeMeta: ['look-center-middle', 'body-only']
        }
    }
};
const fadeToAsleep = {
    brightnessGoal: CircadianExpression.SCREEN_BRIGHTNESS_ASLEEP
};
const fadeToNap = {
    brightnessGoal: CircadianExpression.SCREEN_BRIGHTNESS_NAP
};
if (global._idleTest) {
    global._idleTest.CircadianExpression = module.exports.CircadianExpression;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../config/idle_animation_long_time_config.json":1,"../../config/idle_animation_short_time_config.json":2,"./CancelableQueue":16,"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined,"lodash/lodash.min":undefined}],18:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const jibo_common_types_1 = require("jibo-common-types");
const CircadianStateMachine_1 = require("./CircadianStateMachine");
const CircadianExpression_1 = require("./CircadianExpression");
const TunableDebug_1 = require("./TunableDebug");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
const _ = require("lodash/lodash.min");
const ALERT_LED_COLOR = [1, 0, 0];
const RELAXED_LED_COLOR = [0.1, 0.4, 0.2];
const DAYTIME_NAP_LED_COLOR = [0.1, 0.1, 0.5];
const ASLEEP_LED_COLOR = [0.5, .1, 1.0];
const WAKING_UP_LED_COLOR = [0.5, 0.5, 0];
const FALLING_ASLEEP_LED_COLOR = [0.8, 0.5, 0.8];
const HJ_NO_MATCH_COLOR = [0.3, 0.5, 0.9];
const SOUND_WAKE_UP_DEVIATION = 2.5;
const ABSOLUTE_WAKE_SOUND_LEVEL = -30;
const SNUGGLE_INTERVAL = cu.TimeUtils.secondsToMs(1.0);
class CircadianManager {
    constructor(parent) {
        this.parent = parent;
        this.currentPoD = null;
        this.circadianExpression = new CircadianExpression_1.CircadianExpression(this);
        this.lastCircadianState = null;
        this.goToSleepHandlerBind = () => this.goToSleepHandler();
        this.headTouchHandlerBind = (data) => this.headTouchHandler(data);
        this.noiseHandlerBind = (data) => this.noiseHandler(data);
        this.faceHandlerBind = () => this.faceHandler();
        this.heyJiboHandlerBind = () => this.heyJiboHandler();
        this.plugStateChangedBind = () => this.plugStateChanged();
        this.wakeWithSound = true;
        this.wakeWithFace = true;
        this.wakeEventFusion = true;
        this.waitingForSound = false;
        this.waitingforFace = false;
        this.wakeFusionTime = null;
        this.fusionWindowMs = 10000;
        this.useLEDForDebug = false;
        this.lastReIndexTime = -1;
        this.nextReIndexTime = -1;
        this.lastSnuggleTime = -1;
        this.attentionHandle = null;
        this.atnModeQueue = new be_framework_1.libraries.jibo_cai_utils.PromiseQueue();
        this.circadianColorMap = new Map([
            [jibo_common_types_1.CircadianState.ALERT, ALERT_LED_COLOR],
            [jibo_common_types_1.CircadianState.RELAXED, RELAXED_LED_COLOR],
            [jibo_common_types_1.CircadianState.DAYTIME_NAP, DAYTIME_NAP_LED_COLOR],
            [jibo_common_types_1.CircadianState.ASLEEP, ASLEEP_LED_COLOR],
            [jibo_common_types_1.CircadianState.WAKING_UP, WAKING_UP_LED_COLOR],
            [jibo_common_types_1.CircadianState.FALLING_ASLEEP, FALLING_ASLEEP_LED_COLOR],
            [jibo_common_types_1.CircadianState.HJ_NO_MATCH, HJ_NO_MATCH_COLOR]
        ]);
        this.circadianSM = new CircadianStateMachine_1.CircadianStateMachine(this);
        this.circadianSM.init();
        TunableDebug_1.TunableDebug.setup(this);
    }
    resetCircadianStateMachine(circadianDurations) {
        this.circadianSM.destroy().catch(error => this.parent.log.error('Could not destory state machine: ', error));
        this.circadianSM = new CircadianStateMachine_1.CircadianStateMachine(this, circadianDurations);
        this.circadianSM.init();
    }
    checkCircadianStateChange() {
        const current = this.getCurrentCircadianState();
        if (current && current !== this.lastCircadianState) {
            this.parent.log.info(`State changed from ${this.lastCircadianState} to ${current}.`);
            jibo.performance.log("State Changed", `${this.lastCircadianState} to ${current}`);
            this.lastCircadianState = current;
            if (!this.isInternalState(current)) {
                jibo.action.setCurrentCircadianState(current);
                if (this.useLEDForDebug) {
                    const color = this.circadianColorMap.get(current);
                    color && jibo.expression.setLEDColor([color[0], color[1], color[2]]);
                }
            }
        }
    }
    getCurrentCircadianState() {
        const current = this.circadianSM.getCurrentState();
        const circadianState = jibo_common_types_1.CircadianState[current.name];
        if (!circadianState) {
            if (current === this.circadianSM.hjNoMatch) {
                return jibo_common_types_1.CircadianState.HJ_NO_MATCH;
            }
            else {
                this.parent.log.warn(`Unrecognized circadian state ${current.name}`);
            }
        }
        return circadianState;
    }
    currentlyAwake() {
        let awake = false;
        const state = this.circadianSM.getCurrentState();
        if (state) {
            const circadianState = jibo_common_types_1.CircadianState[state.name];
            awake = (circadianState === jibo_common_types_1.CircadianState.ALERT || circadianState === jibo_common_types_1.CircadianState.RELAXED);
        }
        return awake;
    }
    pushAttentionMode(attentionMode) {
        this.atnModeQueue.add(() => __awaiter(this, void 0, void 0, function* () {
            if (this.attentionHandle) {
                try {
                    yield this.attentionHandle.release();
                }
                catch (error) {
                    this.parent.log.error(`Failed to release attention handle while pushing mode:${attentionMode} with error: `, error);
                }
            }
            try {
                this.attentionHandle = yield jibo.expression.pushAttentionMode(attentionMode);
            }
            catch (error) {
                this.parent.log.error(`Failed to push new attention mode: ${attentionMode} with error: `, error);
            }
        }));
    }
    clearAttentionMode() {
        if (this.attentionHandle) {
            this.attentionHandle.release()
                .catch(error => this.parent.log.error('Attention handle release failed: ', error));
            this.attentionHandle = null;
        }
    }
    update() {
        const now = new Date();
        const newToD = cu.TimeUtils.getPartOfDay(now);
        if (!_.isEqual(newToD, this.currentPoD)) {
            this.currentPoD = newToD;
            if (this.currentPoD.basic === cu.PartOfDayBasic.MORNING && this.currentPoD.detail === cu.PartOfDayDetail.MID) {
                this.circadianSM.events.dayStarts.emit();
            }
            else if (this.currentPoD.basic === cu.PartOfDayBasic.NIGHT && this.currentPoD.detail === cu.PartOfDayDetail.EARLY) {
                this.circadianSM.events.nightStarts.emit();
            }
        }
        this.circadianSM.update();
    }
    screenWasTouched() {
        this.circadianSM.events.screenTouched.emit();
    }
    goToSleepHandler() {
        this.circadianSM.events.goToSleep.emit();
    }
    headTouchHandler(data) {
        this.parent.log.debug("headTouchHandler");
        const now = Date.now();
        if (this.getCurrentCircadianState() !== jibo_common_types_1.CircadianState.ALERT) {
            this.circadianSM.events.headTouch.emit();
        }
        else if (this.lastSnuggleTime === -1 || (now - this.lastSnuggleTime) > SNUGGLE_INTERVAL) {
            this.lastSnuggleTime = now;
            this.parent.log.info("Clearing animation queue due to snuggle.");
            this.circadianExpression.clearAnimationQueue();
            const query = jibo.emotion.reactToHeadTouch(data);
            if (query) {
                this.circadianExpression.playAnimDBAnimation({ query: query });
            }
            else {
                this.parent.log.warn("No animation given by head touch.");
            }
        }
        else {
            this.parent.log.info(`Ignoring snuggle events due to frequency. Can't snuggle more than once every ${SNUGGLE_INTERVAL}ms.`);
        }
    }
    noiseHandler(data) {
        const state = this.getCurrentCircadianState();
        if (state !== jibo_common_types_1.CircadianState.WAKING_UP && state !== jibo_common_types_1.CircadianState.DAYTIME_NAP) {
            return;
        }
        let emit = false;
        if (this.wakeWithSound) {
            this.parent.log.debug("noise handler");
            if (data.recentDeviationFromBaseline > SOUND_WAKE_UP_DEVIATION || data.recentMean > ABSOLUTE_WAKE_SOUND_LEVEL) {
                this.parent.log.debug(`Extreme Sound event. baseline-mean/stdev: ${data.baselineMean.toFixed(2)} / ${data.baselineStdDev.toFixed(2)} recentMean: ${data.recentMean.toFixed(2)} deviation:${data.recentDeviationFromBaseline}.`);
                emit = true;
            }
            else if (this.wakeEventFusion) {
                this.fuseWakeUpEvents(false, true);
            }
            else {
                emit = true;
            }
        }
        if (emit) {
            this.circadianSM.events.noise.emit();
        }
    }
    faceHandler() {
        if (this.wakeWithFace) {
            this.parent.log.debug("face handler");
            if (this.wakeEventFusion) {
                this.fuseWakeUpEvents(true, false);
            }
            else {
                this.circadianSM.events.faceAppeared.emit();
            }
        }
    }
    heyJiboHandler() {
        this.parent.log.debug("heyJiboHandler");
        this.circadianSM.events.hjHeard.emit();
    }
    plugStateChanged() {
        this.parent.log.debug("plugStateChangedHandler");
        this.circadianSM.events.plugStateChanged.emit();
    }
    subscribeEventHandlers() {
        jibo.lps.detector.ambientAudioSpike.trigger.on(this.noiseHandlerBind);
        jibo.jetstream.events.hjHeard.on(this.heyJiboHandlerBind);
        jibo.lps.identity.events.visibleFaceStarted.on(this.faceHandlerBind);
        jibo.globalEvents.sleep.on(this.goToSleepHandlerBind);
        jibo.action.events.secondHandTouchStop.on(this.headTouchHandlerBind);
        jibo.system.events.pluggedIn.on(this.plugStateChangedBind);
        jibo.system.events.unplugged.on(this.plugStateChangedBind);
    }
    unsubscribeEventHandlers() {
        jibo.lps.detector.ambientAudioSpike.trigger.removeListener(this.noiseHandlerBind);
        jibo.jetstream.events.hjHeard.removeListener(this.heyJiboHandlerBind);
        jibo.lps.identity.events.visibleFaceStarted.removeListener(this.faceHandlerBind);
        jibo.globalEvents.sleep.removeListener(this.goToSleepHandlerBind);
        jibo.action.events.secondHandTouchStop.removeListener(this.headTouchHandlerBind);
        jibo.system.events.pluggedIn.removeListener(this.plugStateChangedBind);
        jibo.system.events.unplugged.removeListener(this.plugStateChangedBind);
    }
    fuseWakeUpEvents(face, noise) {
        const now = Date.now();
        const errorMessage = 'Unexpected case in fuseWakeUpEvents at point: ';
        let emitEventAndReset = false;
        if (this.wakeFusionTime && (now - this.wakeFusionTime) <= this.fusionWindowMs) {
            if (this.waitingforFace) {
                if (noise) {
                    this.parent.log.debug(`Heard sound, waiting for ${this.fusionWindowMs}ms to see face.`);
                    this.wakeFusionTime = now;
                }
                else if (face) {
                    emitEventAndReset = true;
                }
                else {
                    this.parent.log.error(errorMessage, 'waiting for face.');
                }
            }
            else if (this.waitingForSound) {
                if (noise) {
                    emitEventAndReset = true;
                }
                else if (face) {
                    this.parent.log.debug(`Saw face, waiting for ${this.fusionWindowMs}ms to hear sound.`);
                    this.wakeFusionTime = now;
                }
                else {
                    this.parent.log.error(errorMessage, 'waiting for sound.');
                }
            }
            else {
                this.parent.log.error(errorMessage, 'nonsensically waiting for fusion.');
            }
        }
        else {
            this.waitingforFace = false;
            this.waitingForSound = false;
            this.wakeFusionTime = now;
            if (face) {
                this.waitingForSound = true;
                this.parent.log.debug(`Saw face, waiting for ${this.fusionWindowMs}ms to hear sound.`);
            }
            else if (noise) {
                this.waitingforFace = true;
                this.parent.log.debug(`Heard sound, waiting for ${this.fusionWindowMs}ms to see face.`);
            }
            else {
                this.parent.log.error(errorMessage, 'fusion window opened for unknown cause.');
            }
        }
        if (emitEventAndReset) {
            this.parent.log.info("Triggering wakeup. Got both required events.");
            this.wakeFusionTime = null;
            this.waitingforFace = false;
            this.waitingForSound = false;
            this.circadianSM.events.faceAppeared.emit();
        }
    }
    isInternalState(state) {
        return (state === jibo_common_types_1.CircadianState.TIME_OF_DAY ||
            state === jibo_common_types_1.CircadianState.SELECT_INTENT);
    }
    setCircadianState(state) {
        switch (state) {
            case jibo_common_types_1.CircadianState.ALERT:
                this.circadianSM.events.becomeAlert.emit();
                break;
            case jibo_common_types_1.CircadianState.RELAXED:
                this.circadianSM.events.becomeRelaxed.emit();
                break;
            case jibo_common_types_1.CircadianState.WAKING_UP:
                this.circadianSM.events.becomeWakingUp.emit();
                break;
            case jibo_common_types_1.CircadianState.DAYTIME_NAP:
                this.circadianSM.events.becomeNap.emit();
                break;
            case jibo_common_types_1.CircadianState.FALLING_ASLEEP:
                this.circadianSM.events.becomeFallingAsleep.emit();
                break;
            case jibo_common_types_1.CircadianState.ASLEEP:
                this.circadianSM.events.becomeAsleep.emit();
                break;
            default:
                this.parent.log.warn(`Set circadian state called with unrecognized state ${state}`);
        }
    }
    setFaceWakeup(toggle) {
        this.parent.log.info(`Circadian Face Wakeup: ${toggle}`);
        this.wakeWithFace = toggle;
    }
    setSoundWakeup(toggle) {
        this.parent.log.info(`Circadian Sound Wakeup: ${toggle}`);
        this.wakeWithSound = toggle;
    }
    setWakeupFusion(toggle) {
        this.parent.log.info(`Circadian Wakeup Fusion: ${toggle}`);
        this.wakeEventFusion = toggle;
    }
    setFusionWindow(window) {
        this.parent.log.info(`Setting fusion window to ${window}.`);
        this.fusionWindowMs = window;
    }
    showDebuggingLightRings(value) {
        this.parent.log.info(`Circadian light rings active: ${value}.`);
        this.useLEDForDebug = value;
        const state = this.getCurrentCircadianState();
        if (state) {
            const color = this.circadianColorMap.get(state);
            color && jibo.expression.setLEDColor([color[0], color[1], color[2]]);
        }
    }
    restartStateMachineWithDurations(durations) {
        this.parent.log.error('Restarting state machine with new durations. This should NEVER be called in production.');
        this.resetCircadianStateMachine(durations);
        this.parent.replaceSession();
    }
}
exports.CircadianManager = CircadianManager;

},{"./CircadianExpression":17,"./CircadianStateMachine":19,"./TunableDebug":22,"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined,"lodash/lodash.min":undefined}],19:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const jibo_common_types_1 = require("jibo-common-types");
const AlertState_1 = require("./intents/AlertState");
const RelaxedState_1 = require("./intents/RelaxedState");
const NapState_1 = require("./intents/NapState");
const FallingAsleepState_1 = require("./intents/FallingAsleepState");
const AsleepState_1 = require("./intents/AsleepState");
const WakingUpState_1 = require("./intents/WakingUpState");
const ChooseTimeState_1 = require("./intents/ChooseTimeState");
const HJNoMatch_1 = require("./intents/HJNoMatch");
const TurnAwayState_1 = require("./intents/TurnAwayState");
const be_framework_1 = require("@be/be-framework");
var te = be_framework_1.libraries.jibo_typed_events;
var sm = be_framework_1.libraries.jibo_state_machine;
var cu = be_framework_1.libraries.jibo_cai_utils;
const hjNoMatch = 'hjNomatch';
const goToSleep = 'sleep';
const turnAway = 'turnAway';
const turnAround = 'turnAround';
class SMEvents extends te.EventContainer {
    constructor() {
        super(...arguments);
        this.nightStarts = new te.Event('Nighttime starts');
        this.dayStarts = new te.Event('Daytime starts');
        this.goToSleep = new te.Event(`"Go to sleep"`);
        this.headTouch = new te.Event('Head touch');
        this.noise = new te.Event('Noise heard');
        this.faceAppeared = new te.Event('Face appeared');
        this.hjHeard = new te.Event('HJ Skill launch');
        this.plugStateChanged = new te.Event('Plug state changed');
        this.screenTouched = new te.Event('Screen touched');
        this.becomeAlert = new te.Event('debug awake');
        this.becomeRelaxed = new te.Event('debug relaxed');
        this.becomeAsleep = new te.Event('debug asleep');
        this.becomeFallingAsleep = new te.Event('debug fallingAsleep');
        this.becomeWakingUp = new te.Event('debug wakingUp');
        this.becomeNap = new te.Event('debug nap');
    }
}
exports.SMEvents = SMEvents;
class EntryState extends sm.State {
    constructor(mainSM) {
        super(mainSM, jibo_common_types_1.CircadianState.SELECT_INTENT);
        this.mainSM = mainSM;
        this.intentMap = new Map();
        this.mainSM.getCurrentState();
        this.skill = mainSM.parent.parent;
        this.onEntry = (trans, options) => {
            this.skill.log.info(`Entering: ${this.name}`);
            options = options || {};
            Promise.all([
                this.resumeGlobalListen(),
                this.skill.forceEyeView()
            ]).then(() => {
                let intent = this.skill.getIntent(options);
                if (intent === hjNoMatch) {
                    this.transitionTo(mainSM.hjNoMatch, options);
                }
                else if (intent === goToSleep) {
                    this.transitionTo(mainSM.asleep);
                }
                else if (intent === turnAway || intent == turnAround) {
                    this.transitionTo(mainSM.turnAway);
                }
                else {
                    this.transitionTo(mainSM.alert);
                }
            }).catch(error => {
                this.skill.log.error('Error in forcing eye closed: ', error);
                this.transitionTo(mainSM.alert);
            });
        };
    }
    installTransitions() {
        this.addInternalTransition(jibo_common_types_1.CircadianState.ALERT, this.mainSM.alert);
        this.addInternalTransition(jibo_common_types_1.CircadianState.ASLEEP, this.mainSM.asleep);
        this.addInternalTransition(jibo_common_types_1.CircadianState.TURN_AWAY, this.mainSM.turnAway);
        this.addInternalTransition(hjNoMatch, this.mainSM.hjNoMatch);
    }
    resumeGlobalListen() {
        if (jibo.deafenController && jibo.deafenController.enabled) {
            return Promise.resolve();
        }
        return jibo.jetstream.resetHotwordMode()
            .catch(e => {
            this.skill.log.warn('Error resuming global list: ', e);
        });
    }
}
exports.EntryState = EntryState;
class CircadianStateMachine extends sm.StateMachine {
    constructor(parent, circadianDurations) {
        super();
        this.parent = parent;
        this.entry = new EntryState(this);
        this.events = new SMEvents();
        this.asleep = new AsleepState_1.AsleepState(this);
        this.checkToDState = new ChooseTimeState_1.ChooseTimeState(this);
        this.turnAway = new TurnAwayState_1.TurnAwayState(this);
        this.hjNoMatch = new sm.State(this, jibo_common_types_1.CircadianState.HJ_NO_MATCH);
        this.durations = new Map(CircadianStateMachine.DEFAULT_CIRCADIAN_DURATIONS);
        if (circadianDurations) {
            circadianDurations.forEach(([state, num]) => this.durations.set(state, num));
        }
        this.parent.parent.log.debug('Circadian Durations: ');
        this.durations.forEach((value, key) => {
            this.parent.parent.log.debug(`${key} - ${value} mins`);
        });
        this.BIG_MUSING_TIME_MS = cu.TimeUtils.minutesToMs(this.getDuration(jibo_common_types_1.CircadianState.ALERT) * 0.7);
        this.SMALL_MUSING_TIME_MS = cu.TimeUtils.minutesToMs(this.getDuration(jibo_common_types_1.CircadianState.RELAXED) * 0.7);
        this.alert = new AlertState_1.AlertState(this);
        this.relaxed = new RelaxedState_1.RelaxedState(this);
        this.nap = new NapState_1.NapState(this);
        this.fallingAsleep = new FallingAsleepState_1.FallingAsleepState(this);
        this.wakingUp = new WakingUpState_1.WakingUpState(this);
    }
    init() {
        this.setInitial(this.entry);
        this.entry.installTransitions();
        const hjNoMatchSM = new HJNoMatch_1.HJNoMatch(this.parent.parent, new sm.StateMachine());
        this.hjNoMatch.onEntry = (trans, data) => {
            this.parent.pushAttentionMode(jibo.expression.AttentionMode.ENGAGED);
            return hjNoMatchSM.start(data);
        };
        this.hjNoMatch.onExit = (trans) => {
            return hjNoMatchSM.ensureStopped();
        };
        this.hjNoMatch.addDoneTransition(this.entry);
        this.checkToDState.installTransitions(this.relaxed, this.fallingAsleep);
        this.alert.installTransitions(this.checkToDState);
        this.relaxed.installTransitions(this.nap);
        this.nap.installTransitions(this.relaxed);
        this.fallingAsleep.installTransitions(this.asleep);
        this.wakingUp.installTransitions(this.relaxed);
        this.turnAway.installTransitions();
        this.nap.addTypedEventTransition(this.events.nightStarts, this.fallingAsleep);
        this.relaxed.addTypedEventTransition(this.events.nightStarts, this.fallingAsleep);
        this.asleep.addTypedEventTransition(this.events.dayStarts, this.wakingUp);
        this.nap.addTypedEventTransition(this.events.noise, this.relaxed);
        this.nap.addTypedEventTransition(this.events.faceAppeared, this.relaxed);
        this.wakingUp.addTypedEventTransition(this.events.noise, this.relaxed);
        this.wakingUp.addTypedEventTransition(this.events.faceAppeared, this.relaxed);
        this.addGlobalTypedEventTransition(this.events.goToSleep, this.asleep);
        this.addGlobalTypedEventTransition(this.events.headTouch, this.alert);
        this.addGlobalTypedEventTransition(this.events.plugStateChanged, this.alert);
        this.addGlobalTypedEventTransition(this.events.screenTouched, this.alert);
        this.addGlobalTypedEventTransition(this.events.hjHeard, this.alert);
        this.addGlobalTypedEventTransition(this.events.becomeAlert, this.alert);
        this.addGlobalTypedEventTransition(this.events.becomeRelaxed, this.relaxed);
        this.addGlobalTypedEventTransition(this.events.becomeNap, this.nap);
        this.addGlobalTypedEventTransition(this.events.becomeAsleep, this.asleep);
        this.addGlobalTypedEventTransition(this.events.becomeFallingAsleep, this.fallingAsleep);
        this.addGlobalTypedEventTransition(this.events.becomeWakingUp, this.wakingUp);
        this.stateChanged.on((transition) => {
            this.parent.checkCircadianStateChange();
        });
    }
    getDuration(state) {
        if (this.durations.has(state)) {
            const duration = this.durations.get(state);
            if (duration && duration >= 1) {
                return duration;
            }
            else {
                this.parent.parent.log.error(`Invalid duration of ${duration} for ${state}.`);
            }
        }
        else {
            this.parent.parent.log.error(`State is invalid ${state}.`);
        }
        if (CircadianStateMachine.DEFAULT_CIRCADIAN_DURATIONS.has(state)) {
            let defaultDuration = CircadianStateMachine.DEFAULT_CIRCADIAN_DURATIONS.get(state);
            this.parent.parent.log.warn(`Using default circadian duration of ${defaultDuration}.`);
            return defaultDuration;
        }
        else {
            this.parent.parent.log.error(`Default duration is invalid for state ${state}, returning 1 minute.`);
            return 1;
        }
    }
    dispose() {
        this.destroy();
    }
    update() {
        super.update();
    }
}
CircadianStateMachine.DEFAULT_CIRCADIAN_DURATIONS = new Map([
    [jibo_common_types_1.CircadianState.ALERT, 15],
    [jibo_common_types_1.CircadianState.RELAXED, 120],
    [jibo_common_types_1.CircadianState.DAYTIME_NAP, 30],
    [jibo_common_types_1.CircadianState.FALLING_ASLEEP, 15],
    [jibo_common_types_1.CircadianState.WAKING_UP, 30]
]);
exports.CircadianStateMachine = CircadianStateMachine;
if (global._idleTest) {
    global._idleTest.CircadianStateMachine = module.exports.CircadianStateMachine;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./intents/AlertState":25,"./intents/AsleepState":26,"./intents/ChooseTimeState":27,"./intents/FallingAsleepState":28,"./intents/HJNoMatch":29,"./intents/NapState":30,"./intents/RelaxedState":32,"./intents/TurnAwayState":33,"./intents/WakingUpState":34,"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined}],20:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const be_framework_1 = require("@be/be-framework");
const jibo_common_types_1 = require("jibo-common-types");
var cu = be_framework_1.libraries.jibo_cai_utils;
const be_framework_2 = require("@be/be-framework");
const KBModel_1 = require("./KBModel");
const CircadianManager_1 = require("./CircadianManager");
let tunable = null;
try {
    tunable = require('jibo-tunable');
}
catch (e) {
}
class Idle extends be_framework_2.BeSkill {
    constructor(options) {
        super(options);
        this.debug = be_framework_2.utils.PackageUtils.debugMode('idle');
        this.kbModel = new KBModel_1.KBModel();
        this.updateBinding = this.update.bind(this);
        this.onTouchBind = this.onTouch.bind(this);
        this.closing = false;
        this.circadianManager = new CircadianManager_1.CircadianManager(this);
        const attemptErrorRecovery = (options) => {
            return cu.TimeUtils.wait(1000)
                .then(() => {
                this.circadianManager.resetCircadianStateMachine();
                return cu.TimeUtils.wait(1000);
            })
                .then(() => {
                this.session.replaceSession(options);
            });
        };
        const createSession = (options = {}) => {
            const promise = this.circadianManager.circadianSM.start(options)
                .catch(error => {
                if (!this.closing) {
                    this.log.error(`Error in Idle (attempting recovery): `, error);
                    return attemptErrorRecovery(options);
                }
                else {
                    this.log.error(`Error in Idle while closing: `, error);
                }
            })
                .catch(error => {
                this.log.error(`Unrecoverable error in Idle: `, error);
            });
            return {
                promise,
                stop: () => {
                    return this.circadianManager.circadianSM.stop()
                        .catch(error => this.log.error('Could not stop circadian state machine: ', error));
                },
                update: () => this.circadianManager.update(),
            };
        };
        this.session = new cu.SessionManager(createSession, () => { });
    }
    postInit(done) {
        if (this.debug) {
            this.setupDebug();
        }
        this.screenDofs = jibo.expression.dofs.ALL.minus(jibo.expression.dofs.BODY).minus(jibo.expression.dofs.EYE_TRANSLATE).minus(jibo.expression.dofs.LED);
        this.kbModel.init()
            .then(() => done())
            .catch(e => {
            this.log.error(`error initializing kbModel: `, e);
            done(e);
        });
    }
    preload(done) {
        jibo.timer.on('update', this.updateBinding);
        jibo.expression.setAttentionMode(jibo.expression.AttentionMode.IDLE)
            .then(() => done())
            .catch(done);
    }
    open(result, refresh) {
        this.closing = false;
        jibo.mim.shouldShowGUI = false;
        jibo.mim.silentMenus = false;
        result = result || {};
        if (!refresh) {
            this.circadianManager.subscribeEventHandlers();
        }
        if (refresh || this.session.current) {
            this.session.replaceSession(result);
        }
        else {
            this.log.info('Starting');
            this.session.open(result);
        }
        this.qrScanning = true;
        this.qrCommandActive = false;
        this._readQR();
    }
    _readQR() {
        if (!this.qrCommandActive) {
            jibo.lps.readBarcode((err, data) => {
                if (!err && data && data.length && (data[0].type === 9 || data[0].type === 10)) {
                    this.log.info('Code Detected: ', err);
                    let codeType = data[0].type;
                    let barcode = data[0].content;
                    let parts = barcode.split('[#]');
                    let qrCommand = parts[0];
                    let qrText = parts[1];
                    this.log.info(`Code Type: ${codeType} Command: ${qrCommand}`);
                    switch (qrCommand) {
                        case "ESML":
                            if (qrText) {
                                this.qrCommandActive = true;
                                this.log.info('QR Code ESML: ' + qrText);
                                jibo.embodied.speech.speak(qrText)
                                    .then(() => { this.qrCommandActive = false; })
                                    .catch(() => { this.qrCommandActive = false; });
                            }
                            break;
                        case "NAME":
                            let greeting = `hi ${qrText}`;
                            this.qrCommandActive = true;
                            this.log.info(`QR Code NAME: ${qrText}, ${greeting}`);
                            jibo.embodied.speech.speak(greeting)
                                .then(() => { this.qrCommandActive = false; })
                                .catch(() => { this.qrCommandActive = false; });
                    }
                }
            });
        }
        if (this.qrScanning) {
            this.qrTimeout = setTimeout(this._readQR.bind(this), 2000);
        }
    }
    getIntent(options) {
        if (options) {
            return options.intent || (options.nlu ? options.nlu.intent : null);
        }
    }
    update() {
        if (this.session.current) {
            this.session.current.update();
        }
    }
    forceEyeView() {
        return __awaiter(this, void 0, void 0, function* () {
            yield jibo.expression.cleanup({
                requestor: 'Test',
                dofs: this.screenDofs
            });
            const forceEyeviewPr = new Promise((resolve, reject) => {
                jibo.face.views.forceEyeView(resolve, this.onTouchBind, jibo.face.views.IN, jibo.face.views.UP, reject);
            }).catch(e => {
                this.log.warn(`Error while in 'forceEyeView': `, e);
            });
            yield Promise.race([
                cu.TimeUtils.wait(5000),
                forceEyeviewPr,
            ]);
        });
    }
    onTouch() {
        if (this.circadianManager.getCurrentCircadianState() === jibo_common_types_1.CircadianState.ALERT ||
            this.circadianManager.getCurrentCircadianState() === jibo_common_types_1.CircadianState.RELAXED) {
            this.redirect('@be/main-menu', { intent: 'tap' });
        }
        else {
            this.circadianManager.screenWasTouched();
        }
    }
    close(done) {
        this.closing = true;
        this.log.info('Stopping');
        this.qrScanning = false;
        if (this.qrTimeout) {
            clearTimeout(this.qrTimeout);
        }
        const cleanUp = (err) => {
            if (jibo.face.views.currentView) {
                jibo.face.views.currentView.clearActions();
            }
            jibo.timer.removeListener('update', this.updateBinding);
            this.circadianManager.unsubscribeEventHandlers();
            this.circadianManager.circadianExpression.clearAnimationQueue();
            this.circadianManager.clearAttentionMode();
            done(err);
        };
        const closingPromises = [this.session.close()];
        if ((jibo.runMode === jibo.RunMode.ON_ROBOT) && !this.circadianManager.currentlyAwake()) {
            closingPromises.push(this.circadianManager.circadianExpression.restoreScreenBrightness());
        }
        cu.PromiseUtils.timeout(Promise.all(closingPromises), 1000)
            .then(() => cleanUp())
            .catch(cleanUp);
    }
    setupDebug() {
        if (tunable) {
            const T = tunable.Tunable;
            T.getButtonField('Clear KBModel', Idle.WINDOW_NAME)
                .events.change.on(() => this.kbModel.clear());
        }
    }
    replaceSession() {
        this.log.warn('Replacing session, this should never be called in production.');
        this.session.replaceSession({});
    }
}
Idle.WINDOW_NAME = 'Idle';
exports.Idle = Idle;

},{"./CircadianManager":18,"./KBModel":21,"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined,"jibo-tunable":undefined}],21:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
function initializeRootData() {
    return {
        verbalNoMatchTimes: []
    };
}
function initializeUserData() {
    return {
        verbalNoMatchTimes: []
    };
}
class KBModel {
    init(name = 'idle') {
        return __awaiter(this, void 0, void 0, function* () {
            this.model = jibo.kb.createModel('/' + name);
            this.rootNode = yield this.model.loadRoot();
            if (!this.rootNode.data.verbalNoMatchTimes) {
                this.rootNode.data = initializeRootData();
                yield this.rootNode.save();
            }
            const edges = this.rootNode.getEdges('loop');
            if (edges.length === 0) {
                this.loopNode = this.model.createNode('loop', { description: 'Loop Member Memory' });
                yield this.loopNode.save();
                this.rootNode.addEdges(this.loopNode);
                yield this.rootNode.save();
            }
            else if (edges.length === 1) {
                this.loopNode = yield this.model.load(edges[0]);
            }
            else {
                throw new Error('Idle should only have one Loop Member Memory node');
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            this.rootNode.data = initializeRootData();
            yield this.rootNode.save();
            const userEdges = this.loopNode.getEdges(Object.keys(this.loopNode.edges));
            for (let i = 0; i < userEdges.length; i++) {
                const userNode = yield this.model.load(userEdges[i]);
                userNode.data = initializeUserData();
                yield userNode.save();
            }
        });
    }
    getUserNode(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const userEdges = this.loopNode.getEdges(userID);
            let userNode;
            if (userEdges.length === 0) {
                userNode = this.model.createNode(userID);
                userNode.data = initializeUserData();
                yield userNode.save();
                this.loopNode.addEdges(userNode);
                yield this.loopNode.save();
            }
            else {
                userNode = yield this.model.load(userEdges[0]);
            }
            return userNode;
        });
    }
    markVerbalNoMatch(date, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userID) {
                const userNode = yield this.getUserNode(userID);
                userNode.data.verbalNoMatchTimes.push(date.getTime());
                yield userNode.save();
            }
            this.rootNode.data.verbalNoMatchTimes.push(date.getTime());
            yield this.rootNode.save();
        });
    }
    getVerbalNoMatches(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userID) {
                const userNode = yield this.getUserNode(userID);
                return userNode.data.verbalNoMatchTimes.map(t => new Date(t));
            }
            return this.rootNode.data.verbalNoMatchTimes.map(t => new Date(t));
        });
    }
}
exports.KBModel = KBModel;

},{"jibo":undefined}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CircadianStateMachine_1 = require("./CircadianStateMachine");
const jibo_common_types_1 = require("jibo-common-types");
let tunable = null;
try {
    tunable = require('jibo-tunable');
}
catch (e) {
}
const WIN_CIRC = 'Circadian';
class TunableDebug {
    static setup(manager) {
        if (tunable) {
            const T = tunable.Tunable;
            const sm = manager.circadianSM;
            T.getCheckboxField('Show Light Rings', false, WIN_CIRC).events.change.on(value => {
                manager.showDebuggingLightRings(value);
            });
            T.getDropdownField(`Set state`, Object.keys(jibo_common_types_1.CircadianState), 0, WIN_CIRC).events.change.on(value => {
                manager.setCircadianState(value);
            });
            T.getDropdownField('Toggle Face Wakeup', ['ON', 'OFF'], 0, WIN_CIRC).events.change.on(value => {
                let toggle = (value === 'ON') ? true : false;
                manager.setFaceWakeup(toggle);
            });
            T.getDropdownField('Toggle Sound Wakeup', ['ON', 'OFF'], 0, WIN_CIRC).events.change.on(value => {
                let toggle = (value === 'ON') ? true : false;
                manager.setSoundWakeup(toggle);
            });
            T.getDropdownField('Wakeup logical', ['AND', 'OR'], 0, WIN_CIRC).events.change.on(value => {
                let toggle = (value === 'AND') ? true : false;
                manager.setWakeupFusion(toggle);
            });
            let fusionWindow = 10000;
            T.getNumberField('Wakeup fusion window (ms)', fusionWindow, 100, 60000, -1, WIN_CIRC).events.change.on(value => {
                manager.setFusionWindow(value);
            });
            let alertDuration = sm.getDuration(jibo_common_types_1.CircadianState.ALERT);
            T.getNumberField('ALERT duration', alertDuration, 1, 60, -1, WIN_CIRC).events.change.on(value => {
                alertDuration = Math.floor(value);
            });
            let relaxedDuration = sm.getDuration(jibo_common_types_1.CircadianState.RELAXED);
            T.getNumberField('RELAXED duration', relaxedDuration, 1, 360, -1, WIN_CIRC).events.change.on(value => {
                relaxedDuration = Math.floor(value);
            });
            let napDuration = sm.getDuration(jibo_common_types_1.CircadianState.DAYTIME_NAP);
            T.getNumberField('NAP duration', napDuration, 1, 240, -1, WIN_CIRC).events.change.on(value => {
                napDuration = Math.floor(value);
            });
            let fallingAsleepDuration = sm.getDuration(jibo_common_types_1.CircadianState.FALLING_ASLEEP);
            T.getNumberField('FALLING_ASLEEP duration', fallingAsleepDuration, 1, 60, -1, WIN_CIRC).events.change.on(value => {
                fallingAsleepDuration = Math.floor(value);
            });
            let wakingUpDuration = sm.getDuration(jibo_common_types_1.CircadianState.WAKING_UP);
            T.getNumberField('WAKING_UP duration', wakingUpDuration, 1, 360, -1, WIN_CIRC).events.change.on(value => {
                wakingUpDuration = Math.floor(value);
            });
            T.getButtonField('Change Durations', WIN_CIRC).events.change.on(() => {
                const durations = new Array();
                durations.push([jibo_common_types_1.CircadianState.ALERT, alertDuration]);
                durations.push([jibo_common_types_1.CircadianState.RELAXED, relaxedDuration]);
                durations.push([jibo_common_types_1.CircadianState.DAYTIME_NAP, napDuration]);
                durations.push([jibo_common_types_1.CircadianState.FALLING_ASLEEP, fallingAsleepDuration]);
                durations.push([jibo_common_types_1.CircadianState.WAKING_UP, wakingUpDuration]);
                manager.restartStateMachineWithDurations(durations);
            });
            T.getButtonField('Reset Durations', WIN_CIRC).events.change.on(() => {
                const durations = new Array();
                durations.push([jibo_common_types_1.CircadianState.ALERT, CircadianStateMachine_1.CircadianStateMachine.DEFAULT_CIRCADIAN_DURATIONS.get(jibo_common_types_1.CircadianState.ALERT)]);
                durations.push([jibo_common_types_1.CircadianState.RELAXED, CircadianStateMachine_1.CircadianStateMachine.DEFAULT_CIRCADIAN_DURATIONS.get(jibo_common_types_1.CircadianState.RELAXED)]);
                durations.push([jibo_common_types_1.CircadianState.DAYTIME_NAP, CircadianStateMachine_1.CircadianStateMachine.DEFAULT_CIRCADIAN_DURATIONS.get(jibo_common_types_1.CircadianState.DAYTIME_NAP)]);
                durations.push([jibo_common_types_1.CircadianState.FALLING_ASLEEP, CircadianStateMachine_1.CircadianStateMachine.DEFAULT_CIRCADIAN_DURATIONS.get(jibo_common_types_1.CircadianState.FALLING_ASLEEP)]);
                durations.push([jibo_common_types_1.CircadianState.WAKING_UP, CircadianStateMachine_1.CircadianStateMachine.DEFAULT_CIRCADIAN_DURATIONS.get(jibo_common_types_1.CircadianState.WAKING_UP)]);
                manager.restartStateMachineWithDurations(durations);
            });
        }
    }
}
exports.TunableDebug = TunableDebug;

},{"./CircadianStateMachine":19,"jibo-common-types":undefined,"jibo-tunable":undefined}],23:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
class Utils {
    static cleanHJFromText(input) {
        const lower = input.toLowerCase();
        let out;
        if (lower.startsWith('jibo')) {
            out = input.substr(4).trim();
        }
        else if (lower.startsWith('hey jibo')) {
            out = input.substr(8).trim();
        }
        else {
            out = input;
        }
        return out;
    }
    static addHoursToDate(refTime, hoursToAdd) {
        return new Date(refTime.getTime() + cu.TimeUtils.hoursToMs(hoursToAdd));
    }
    static countEarlierTimes(refTime, times) {
        const refTimeNum = refTime.getTime();
        let count = 0;
        times.forEach(t => {
            const diff = t.getTime() - refTimeNum;
            if (diff > 0) {
                count++;
            }
        });
        return count;
    }
}
exports.Utils = Utils;
if (global._idleTest) {
    global._idleTest.Utils = module.exports;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"@be/be-framework":undefined}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Idle_1 = require("./Idle");
module.exports = Idle_1.Idle;

},{"./Idle":20}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const jibo_common_types_1 = require("jibo-common-types");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
var sm = be_framework_1.libraries.jibo_state_machine;
class AlertState extends sm.State {
    constructor(parent) {
        super(parent, jibo_common_types_1.CircadianState.ALERT);
        this.parent = parent;
        this.duration = cu.TimeUtils.minutesToMs(this.parent.getDuration(jibo_common_types_1.CircadianState.ALERT));
        const skill = parent.parent.parent;
        const manager = parent.parent;
        const expressor = manager.circadianExpression;
        let hasMused = false;
        let startTime = -1;
        this.onEntry = (transition) => {
            skill.log.info(`Entering ${this.name}`);
            startTime = Date.now();
            hasMused = false;
            manager.pushAttentionMode(jibo.expression.AttentionMode.IDLE);
            expressor.queueAnimationsForTransition(transition);
        };
        this.onUpdate = () => {
            const now = Date.now();
            if ((now - startTime > parent.BIG_MUSING_TIME_MS) && !hasMused) {
                expressor.playBigMusing();
                hasMused = true;
            }
            if (now - startTime > this.duration) {
                this.transitionTo(this.timeoutState);
            }
        };
    }
    installTransitions(timeoutState) {
        this.timeoutState = timeoutState;
        this.addInternalTransition(`Action Timeout of ${this.duration} ms.`, this.timeoutState);
    }
}
exports.AlertState = AlertState;

},{"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const jibo_common_types_1 = require("jibo-common-types");
const OTAUpdater_1 = require("./OTAUpdater");
const be_framework_1 = require("@be/be-framework");
var sm = be_framework_1.libraries.jibo_state_machine;
class AsleepState extends sm.State {
    constructor(parent) {
        super(parent, jibo_common_types_1.CircadianState.ASLEEP);
        this.parent = parent;
        this.skill = parent.parent.parent;
        const manager = parent.parent;
        const expressor = manager.circadianExpression;
        this.updater = new OTAUpdater_1.OTAUpdater(this.skill);
        let attentionHandle;
        let entryTime = -1;
        this.onEntry = (transition) => {
            this.skill.log.info(`Entering ${this.name}`);
            entryTime = Date.now();
            this.updater.checkForUpdates();
            attentionHandle = null;
            manager.pushAttentionMode(jibo.expression.AttentionMode.OFF);
            expressor.queueAnimationsForTransition(transition);
        };
        this.onUpdate = () => {
            this.updater.update(Date.now() - entryTime);
        };
        this.onExit = (transition) => {
            if (transition.name) {
                this.trackReasonForWakeup(transition.name);
            }
        };
    }
    trackReasonForWakeup(transitionName) {
        let reason = 'unknown';
        if (transitionName === "TEvent: " + this.parent.events.headTouch.name) {
            reason = 'head_touched';
        }
        else if (transitionName === "TEvent: " + this.parent.events.screenTouched.name) {
            reason = 'screen_touched';
        }
        else if (transitionName === "TEvent: " + this.parent.events.hjHeard.name) {
            reason = 'hj_heard';
        }
        else if (transitionName === "TEvent: " + this.parent.events.dayStarts.name) {
            reason = 'day_started';
        }
        else {
            this.skill.log.warn(`Unknown wake reason for analytics: ${transitionName}`);
            reason = transitionName;
        }
        this.skill.track('Wake Method', { eventType: reason });
    }
}
exports.AsleepState = AsleepState;

},{"./OTAUpdater":31,"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo_common_types_1 = require("jibo-common-types");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
var sm = be_framework_1.libraries.jibo_state_machine;
class ChooseTimeState extends sm.State {
    constructor(parent) {
        super(parent, jibo_common_types_1.CircadianState.TIME_OF_DAY);
        this.parent = parent;
        this.onEntry = (transition) => {
            const skill = this.parent.parent.parent;
            skill.log.info(`Entering ${this.name}.`);
            const pod = this.parent.parent.currentPoD;
            if (pod.basic === cu.PartOfDayBasic.NIGHT) {
                this.transitionTo(this.nighttimeState);
            }
            else {
                this.transitionTo(this.daytimeState);
            }
        };
    }
    installTransitions(daytimeState, nighttimeState) {
        this.daytimeState = daytimeState;
        this.nighttimeState = nighttimeState;
        this.addInternalTransition(`Daytime`, daytimeState);
        this.addInternalTransition(`Nighttime`, nighttimeState);
    }
}
exports.ChooseTimeState = ChooseTimeState;

},{"@be/be-framework":undefined,"jibo-common-types":undefined}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const jibo_common_types_1 = require("jibo-common-types");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
var sm = be_framework_1.libraries.jibo_state_machine;
class FallingAsleepState extends sm.State {
    constructor(parent) {
        super(parent, jibo_common_types_1.CircadianState.FALLING_ASLEEP);
        this.parent = parent;
        this.duration = cu.TimeUtils.minutesToMs(this.parent.getDuration(jibo_common_types_1.CircadianState.FALLING_ASLEEP));
        const skill = parent.parent.parent;
        const manager = parent.parent;
        const expressor = manager.circadianExpression;
        let startTime = -1;
        this.onEntry = (transition) => {
            skill.log.info(`Entering ${this.name}`);
            startTime = Date.now();
            manager.pushAttentionMode(jibo.expression.AttentionMode.OFF);
            expressor.queueAnimationsForTransition(transition);
        };
        this.onUpdate = () => {
            const now = Date.now();
            if (now - startTime > this.duration) {
                this.transitionTo(this.timeoutState);
            }
        };
    }
    installTransitions(timeoutState) {
        this.timeoutState = timeoutState;
        this.addInternalTransition(`Action Timeout of ${this.duration} ms.`, this.timeoutState);
    }
}
exports.FallingAsleepState = FallingAsleepState;

},{"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined}],29:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const be_framework_1 = require("@be/be-framework");
exports.sm = be_framework_1.libraries.jibo_state_machine;
const FlowState_1 = require("../states/FlowState");
const Idle_1 = require("../Idle");
const Utils_1 = require("../Utils");
let tunable;
try {
    tunable = require('jibo-tunable');
}
catch (e) {
}
const Flows = {
    Blink: require('../../flows/global/blink'),
    Confused: require('../../flows/nomatch/confused-nomatch'),
    Glances: require('../../flows/nomatch/glances-nomatch'),
    Reset: require('../../flows/nomatch/reset-nomatch'),
    Thinking: require('../../flows/nomatch/thinking-nomatch'),
    Verbal: require('../../flows/nomatch/verbal-nomatch'),
};
var DebugMode;
(function (DebugMode) {
    DebugMode[DebugMode["Disabled"] = 'Disabled'] = "Disabled";
    DebugMode[DebugMode["ForceVerbal"] = 'ForceVerbal'] = "ForceVerbal";
    DebugMode[DebugMode["ForceNonVerbal"] = 'ForceNonVerbal'] = "ForceNonVerbal";
})(DebugMode || (DebugMode = {}));
class HJNoMatch {
    constructor(parent, statemachine) {
        this.parent = parent;
        this.statemachine = statemachine;
        this.initState = new exports.sm.State(this.statemachine, 'Start');
        this.doneState = new exports.sm.State(this.statemachine, 'Done');
        this.thinkingState = new FlowState_1.FlowState(this.statemachine, this.parent, 'Thinking animation', Flows.Thinking);
        this.confusedState = new FlowState_1.FlowState(this.statemachine, this.parent, 'Confused animation', Flows.Confused);
        this.glancesState = new FlowState_1.FlowState(this.statemachine, this.parent, 'Glances animation', Flows.Glances);
        this.blinkState = new FlowState_1.FlowState(this.statemachine, this.parent, 'Blink animation', Flows.Blink);
        this.resetState = new FlowState_1.FlowState(this.statemachine, this.parent, 'Reset animation', Flows.Reset);
        this.shouldDoVerbalState = new exports.sm.State(this.statemachine, 'Should we do verbal response?');
        this.doVerbalState = new FlowState_1.FlowState(this.statemachine, this.parent, 'Do verbal response', Flows.Verbal);
        this.showTextState = new exports.sm.State(this.statemachine, 'Show text on screen');
        this.removeTextState = new exports.sm.State(this.statemachine, 'Remove text');
        this.debugMode = DebugMode.Disabled;
        if (this.parent.debug && tunable) {
            const T = tunable.Tunable;
            T.getButtonField('HJNoMatch: Trigger', Idle_1.Idle.WINDOW_NAME)
                .events.change.on(() => jibo.globalEvents.shared.noGlobalMatch.emit({
                status: jibo.jetstream.types.TurnResultType.SUCCEEDED,
                result: new jibo.jetstream.types.ListenResult({
                    text: "hey jibo some text",
                    confidence: 1
                }, null),
                global: true
            }));
            T.getDropdownField('HJNoMatch: Override Verbal', Object.keys(DebugMode), 0, Idle_1.Idle.WINDOW_NAME)
                .events.change.on(option => this.debugMode = DebugMode[option]);
        }
        let attentionHandle;
        this.initState.onEntry = (trans, data) => __awaiter(this, void 0, void 0, function* () {
            this.parent.log.info(`HJ NoMatch entering`);
            return data;
        });
        this.doneState.onEntry = () => __awaiter(this, void 0, void 0, function* () {
            this.parent.log.info('HJ NoMatch exiting');
            return this.stop();
        });
        let shouldDoVerbal = false;
        this.showTextState.onEntry = (trans, data) => {
            return this.shouldDoVerbal().then(should => {
                shouldDoVerbal = should;
                let text;
                if (typeof data === 'string') {
                    text = data;
                }
                else if (data && data.lastResult && (typeof data.lastResult.text === 'string')) {
                    text = data.lastResult.text;
                }
                if (!text) {
                    this.parent.log.warn('No HJNomatch text found');
                    text = "";
                }
                text = Utils_1.Utils.cleanHJFromText(text);
                this.parent.track('Idle No Match', { text });
                this.showText(`"${text}"`, false);
            });
        };
        this.removeTextState.onEntry = () => {
            return this.parent.forceEyeView();
        };
        this.shouldDoVerbalState.onEntry = () => {
            if (shouldDoVerbal) {
                this.parent.log.info(`HJ NoMatch performing verbal prompt`);
                this.shouldDoVerbalState.transitionTo(this.doVerbalState);
            }
            else {
                this.parent.log.info(`HJ NoMatch performing non-verbal prompt`);
                this.shouldDoVerbalState.transitionTo(this.confusedState);
            }
        };
        this.initState.addDoneTransition(this.thinkingState);
        this.thinkingState.addDoneTransition(this.showTextState);
        this.showTextState.addDoneTransition(this.shouldDoVerbalState);
        this.confusedState.addDoneTransition(this.removeTextState);
        this.shouldDoVerbalState.addInternalTransition('Yes', this.doVerbalState);
        this.shouldDoVerbalState.addInternalTransition('No', this.confusedState);
        this.doVerbalState.addDoneTransition(this.removeTextState);
        this.removeTextState.addDoneTransition(this.glancesState);
        this.glancesState.addDoneTransition(this.blinkState);
        this.blinkState.addDoneTransition(this.resetState);
        this.resetState.addDoneTransition(this.doneState);
    }
    start(options) {
        return this.statemachine.start(options);
    }
    stop() {
        return this.statemachine.stop();
    }
    ensureStopped() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.statemachine.isRunning) {
                this.parent.log.info('Stopping HJNoMatch state machine due to interruption.');
                return this.stop();
            }
        });
    }
    shouldDoVerbal() {
        return __awaiter(this, void 0, void 0, function* () {
            const person = jibo.lps.identity.getActiveSpeaker();
            const personId = person ? person.idInfo.id : null;
            let shouldBeVerbal;
            if (this.debugMode === DebugMode.Disabled) {
                if (person) {
                    const verbalNoMatchTimes = yield this.parent.kbModel.getVerbalNoMatches(personId);
                    if (verbalNoMatchTimes.length >= 10) {
                        shouldBeVerbal = false;
                    }
                    else {
                        const refTime = Utils_1.Utils.addHoursToDate(new Date(), -24);
                        const recentVerbal = Utils_1.Utils.countEarlierTimes(refTime, verbalNoMatchTimes);
                        shouldBeVerbal = recentVerbal < 4;
                    }
                }
                else {
                    const verbalNoMatchTimes = yield this.parent.kbModel.getVerbalNoMatches();
                    const refTime = Utils_1.Utils.addHoursToDate(new Date(), -1);
                    const recentVerbal = Utils_1.Utils.countEarlierTimes(refTime, verbalNoMatchTimes);
                    shouldBeVerbal = recentVerbal < 3;
                }
            }
            else {
                shouldBeVerbal = (this.debugMode === DebugMode.ForceVerbal);
            }
            if (shouldBeVerbal) {
                yield this.parent.kbModel.markVerbalNoMatch(new Date(), personId);
            }
            return shouldBeVerbal;
        });
    }
    showText(text, showHeader) {
        const FaceRenderer = jibo.FaceRenderer;
        const componentConfigs = [];
        if (showHeader) {
            componentConfigs.push({
                id: "top",
                type: "Label",
                text: "This confused me",
                style: {
                    fontSize: "50",
                    fontFamily: "Proxima Nova Soft",
                    fontStyle: "bold",
                    fill: "#FFFFFF",
                    wordWrap: true,
                    wordWrapWidth: 1240,
                    align: 'center'
                },
                position: {
                    x: FaceRenderer.WIDTH / 2,
                    y: 100
                },
                targetAnchor: {
                    x: 0.5,
                    y: 0.5
                }
            });
        }
        componentConfigs.push({
            id: "bottom",
            type: "Label",
            text: text,
            style: {
                fontSize: "120",
                fontFamily: "Proxima Nova Soft",
                fontStyle: "bold",
                fill: "#b6b6c2",
                wordWrap: true,
                wordWrapWidth: 1240,
                align: 'center'
            },
            position: {
                x: FaceRenderer.WIDTH / 2,
                y: FaceRenderer.HEIGHT / 2
            },
            targetAnchor: {
                x: 0.5,
                y: 0.5
            }
        });
        const viewConfig = {
            componentConfigs,
            viewConfig: {
                type: "View",
                id: "global_not_matched_text"
            },
        };
        jibo.face.views.createView("View", viewConfig, true);
    }
    containsState(state) {
        return (state === this.initState || state === this.doneState ||
            state === this.thinkingState || state === this.confusedState ||
            state === this.glancesState || state === this.blinkState ||
            state === this.resetState || state === this.shouldDoVerbalState ||
            state === this.doVerbalState || state === this.showTextState ||
            state === this.removeTextState);
    }
}
exports.HJNoMatch = HJNoMatch;

},{"../../flows/global/blink":8,"../../flows/nomatch/confused-nomatch":9,"../../flows/nomatch/glances-nomatch":10,"../../flows/nomatch/reset-nomatch":11,"../../flows/nomatch/thinking-nomatch":12,"../../flows/nomatch/verbal-nomatch":13,"../Idle":20,"../Utils":23,"../states/FlowState":35,"@be/be-framework":undefined,"jibo":undefined,"jibo-tunable":undefined}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const jibo_common_types_1 = require("jibo-common-types");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
var sm = be_framework_1.libraries.jibo_state_machine;
class NapState extends sm.State {
    constructor(parent) {
        super(parent, jibo_common_types_1.CircadianState.DAYTIME_NAP);
        this.parent = parent;
        this.duration = cu.TimeUtils.minutesToMs(this.parent.getDuration(jibo_common_types_1.CircadianState.DAYTIME_NAP));
        const skill = parent.parent.parent;
        const manager = parent.parent;
        const expressor = manager.circadianExpression;
        let startTime = -1;
        this.onEntry = (transition) => {
            skill.log.info(`Entering ${this.name}`);
            startTime = Date.now();
            manager.pushAttentionMode(jibo.expression.AttentionMode.OFF);
            expressor.queueAnimationsForTransition(transition);
        };
        this.onUpdate = () => {
            const now = Date.now();
            if (now - startTime > this.duration) {
                this.transitionTo(this.timeoutState);
            }
        };
    }
    installTransitions(timeoutState) {
        this.timeoutState = timeoutState;
        this.addInternalTransition(`Action Timeout of ${this.duration} ms.`, this.timeoutState);
    }
}
exports.NapState = NapState;

},{"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
const OTA_KB = '/ota';
const A_WHILE = cu.TimeUtils.hoursToMs(36);
class OTAUpdater {
    constructor(idle) {
        this.updatesAvailable = false;
        this.kbm = null;
        this.skill = null;
        this.otaDelay = 0;
        this.enableDelayedCheck = false;
        this.checkerDelay = 0;
        this.skill = idle;
    }
    checkForUpdates() {
        this.otaDelay = 0;
        this.checkerDelay = 0;
        this.enableDelayedCheck = false;
        this.updatesAvailable = false;
        this.kbm = jibo.kb.createModel(OTA_KB);
        this.kbm.loadRoot((err, root) => {
            this.skill.log.iferr(err, 'error loading OTA root from KB');
            if (!err && root && root.data) {
                if (!root.data.updatesAvailable) {
                    if (root.data.lastUpdateCheck < Date.now() - A_WHILE) {
                        this._enableDelayedCheck();
                    }
                    else {
                        this.skill.log.info('No Updates Available. Skipping nightly backup.');
                    }
                }
                else {
                    this.skill.log.info(`Initializing Nighttime OTA Helper. Updates Available.`);
                    this._enableUpdates();
                }
            }
            else {
                this.skill.log.info('Initializing Nighttime OTA Helper. OTA KB is empty.');
            }
        });
    }
    update(sleepyTime) {
        if (this.updatesAvailable && sleepyTime > this.otaDelay) {
            this.updatesAvailable = false;
            this.skill.log.info('Initiating Nighttime OTA Update');
            jibo.scheduler.otaDownloadAndInstall((err) => {
                this.skill.log.iferr(err, `Nighttime OTA Update failed: ${err}`);
            });
        }
        else if (this.enableDelayedCheck && sleepyTime > this.checkerDelay) {
            this.enableDelayedCheck = false;
            this._delayedCheck();
        }
    }
    _delayedCheck() {
        this.kbm.loadRoot((err, root) => {
            this.skill.log.iferr(err, 'error loading OTA root from KB on delayed check');
            jibo.scheduler.otaCheckUpdates((err, updateList) => {
                this.skill.log.iferr(err, 'error checking for updates in parent sleep');
                if (!err && updateList && updateList.length) {
                    root.data.updatesAvailable = true;
                    this.skill.log.info('Lonely Jibo Update Check - Yes Updates Available.');
                }
                else {
                    this.skill.log.info('Lonely Jibo Update Check - No Updates Available.');
                }
                root.data.lastUpdateCheck = Date.now();
                root.save((err) => {
                    this.skill.log.iferr(err, 'couldnt save on OTA check');
                    if (root.data.updatesAvailable) {
                        this._enableUpdates();
                    }
                });
            });
        });
    }
    _enableDelayedCheck() {
        this.checkerDelay = cu.TimeUtils.minutesToMs(Math.random() * 30);
        if (this.skill.debug) {
            this.checkerDelay = cu.TimeUtils.minutesToMs(Math.random() * 1);
        }
        this.enableDelayedCheck = true;
        this.skill.log.info(`Initializing Nighttime OTA Helper. Will check for updates in ${this.checkerDelay / cu.TimeUtils.minutesToMs(1)} minutes`);
    }
    _enableUpdates() {
        this.otaDelay = cu.TimeUtils.minutesToMs(Math.round(Math.random() * 90) + 30);
        if (this.skill.debug) {
            this.otaDelay = cu.TimeUtils.minutesToMs(Math.round(Math.random() * 2) + 1);
        }
        this.otaDelay += this.checkerDelay;
        this.updatesAvailable = true;
        this.skill.log.info(`Updates Available. Attempting download in ${this.otaDelay / cu.TimeUtils.minutesToMs(1)} minutes.`);
    }
}
exports.OTAUpdater = OTAUpdater;

},{"@be/be-framework":undefined,"jibo":undefined}],32:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const jibo_common_types_1 = require("jibo-common-types");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
var sm = be_framework_1.libraries.jibo_state_machine;
const RE_INDEX_INTERVAL = cu.TimeUtils.hoursToMs(2);
class RelaxedState extends sm.State {
    constructor(parent) {
        super(parent, jibo_common_types_1.CircadianState.RELAXED);
        this.parent = parent;
        this.lastReIndexTime = -1;
        this.nextReIndexTime = -1;
        this.duration = cu.TimeUtils.minutesToMs(this.parent.getDuration(jibo_common_types_1.CircadianState.RELAXED));
        const manager = parent.parent;
        const expressor = manager.circadianExpression;
        this.skill = manager.parent;
        let musingTime = -1;
        let hasMused = false;
        let startTime = -1;
        this.onEntry = (transition) => {
            this.skill.log.info(`Entering ${this.name}`);
            startTime = Date.now();
            if (this.lastReIndexTime === -1) {
                this.lastReIndexTime = startTime;
            }
            const timeSinceLastReindex = startTime - this.lastReIndexTime;
            const regularReIndexWaitTime = Math.max(RE_INDEX_INTERVAL - timeSinceLastReindex, 0);
            this.nextReIndexTime = startTime + Math.max(regularReIndexWaitTime, cu.TimeUtils.minutesToMs(3));
            musingTime = startTime + parent.SMALL_MUSING_TIME_MS;
            hasMused = false;
            manager.pushAttentionMode(jibo.expression.AttentionMode.RELAXED);
            expressor.queueAnimationsForTransition(transition);
        };
        this.onUpdate = () => {
            const now = Date.now();
            if (now > this.nextReIndexTime) {
                this.skill.log.info("Reindexing during relaxed");
                this.nextReIndexTime = now + RE_INDEX_INTERVAL;
                this.lastReIndexTime = now;
                this.reIndex().catch(error => {
                    this.skill.log.error("Failed to index robot. Error: ", error);
                });
            }
            if (now > musingTime && !hasMused) {
                expressor.playSmallMusing();
                hasMused = true;
            }
            if (now - startTime > this.duration) {
                this.transitionTo(this.timeoutState);
            }
        };
    }
    installTransitions(timeoutState) {
        this.timeoutState = timeoutState;
        this.addInternalTransition(`Action Timeout of ${this.duration} ms.`, this.timeoutState);
    }
    reIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            const expressor = this.parent.parent.circadianExpression;
            const reindexStart = {
                query: {
                    category: 'reindex',
                    includeMeta: ['start']
                },
                randomOrientation: true
            };
            const barbell = {
                name: 'Emoji_Barbell',
                query: null
            };
            const reindexStop = {
                query: {
                    category: 'reindex',
                    includeMeta: ['stop']
                },
                randomOrientation: true
            };
            expressor.queueAnimation(reindexStart, false);
            const animPr = cu.TimeUtils.wait(500)
                .then(() => expressor.playAnimationByName('Emoji_Barbell'))
                .then(anim => anim.promise)
                .catch(error => {
                this.skill.log.error('Failed to play indexing barbell animation: ', error);
            });
            const indexPr = jibo.expression.indexRobot()
                .catch(error => {
                be_framework_1.BeSkill.errorCode('F4-Index_timeout', 'Timeout error while periodically re-indexing in Idle: ' + error);
            });
            indexPr.then(() => {
                this.parent.parent.parent.log.info('Finished indexing.');
            });
            yield Promise.all([indexPr, animPr]);
            expressor.queueAnimation(reindexStop, false);
            expressor.emptyAnimationQueue();
        });
    }
}
exports.RelaxedState = RelaxedState;

},{"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined}],33:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const jibo_common_types_1 = require("jibo-common-types");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
var sm = be_framework_1.libraries.jibo_state_machine;
const path = require('path');
const TurnAwayFlow = require('../../flows/turnAway');
const AskToTurnBackMIM = "TurnBackQuestion";
const AnnounceTurnBackMIM = "TurnBackAnnouncement";
class TurnAwayState extends sm.State {
    constructor(parent) {
        super(parent, jibo_common_types_1.CircadianState.TURN_AWAY);
        this.parent = parent;
        this.entryTime = -1;
        this.MS_BEFORE_ASK = cu.TimeUtils.hoursToMs(1);
        this.MS_BEFORE_TURN = cu.TimeUtils.hoursToMs(6);
        this.skill = parent.parent.parent;
        const manager = parent.parent;
        const expressor = manager.circadianExpression;
        let attentionHandle;
        let hasAskedToTurnBack;
        let isTurningBack;
        this.onEntry = (transition) => {
            this.skill.log.info(`Entering ${this.name}`);
            this.entryTime = Date.now();
            attentionHandle = null;
            hasAskedToTurnBack = false;
            isTurningBack = false;
            manager.pushAttentionMode(jibo.expression.AttentionMode.OFF);
            expressor.queueAnimationsForTransition(transition);
            this.skill.track('Turned Away');
        };
        this.onUpdate = () => {
            const now = Date.now();
            if (!hasAskedToTurnBack && (now - this.entryTime > this.MS_BEFORE_ASK)) {
                hasAskedToTurnBack = true;
                this.askToTurnBack().then((intent) => {
                    if (intent === 'yes') {
                        this.transitionTo(this.parent.relaxed);
                    }
                    else {
                        this.skill.log.info(`Not turning around due to user intent ${intent}`);
                    }
                    this.skill.track('Turn Back', { user_response: (intent ? intent : 'UNDEFINED') });
                }).catch((error) => {
                    hasAskedToTurnBack = false;
                    this.skill.log.error('Failed to play turn back: ', error);
                });
            }
            else if (cu.TimeUtils.getPartOfDay(new Date()).basic === cu.PartOfDayBasic.NIGHT) {
                this.skill.log.info('Going into sleep state.');
                this.transitionTo(this.parent.asleep);
            }
            else if (!isTurningBack && now - this.entryTime > this.MS_BEFORE_TURN) {
                isTurningBack = true;
                this.skill.log.info(`Attempting to turn back after long wait.`);
                this.announceTurnBack().then(() => {
                    this.transitionTo(this.parent.relaxed);
                }).catch((error) => {
                    isTurningBack = false;
                    this.skill.log.warn('Failed to turn back after long wait: ', error);
                });
            }
        };
        this.onStop = () => {
            this.cleanUp();
        };
        this.onExit = () => {
            this.cleanUp();
        };
    }
    installTransitions() {
        this.addInternalTransition("Turning back", this.parent.relaxed);
        this.addInternalTransition("Deep sleep", this.parent.asleep);
    }
    askToTurnBack() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.playMIM(AskToTurnBackMIM);
            let intent;
            if (result) {
                intent = this.extractMIMResult(result);
            }
            return intent;
        });
    }
    announceTurnBack() {
        return __awaiter(this, void 0, void 0, function* () {
            const prom = yield this.playMIM(AnnounceTurnBackMIM);
            return prom;
        });
    }
    playMIM(mim) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                assetPack: this.skill.assetPack,
                enableLogging: false,
                blackboard: {
                    promptData: {},
                    mimPath: path.join('mims', mim + '.mim'),
                    result: {}
                },
            };
            try {
                yield cu.PromiseUtils.promisify(h => {
                    this.flowHandle = jibo.flow.run(TurnAwayFlow, options, h);
                });
            }
            catch (e) {
                throw e;
            }
            finally {
                this.flowHandle = null;
            }
            return options.blackboard.result;
        });
    }
    cleanUp() {
        if (this.flowHandle) {
            this.flowHandle.stop();
            this.flowHandle = null;
        }
    }
    extractMIMResult(mimResult) {
        return (mimResult) ? mimResult.asrResults.intent : null;
    }
}
exports.TurnAwayState = TurnAwayState;

},{"../../flows/turnAway":14,"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined,"path":undefined}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const jibo_common_types_1 = require("jibo-common-types");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
var sm = be_framework_1.libraries.jibo_state_machine;
class WakingUpState extends sm.State {
    constructor(parent) {
        super(parent, jibo_common_types_1.CircadianState.WAKING_UP);
        this.parent = parent;
        this.duration = cu.TimeUtils.minutesToMs(this.parent.getDuration(jibo_common_types_1.CircadianState.WAKING_UP));
        const manager = parent.parent;
        const skill = manager.parent;
        const expressor = manager.circadianExpression;
        let startTime = -1;
        this.onEntry = (transition) => {
            skill.log.info(`Entering ${this.name}`);
            startTime = Date.now();
            manager.pushAttentionMode(jibo.expression.AttentionMode.OFF);
            expressor.queueAnimationsForTransition(transition);
        };
        this.onUpdate = () => {
            const now = Date.now();
            if (now - startTime > this.duration) {
                this.transitionTo(this.timeoutState);
            }
        };
    }
    installTransitions(timeoutState) {
        this.timeoutState = timeoutState;
        this.addInternalTransition(`Action Timeout of ${this.duration} ms.`, this.timeoutState);
    }
}
exports.WakingUpState = WakingUpState;

},{"@be/be-framework":undefined,"jibo":undefined,"jibo-common-types":undefined}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
exports.sm = be_framework_1.libraries.jibo_state_machine;
exports.cu = be_framework_1.libraries.jibo_cai_utils;
const jibo = require("jibo");
class FlowState extends exports.sm.State {
    constructor(sm, idle, name, flow, blackboard) {
        super(sm, name);
        this.idle = idle;
        this.flow = flow;
        this.blackboard = blackboard;
        this.onEntry = this._onEntry.bind(this);
        this.onStop = () => {
            if (this._flowHandle) {
                this._flowHandle.stop();
                this._flowHandle = null;
            }
        };
        this.onExit = () => {
            return this._flowPromise;
        };
    }
    _onEntry(trans, input) {
        if (!this.flow) {
            this.idle.log.warn(`Skipping flow: '${this.name}'`);
        }
        else {
            this.idle.log.info(`Playing flow: '${this.name}'`);
            const result = {};
            const options = {
                result,
                blackboard: this.blackboard,
                assetPack: this.idle.assetPack,
                enableLogging: false,
            };
            const done = () => {
                this._flowHandle = null;
                this._flowPromise = null;
            };
            this._flowPromise = exports.cu.PromiseUtils.promisify(h => {
                this._flowHandle = jibo.flow.run(this.flow, options, h);
            })
                .then(done)
                .catch(e => {
                done();
                throw e;
            });
            return this._flowPromise.then(() => {
                return {
                    result: result,
                    lastResult: input
                };
            });
        }
    }
}
exports.FlowState = FlowState;

},{"@be/be-framework":undefined,"jibo":undefined}]},{},[15])(15)
});
//# sourceMappingURL=index.js.map