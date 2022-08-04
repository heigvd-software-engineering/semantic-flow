![Forks](https://img.shields.io/github/forks/heigvd-software-engineering/semantic-flow)
![Stars](https://img.shields.io/github/stars/heigvd-software-engineering/semantic-flow)
![Licence](https://img.shields.io/github/license/heigvd-software-engineering/semantic-flow)
![Issues](https://img.shields.io/github/issues/heigvd-software-engineering/semantic-flow)
# Contents

    - ./web : RDF editor. 
    - ./docker/jena-fuseki : Dockerfile for Apache Jena Fuseki . 
    - ./data : importable RDF data.

# Description of the project
![workspace](./workspace.png)
Web solution for visual editing of the RDF graphs with advanced functionalities allowing spatio-temporal data management adapted to the needs of research on the history of Swiss territorial control.

The editor is highly configurable and can adapt to diverse and varied contexts thanks to a template system. Configuring a template allows you to define the structure of the resources and properties managed by the tool. Thus, the user can intuitively edit graphs of any nature. The user is assisted by a set of attribute editors that allow simple and intuitive data editing experience.

The editor uses the HTTP protocol and the SPARQL query language to manipulate RDF data. SPARQL, a W3C standard, is a reference in the RDF field. Our solution is therefore compatible with many existing RDF data sources.

# Motivations
Since Semantic Web ontologies are often overly complex, the objective is to configure the editor using templates to edit the RDF graph intuitively.

Configuring a template allows the user's view of the graph to be reduced to the resources and properties of interest. Editing large RDF graphs thus becomes much more ergonomic.

# Quick start /docker
    
    docker compose build
    docker compose up

Will run the docker-compose file and start both Apache Jena Fuseki and the editor.

# Detailed installation instruction /without docker

## Install Apache Jena Fuseki
You can download the latest version of Apache Jena Fuseki from [here](https://jena.apache.org/download/index.cgi).

Installations instructions can be found [here](https://jena.apache.org/documentation/fuseki2/index.html).

The version of Apache Jena Fuseki that includes the UI will help you easily manage datasets and import data.

### Run Apache Jena Fuseki in In-Memory mode with `ds` dataset
Download and extract the archive from Apache Jena Binary Distributions [here](https://jena.apache.org/download/index.cgi).
    
    cd /path/to/apache-jena-fuseki
    ./fuseki-server --mem /ds

## Run the editor

From the "./web" folder, run:

```
npm install 
npm run start
```

`npm install` is necessary only before the first run.

# Setup the RDF dataset

Both Dockerized and non-Dockerized installations will run Apache Jena with an empty dataset named `ds`. 

Apache Jena UI console is accessible via http://localhost:3030/. 

The dataset `/ds` should be available in the list. Apache Jena offers several endpoints per dataset. The rdf editor is configured to use the dataset called `ds`, if you change this configuration, please name the dataset accordingly.

### Add data into the dataset

Once the dataset is ready, click on `add data` and select `musici.ttl` from `./data`. That dataset originates from Stardog and contains 50 000 triples. 

The editor do not require any data to be loaded in the dataset. This part is not required. You can run the editor on an empty dataset as well.

# Template configuration
Template configuration is done via the `./web/config.json` file. It allows you to adapt the editor to work with your data structure.

Two steps are required to adapt the editor to a new structure:
- defined prefixes for the dataset
- define the templates

## Prefixes
Configured under `sparql.prefixes` section in form of a JSON dictionary. Allow the editor to display prefixed URIs. Prefixes are also used in the Core algorithms.

At least you should have both `rdf` and `xsd` prefixed and at least one prefix related to your dataset which can be a nameless prefix. 


## template configuration
```
{
            "prefix": "stardog",
            "name": "Producer",
            "predicates": [
                { 
                    "prefix": "stardog",
                    "name": "name",
                    "grouping": "attribute",
                    "editor": {
                        "field": "literal",
                        "type": "literal-text"
                    }
                },{
                    "prefix": "stardog",
                    "name": "description" ,
                    "grouping": "attribute",
                    "editor": {
                        "field": "literal",
                        "type": "literal-textarea"
                    }
                }, {
                    "prefix": "stardog",
                    "name": "born",
                    "grouping": "attribute",
                    "editor": {
                        "field": "bnode",
                        "type": "uncertain-around-date"
                    }
                }
            ]
        }
```

In the template section you specify how the editor will deal with the RDF structure of your dataset. The first two properties, `prefix` and `name`, defined the type of the individual to which this template will be applied. In the `predicates` you can specify the way to manage each of the individual's predicates.

Workspace's behavior for any predicates non-listed in `predicates` section of the template:
- `Non-literal` property (Uri or Bnode) are represented by an edge and a separate node (relationship)
- `Literal` properties are ignored.

This behavior scopes the users view on the aspects of the individual that are important for him.

### attribute configuration
Defines how the editor will deal with individual's properties.

The predicate matched by `prefix:name` will be shown as an attribute of the individual's node in the workspace. It is possible to use a different prefix per attribute, When a predicate is used in the attribute configuration it must be specified in `sparql.prefixes`.

The only supported `grouping` option is `attribute`. 

The `editor` section specifies a particular editor to be used to edit that attribute.


#### attrbute editor configuration
We have three types of fields: literal, bnode, and selector.

    - literal : a field for literal attribute editors. 
    - bnode :  a field for bnode attribute editors. 
    - selector : a field for editors that will be used for selection.

The `type` property defines the type of the editor. 

Literal field types:

    - literal-text : a text editor. 
    - literal-textarea : a textarea editor. 
    - literal-number : a number editor. 

Bnode field types: 
    - uncertain-around-date : historical date - uncertain around date editor. 
    - uncertain-possibilities-date : historical date - uncertain date represented as a list of possibilities. 
    - spatial-lat-lon : spatial property - geographic coordinates editor.

Selector field types:

    - type-selector : a selector editor that will is used to select the types of the individual. This editor helps to attach the correct template to an individual.
