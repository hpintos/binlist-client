const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const ObjectsToCsv = require('objects-to-csv');

const FILE_NAME = './bin-list-output.csv';

getLines = () => {
    return readFile('bin-list-input.txt','utf8').then((file)=>{ return file.split(/\r?\n/); });
};

save = async (params)=> {
    const csv = new ObjectsToCsv([params]);
    await csv.toDisk(FILE_NAME, { append: true })
};

module.exports = {
    save,
    getLines
};
