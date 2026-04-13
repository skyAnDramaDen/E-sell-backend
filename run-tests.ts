import * as newman from "newman";

newman.run({
    collection: require("./tests/collection.json"),
    reporters: "cli"
}, function(error: Error) {
    if (error) {
        console.log(error);
        process.exit(1);
    }

    console.log("Running complete");
    process.exit(0);
})