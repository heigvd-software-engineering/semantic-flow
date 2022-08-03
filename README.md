# Contents

    - ./web : RDF editor. 
    - ./docker : Dockerfile for Apache Jena Fuseki . 
    - ./data : importable RDF data.

# Run via docker



## Setup the RDF dataset

Once the Apache Jena is running, its management console is accessible via http://localhost:3030/. 

The dataset `/ds` should be available in the list. Apache Jena offers several end points for each dataset. The rdf editor is configured to use the dataset called `ds`, if you change this configuration, please name the dataset accordingly.

### Add data into the dataset

Once the dataset is ready, click on `add data` and select `musici.ttl` from `./data`. That dataset originates from Stardog and contains 50 000 triples. 

This part is not required. You can run the editor on an empty dataset as well. 

# Run the application

From the "./web" folder, run:

```
npm install 
npm run start
```

`npm install` is necessary only before the first run.
# Configuring the application
The `config.json` file can be found in `./web/src/config`.

## sparql section

```
"sparql" : {
        "api": { 
            "query": "http://localhost:3030/ds/query",
            "update":"http://localhost:3030/ds/update"
        },
        "graph": "", 
        "prefixes": {
            "song"      : "http://stardog.com/tutorial/song/",
            "stardog"   : "http://stardog.com/tutorial/",
            "geo"       : "http://www.w3.org/2003/01/geo/wgs84_pos#",
            "rdf"       : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "xsd"       : "http://www.w3.org/2001/XMLSchema#"
        },
        "type": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
    }
```
### sparql endpoints
Providing the dataset endpoints under `sparql.api` section of the `config.json` file is required. This editor uses SPARQL protocol to manipulate RDF data.

### sparql type
The editor is using `rdf:type` to match a particular individual with its templates. That predicate can be changed in `sparql.type` : 
```
"type": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
```
It is important to have a prefix that match an updated `sparql.type` and to update the `default_type_attribute` in order to match the new type configuration.

### prefixes
Configured under `sparql.prefixed` section in the form of a dictionary. Allow the editor to display prefixed URIs. Prefixes are also used in the Core algorithms.

Following prefixed are mandatory: xsd, rdf. The `rdf` prefix is no longer mandatory if not used for `sparql.type`. 

It is also required to have at least one dataset related prefix. It can be a prefix without name:

```
""   : "http://stardog.com/tutorial/"
```

## default attributes
```
"default_attribute_editor": {
    "field": "literal",
    "type": "readonly"
},
"type_attribute_editor": {
    "field": "selector",
    "type": "type-selector"
}
```

This section defines the editor's behavior when handling resources without templates. Only the type attribute can be changed in the individual with unknown template.

`default_attribute_editor` : readonly for all attributes other than type. 

`type_attribute_editor` : editor for type attribute. Changing the type of the individual will link it with the related template.

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

In the template section you specify how the editor will deal with the RDF structure of your dataset. The first two properties, `prefix` and `name`, defined the type of the individual to which this template will be applied. In the `predicates` you can specify the way to handle each of the individual's predicates.

Workspace's behavior for any predicates non-listed in `predicates` section of the template:
- Non-literal property (Uri or Bnode) are represented by an edge and a separate node (relationship)
- Literal property are ignored.

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