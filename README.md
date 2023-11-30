# ReFa Reader
![Screenshot 2023-10-11 at 15 50 12](https://github.com/uclab-potsdam/refa-essays/assets/20107875/1f044cf6-d8de-46e2-a26e-6fab4613c908)

An interactive visualisation that provides access to a selection of objects from the 'Lipperheidesche Kostümbibliothek'. Different texts are juxtaposed with a graph navigation that allows the user to browse the paintings, prints, drawings and clothes in the collection. Instead of showing the collection in its entirety, it is accessible through a curated selection of essays designed to provide a better understanding of it, combining editorial approaches with free exploration and user-driven granularity.

## Configuration
> Interested in adapting it to your collection?    
> Go to the [refa-reader-template](https://github.com/sinanatra/refa-reader-template) repository to configure it.    

## Installation
### Project setup

1. In the Terminal, go to your production folder:

```
cd path/to/my/folder
```

2. Clone this repository
```
git clone https://github.com/uclab-potsdam/refa-reader.git
cd refa-reader
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

5. Preview the production build with `yarn preview`. 

## Configuration

### Markdowns

Essays need to be inserted inside the `src/route/texts/` folder.<br>
Every markdown contains metadata to customize the layout:

```
---
title: The title of the essay.
date: "2023-12-14"
color: "blue"
author: "Name of the Author"
isPublic: true // false
lang: en
description: "The description which appears in the home page"
cover: "https://example.com/image.jpg"
---
```

### Setup
To configure the graph visualisation it is needed to customise the setup file in the `src/setup.json`. <br>


```
{
    "title": "The title of the Website",
    "api": "https://exampe.com/api", // The link to a Omeka S Api
    "publicSite": "", // The link of an Omeka-S collection 
    "languages": ["en"],
    "description": {
        "en": "Text to render in the homepage"
    }, 
    "mainCategories": [
        // It is possible to customise the column layout by specifing a category and properties as a js Object. 
        {
            "key": "Category title",
            "props": [
                "is refered to it",
                "shows features of",
            ]
        },
       ...
    ],
    "descriptionSeo": "metadata field for SEO",
    "imageSeo": "image path SEO"

}
``

