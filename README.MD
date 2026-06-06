# tcxrnm

A small Node.js script that extracts and renames `.tcx` workout files exported from Strava (or similar platform).

## What it does

1. Opens a zip archive called `Archive.zip` (your Strava bulk export).
2. Extracts every file into an `Unzipped/` folder.
3. Parses each `.tcx` file as XML and reads the activity's start time.
4. Checks whether the activity contains GPS data (a `Position` element in the first trackpoint).
5. Renames the file to a clean, sortable format:
   - `gps-2024-03-15T08:30:00Z.tcx` — if GPS data is present
   - `2024-03-15T08:30:00Z.tcx` — if no GPS data (e.g. treadmill, indoor bike)

## Requirements

- Node.js (any recent version)

## Dependencies

- **xml2js** — parses `.tcx` XML files into JavaScript objects
- **node-stream-zip** — streams and extracts entries from the zip archive

## Setup

```bash
npm install
```

## Usage

1. Place your Strava export zip (renamed to `Archive.zip`) in the project root.
2. Run the script:

```bash
npm start
```

3. Renamed `.tcx` files will appear in the `Unzipped/` folder.
