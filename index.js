// ctrl alt j - choose language
// F1 to run
// option shift F format xml

// first prepare your zip by renaming all files to numbers;

// TODO separate files with gps data, those without rename to correct date

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
  console.log("Entries read: " + zip.entriesCount);
  if (!fs.existsSync("Unzipped")) {
    fs.mkdirSync("Unzipped");
  }
  for (const entry of Object.values(zip.entries())) {
    if (!entry.name.includes("__MACOSX")) {
      // rename files in unzipped folder = remove whitespace and first dot -> otherwise won't be readable
      try {
        // if (!fs.existsSync("Unzipped")) {
        //   fs.mkdirSync("Unzipped");
        // }
        // if already unzipped, read files
        // if (!fs.existsSync(`Unzipped/${entry.name}`)) {
        // fs.mkdirSync("Unzipped");
        console.log("lol", entry.name, entry.name.includes("__MACOSX"));
        zip.extract(entry, `./Unzipped/${entry.name}`, (err, count) => {
          zip.extract(entry.name, `./Unzipped/${entry.name}`, (err, count) => {
            console.log(err ? err : `Extracted ${count} entries`);
            readFile(`Unzipped/${entry.name}`);
          });
          // readFiles("Unzipped", onFileContent, (e) =>
          //   console.error(`ERROR: ${e}`)
          // );
        });
        // if (fs.existsSync(`Unzipped/${entry.name}`)) {
        //   // readFiles("Unzipped", onFileContent, () => null);
        // } else {
        //   // if not unzipped, unzip first
        //   if (!fs.existsSync("Unzipped")) {
        //     fs.mkdirSync("Unzipped");
        //   }
        //   zip.extract(entry.name, `./Unzipped/${entry.name}`, (err, count) => {
        //     console.log(err ? err : `Extracted ${count} entries`);
        //     readFiles("Unzipped", onFileContent, (e) =>
        //       console.error(`ERROR: ${e}`)
        //     );
        //     zip.close();
        //   });
        // }
      } catch (err) {
        console.error(err);
      }
    }
  }
  //zip.close();
  // Do not forget to close the file once you're done
  // zip.close();
});

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

function getActivityData(result) {
  if (result && result["TrainingCenterDatabase"])
    return result["TrainingCenterDatabase"]["Activities"][0]["Activity"][0];
  else return null;
}

function readFile(filename) {
  fs.readFile(filename, "utf-8", function (err, data) {
    console.log("read file ", data);
    parser.parseString(data, function (err, result) {
      console.log("result");
      console.log(result);
      const activityData = getActivityData(result);
      if (activityData) {
        const activityTime = getStartTime(activityData);
        //const activityType = getSportType(activityData);
        const gpsPrefix = hasGpsData(activityData) ? "gps-" : "";
        console.log("activity details ", activityTime, gpsPrefix);
        fs.rename(
          `${filename}`,
          `Unzipped/${gpsPrefix + activityTime}.tcx`,
          // `Unzipped/${activityType}-${activityTime}.tcx`,
          function (err) {
            if (err) console.log("ERROR: " + err);
          }
        );
      }
    });
  });
}

// read all files, their starttime, gpx data and rename to it
// function readFiles(dirname, onFileContent, onError) {
//   fs.readdir(dirname, function (err, filenames) {
//     if (err) {
//       onError(err);
//       return;
//     }
//     filenames.forEach(function (filename) {
//       fs.readFile(`${dirname}/${filename}`, "utf-8", function (err, content) {
//         if (err) {
//           onError(err);
//           return;
//         }
//         onFileContent(filename);
//       });
//     });
//   });
// }

// function onFileContent(filename) {
//   fs.readFile(`Unzipped/${filename}`, function (err, data) {
//     parser.parseString(data, function (err, result) {
//       const activityData = getActivityData(result);
//       if (activityData) {
//         const activityTime = getStartTime(activityData);
//         const gpsPrefix = hasGpsData(activityData) ? "gps-" : "";
//         console.log("activity details ", activityTime, gpsPrefix);
//         fs.rename(
//           `Unzipped/${filename}`,
//           `Unzipped/${gpsPrefix + activityTime}.tcx`,
//           function (err) {
//             if (err) console.log("ERROR: " + err);
//           }
//         );
//       }
//     });
//   });
// }

// function getSportType(activity) {
//   const sportAttr = activity.$.Sport;
//   if (sportAttr !== "Other") {
//     // find exact sport names
//     return sportAttr;
//   } else {
//     const time = activity.Lap[0].TotalTimeSeconds[0];
//     const distance = activity.Lap[0].DistanceMeters[0];
//     return roughlyDetermineSportType(time, distance);
//   }
// }

// function roughlyDetermineSportType(time, distance) {
//   console.log(time, distance);
//   if (distance === "0.0") {
//     if (Number.parseInt(time) < 7200) return "yoga";
//     if (Number.parseInt(time) >= 7200) return "rockclimbing";
//   } else {
//     if (distance > 200 && 1200 < time < 5400) return "swim";
//     return "Unknown";
//   }
// }
