// call with node {relativeFilePAth}
const fs = require("fs");
const path = require("path");
const jsyaml = require("js-yaml");
const resolve = path.resolve;
const { randomUUID } = require("crypto");
const dirParser = path.dirname(require.resolve("date-holidays-parser"));

const REGEX = /^([A-Z]+)\.yaml$/;

function update() {
    const one = getList().find((country) => country === "US");

    const cleanedList = getList().filter(
        (code) => code !== null && code !== undefined && code !== "0"
    );

    cleanedList.forEach((code) => {
        console.log(code);
        loadYaml(code);
    });
}

const config = {
    dirname: resolve(__dirname, "..", "data"),
    countries: resolve(__dirname, "..", "data", "countries"),
    factories: [
        resolve(dirParser, "..", "src", "CalEventFactory.js"),
        resolve(dirParser, "..", "lib", "CalEventFactory.cjs"),
    ],
};

// Get every holiday, look through them as json, add id, then write it abck to YAML

const getList = () => {
    const list = fs.readdirSync(config.countries);
    return (cleanedList = list
        .map((file) => {
            if (REGEX.test(file)) {
                return file.replace(REGEX, "$1");
            } else {
                return undefined;
            }
        })
        .filter(function (file) {
            return file;
        })
        .sort());
};

const loadYaml = (cc) => {
    filename = resolve(config.countries, cc + ".yaml");
    const data = fs.readFileSync(filename, "utf8");
    const obj = jsyaml.load(data);
    const updatedJson = updateIdField(obj);

    // dump as yaml
    fs.writeFileSync(filename, jsyaml.dump(updatedJson));
    return { ...obj };
};

const updateIdField = (obj) => {
    if (obj === undefined || obj === null) {
        return obj;
    }

    const regionKeys = Object.keys(obj["holidays"]);

    if (regionKeys.length === 0) {
        return obj;
    }

    for (const key of regionKeys) {
        const region = obj["holidays"][key];
        const holidays = region.days;

        if (holidays) {
            const holidayKeys = Object.keys(region.days);

            let newHolidays = {};

            for (const holidayKey of holidayKeys) {
                newHolidays[holidayKey] = {
                    ...holidays[holidayKey],
                    id: randomUUID(),
                };
            }

            region.days = JSON.parse(JSON.stringify(newHolidays));

            const states = region.states;

            if (states) {
                const stateKeys = Object.keys(region.states);

                for (const stateKey of stateKeys) {
                    const stateDetails = states[stateKey];
                    const stateHolidays = states[stateKey]["days"];
                    const newStateHolidays = {};
                    if (stateHolidays) {
                        const stateHolidayKeys = Object.keys(
                            states[stateKey].days
                        );

                        for (const stateHolidayKey of stateHolidayKeys) {
                            newStateHolidays[stateHolidayKey] = {
                                ...stateHolidays[stateHolidayKey],
                                id: randomUUID(),
                            };
                        }
                    }

                    region.states[stateKey] = JSON.parse(
                        JSON.stringify({
                            ...stateDetails,
                            days: newStateHolidays,
                        })
                    );
                }
            }
        }
    }

    return obj;
};

// Call the function
update();
