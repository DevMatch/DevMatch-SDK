const fs = require('fs').promises;

// Async function to read and parse a file into JSON
async function readAndParseJSON(filePath) {
  try {
    // Read the file asynchronously
    const data = await fs.readFile(filePath, 'utf8');

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    return jsonData; // Return the parsed JSON
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

(async () => {
  const filePath = './output.json';

  try {
    const result = await readAndParseJSON(filePath);

    console.assert(result[0].actualPoints === 10, "Failed");
    console.assert(result[0].solved === true, "Failed");
    console.assert(result[0].id === `TEST_1`, "Failed");

    console.assert(result[1].actualPoints === 10, "Failed");
    console.assert(result[1].solved === true, "Failed");
    console.assert(result[1].id === `TEST_2`, "Failed");

    console.assert(result[2].actualPoints === 80, "Failed");
    console.assert(result[2].solved === true, "Failed");
    console.assert(result[2].id === `TEST_3`, "Failed");

  } catch (err) {
    console.error('Failed to read and parse the JSON file:', err);
  }
})();
