
# Template configuration

## Scope

The following documentation focuses on how to configure templates and adapt the editor for work with the particular RDF data structure. 

# How to

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
