'use strict';
// Every entry in Word of the Day's list must be a playable word. A list nested inside the list counted as one
// "word" with no answers: when it was picked the skill threw and dropped straight back to idle, on every
// launch once the real words had all been played, and the words inside it were never offered.
var assert = require('assert');
var path = require('path');
var words = require(path.join(__dirname, '../@be/be/skills/word-of-the-day/assets/words.json'));

assert(Array.isArray(words) && words.length >= 200, 'the list has all its words, got ' + words.length);
var seen = {};
words.forEach(function (word, i) {
    assert(word && typeof word === 'object' && !Array.isArray(word), 'entry ' + i + ' is a word, not ' + (Array.isArray(word) ? 'a nested list' : typeof word));
    assert(typeof word.id === 'string' && word.id, 'entry ' + i + ' has an id');
    assert(!seen[word.id], 'id ' + word.id + ' is used once');
    seen[word.id] = true;
    assert(typeof word.question === 'string' && word.question, word.id + ' has a definition');
    assert(Array.isArray(word.answers) && word.answers.length >= 2, word.id + ' has answers to choose from');
    assert.strictEqual(word.answers.filter(function (a) { return a.correct; }).length, 1, word.id + ' has one right answer');
    word.answers.forEach(function (a) { assert(typeof a.answer === 'string' && a.answer, word.id + ' answers have text'); });
});
console.log('word-of-the-day words ok (' + words.length + ')');
