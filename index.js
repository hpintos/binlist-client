const fileapi = require('./file.api');
const lookup = require('binlookup')();
const SECONDS_INTERVAL = 15;

let i = 0;
function readAndProcessOneEveryInterval() {
    console.time('BIN_PROCESS');
    fileapi.getLines().then((binListInput) => {
        // processBatch(getBinListInputSlice(binListInput));
        const intervalId = setInterval(async() => {
            if (i === binListInput.length - 1) {
                console.timeEnd('BIN_PROCESS');
                clearInterval(intervalId);
            }
            process(binListInput);
        }, SECONDS_INTERVAL * 1000);
    });
}

async function process(binList) {
    let binNumber;
    try {
        binNumber = binList[i];
        const { scheme, type, brand, prepaid, bank, country } = await lookup(binNumber);
        await fileapi.save({
            binNumber,
            scheme,
            type,
            brand,
            prepaid,
            'bank': bank.name,
            'country': country.name
        });
        console.log(i + ' - ' + binNumber + ' DONE');

    } catch (e) {
        console.log( `Failed for binNumber ${binNumber} (index ${i}). Retrying in ${SECONDS_INTERVAL} seconds...`);
    }
}

async function processBatch(binList) {
    let binNumber;
    try {
        for (let j = 0; j < binList.length; j++, i++) {
            binNumber = binList[j];
            const { scheme, type, brand, prepaid, bank, country } = await lookup(binNumber);
            await fileapi.save({
                binNumber,
                scheme,
                type,
                brand,
                prepaid,
                'bank': bank.name,
                'country': country.name
            });
            console.log(i + ' - ' + binNumber + ' DONE');
        }
    } catch (e) {
        console.log( `Failed for binNumber ${binNumber} (index ${i}). Retrying in ${SECONDS_INTERVAL} seconds...`);
    }
}

function getBinListInputSlice(binListInput) {
    return binListInput.slice(i, binListInput.length - i >= 10 ? i + 10 : binListInput.length - i);
}

readAndProcessOneEveryInterval();
// With interval 1s = 237422.615ms to process 50
// With interval 2s = 240309.778ms to process 50
