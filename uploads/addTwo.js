// addTwo.js

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    try {
        const data = JSON.parse(input);
        // Expects keys 'a' and 'b'
        const result = data.a + data.b;
        console.log(result);
    } catch (err) {
        console.error(err.message);
        process.exit(1); // Indicate failure to backend
    }
});
