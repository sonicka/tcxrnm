const xml2js = require("xml2js");
var fs = require("fs");
var StreamZip = require("node-stream-zip");
const parser = new xml2js.Parser();

// load zip
var zip = new StreamZip({
  file: "./Archive.zip",
  storeEntries: true,
});

// handle errors
zip.on("error", function (err) {
  console.error("[ERROR]", err);
});

zip.on("ready", () => {
  // create Unzipped folder in case it does not exist
  if (!fs.existsSync("Unzipped")) {
    fs.mkdirSync("Unzipped");
  }
  for (const entry of Object.values(zip.entries())) {
    // ignore mac specific files
    if (!entry.name.includes("__MACOSX")) {
      try {
        // extract zip and read each file
        zip.extract(entry, `./Unzipped/${entry.name}`, (err, count) => {
          readFile(`Unzipped/${entry.name}`);
        });
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// close zip after processing
zip.on("end", () => zip.close());

// read file, get actual date, check if has gps data, adjust file name
function readFile(filename) {
  fs.readFile(filename, "utf-8", function (err, data) {
    parser.parseString(data, function (err, result) {
      const activityData = getActivityData(result);
      if (activityData) {
        const activityTime = getStartTime(activityData);
        const gpsPrefix = hasGpsData(activityData) ? "gps-" : "";
        fs.rename(
          `${filename}`,
          `Unzipped/${gpsPrefix + activityTime}.tcx`,
          function (err) {
            if (err) console.log("ERROR: " + err);
          },
        );
      }
    });
  });
}

function getActivityData(result) {
  if (result && result["TrainingCenterDatabase"])
    return result["TrainingCenterDatabase"]["Activities"][0]["Activity"][0];
  else return null;
}

function hasGpsData(activity) {
  if (
    activity?.Lap[0]?.Track[0]?.Trackpoint &&
    activity?.Lap[0]?.Track[0]?.Trackpoint[0]?.Position
  ) {
    return true;
  }
  return false;
}

function getStartTime(activity) {
  if (activity.Lap) return activity.Lap[0].$.StartTime;
  else return null;
}
