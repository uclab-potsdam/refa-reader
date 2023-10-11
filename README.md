# ReFa Essays
![Screenshot 2023-10-11 at 15 50 12](https://github.com/uclab-potsdam/refa-essays/assets/20107875/1f044cf6-d8de-46e2-a26e-6fab4613c908)


An interactive visualisation that provides access to a selection of objects from the 'Lipperheidesche Kostümbibliothek'.
Different texts are juxtaposed with a graph navigation that allows the user to browse the paintings, prints, drawings and clothes in the collection. Instead of showing the collection in its entirety, it is accessible through a curated selection of essays designed to provide a better understanding of it, combining editorial approaches with free exploration and user-driven granularity.

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

Customise `src/stores.js` and `src/invertedProperties.js` to change labels and properties.

So far, it relies on the Omeka S API to function.
