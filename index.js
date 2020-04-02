const fileapi = require('./file.api');
const lookup = require('binlookup')();
const SECONDS_INTERVAL = 70;

let i = 0;
function readAndProcessOneEveryInterval() {
    console.time('BIN_PROCESS');
    fileapi.getLines().then((binListInput) => {
        const intervalId = setInterval(async() => {
            if (i === binListInput.length - 1) {
                console.timeEnd('BIN_PROCESS');
                clearInterval(intervalId);
            }
            let binNumber = binListInput[i];
            try {
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
                i++;
            } catch (e) {
                console.log( `Failed for binNumber ${binNumber} (index ${i}). Retrying in ${SECONDS_INTERVAL} seconds...`);
            }
        }, SECONDS_INTERVAL * 1000);
    });
}

readAndProcessOneEveryInterval();
// With interval 1s = 237422.615ms to process 50
// With interval 2s = 240309.778ms to process 50
