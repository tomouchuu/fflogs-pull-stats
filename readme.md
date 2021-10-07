# FFXIV Pull Stats

A small webapp that'll look at your fflogs to show you today's best pull and pulls made today along with historic best and total all time.

Best way to use is to have fflogs start live logging and then start the app after the first pull as it will use whatever is the first report to get subsquent information.

Will check against the reports made today 2minutes for updates.

### Setup

Duplicate `.env.example` and fill out the required `VITE_FFLOGS_API_TOKEN` with your FFlogs token which can be created at https://www.fflogs.com/api/clients/. Optionally you can put in a unix millisecond timestamp in the `VITE_HISTORIC_START_DATE` if you only want reports from a certain time to count.

Once `yarn` has been run to install dependencies, try `yarn dev` a try and visit the webpage it tells you (probably http://localhost:3000) and see if it's able to get data.

If you're happy with the data and want to display it on stream I recommend stopping `yarn dev` and running `yarn build` followed by `yarn serve --host`. With this you'll then see a network url, this is what you'll want to add to OBS as a browser source.

This is my first Typescript project and it's probably heavily customised for my use but if you find it useful then great!