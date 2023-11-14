/**
 * Copyright (C) 2023 DevMatch Co. - All Rights Reserved
 **/
const YAML = require('yaml');
const fs = require('fs');

if (process.argv.length != 4) {
    console.log(`Missing arguments. Usage ${process.argv[0]} [input.yaml] [output.json]`)
    return;
}

const input = process.argv[2];
const output = process.argv[3];

fs.exists(input, (exists) => {
    if (!exists) {
        console.log("Input does not exist")
        return false;
    }

    fs.readFile(input, { encoding: 'utf8', flag: 'r' }, (err, contents) => {
        if (err) {
            console.log("Unable to read input")
            return false;
        }


        const parsed = JSON.stringify(YAML.parse(contents))
        const code = `/*GENERATED CODE -- DO NOT CHANGE*/export const CHALLENGE_YAML_STRING = ${parsed}`

        fs.writeFile(output, code, (err) => {
            if (err) {
                console.log("Unable to write output")
                return false;
            }

            console.log("OK");
            return true;
        })
    });
})
