const CSV = require('csvtojson');
const FS = require('fs');
const basePath = './resources_src/';
const files = ['rounds', 'routines'];
const outputs = ['./resources/yoga-rounds.json', './resources/yoga-routines.json'];
let pathToFile;
function preprocessSpreadsheet() {
    files.forEach((fileName, index) => {
        pathToFile = basePath + fileName + '.tsv';
        csvToJson(fileName, index)
            .then((result) => {
            FS.writeFile(outputs[index], JSON.stringify(result), function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        });
    });
}
function csvToJson(fileName, index) {
    let routineProperties = null, header = false, objToWrite = null;
    let transfomer;
    if (fileName === 'routines') {
        objToWrite = [];
        routineProperties = ["name", "sequence"];
        header = true;
        transfomer = function (jsonObj, csvRow, index) {
            if (index === 0) {
                csvRow.forEach((routine, index) => {
                    objToWrite.push({
                        name: routine,
                        sequence: []
                    });
                });
            }
            else {
                for (let i = 0; i < csvRow.length; i++) {
                    if (csvRow[i]) {
                        objToWrite[i].sequence.push(csvRow[i]);
                    }
                }
            }
        };
    }
    return new Promise((resolve, reject) => {
        CSV({
            noheader: header,
            trim: false,
            delimiter: "\t",
            headers: routineProperties
        })
            .transf(transfomer)
            .fromFile(pathToFile)
            .on('end_parsed', (jsonObj) => {
            resolve(objToWrite || jsonObj);
        });
    });
}
preprocessSpreadsheet();
