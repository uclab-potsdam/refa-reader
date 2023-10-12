# ReFa Essays
![Screenshot 2023-10-11 at 15 50 12](https://github.com/uclab-potsdam/refa-essays/assets/20107875/1f044cf6-d8de-46e2-a26e-6fab4613c908)


An interactive visualization that juxtaposes essays and graphs. 
It allows readers to browse items from Omeka-S-based collections, by accessing them through a curated selection of texts designed to provide better understanding, combining editorial approaches with free exploration and user-driven granularity.

## Project setup

```
yarn install
```

## Run
```
yarn dev -- --open
```

### Build for production
```
yarn build
```

Preview the production build with `npm run preview`.

### Configuration

Insert the markdown files to load inside the `src/route/essays/` folder.
Customise `src/setup.js` to customise languages, texts and properties.