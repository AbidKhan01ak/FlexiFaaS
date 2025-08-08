if (process.argv.length > 3) {
    const a = parseInt(process.argv[2]);
    const b = parseInt(process.argv[3]);
    console.log(a + b);
} else {
    console.log("No input provided");
}
