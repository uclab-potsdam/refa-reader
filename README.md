# ReFa Reader Template
![Screenshot 2023-10-13 at 17 06 33](https://github.com/uclab-potsdam/refa-reader-template/assets/20107875/3cfdb390-9ed6-4a58-83c3-4aa9cd3d80d6)


An interactive visualization that juxtaposes essays and graphs. 
It allows readers to browse items from Omeka-S-based collections, by accessing them through a curated selection of texts designed to provide better understanding, combining editorial approaches with free exploration and user-driven granularity.

## Installation
### Project setup

1. In Terminal, go to your production folder:
```
cd path/to/my/folder
```

2. Clone this repository
```
git clone https://github.com/uclab-potsdam/refa-reader-template.git NAME-OF-MY-FOLDER
cd NAME-OF-MY-FOLDER
```

3. Install dependencies with yarn
```
yarn
```

4. Run and build the development environment.
```
yarn dev
yarn build
```

5. Preview the production build with `npm run preview`.

## Configuration

### Markdowns

Essays need to be inserted inside the `src/route/essays/` folder.<br>
Every markdown contains metadata to customize the layout:

```
---
title: The title of the essay.
date: "2023-12-14"
color: "blue"
isPublic: true // false
lang: en
description: "The description which appears in the home page"
cover: "https://example.com/image.jpg"
---
```

### Setup
To Setup the visualisation it is needed to customise the setup file in the `src/setup.js`. <br>


```
{
    "title": "The title of the Website",
    "api": "https://exampe.com/api", // The link to a Omeka S Api
    "publicSite": "", // The link of an Omeka-S collection 
    "languages": ["en"],
    "description": {
        "en": "Text to render in the homepage"
    },
    "itemDetailMetaData": [
        "dcterms:description" // Vocabulary properties to show in the left column of the essay.
    ],
    "mainCategories": [
        // It is possible to customise the column layout by specifing a category and properties as a js Object. 
        {
            "key": "Category title",
            "props": [
                "is refered to it",
                "shows features of",
            ]
        },
        {
            "key": "Documentation",
            "props": [
                "is documented in",
                "incorporates"
            ]
        }
    ],
    "categories": "Related" // All the properties which do not fit the `mainCategories` will fall in this category. 
}
``

