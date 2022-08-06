# SemanticFlow Configuration

## Scope

The following documentation focuses on how to configure SemanticFlow editor. 

# How to

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
Providing the dataset endpoints under `sparql.api` section of the `config.json` file is required. SemanticFlow uses SPARQL protocol to manipulate RDF data.

### sparql type
SemanticFlow is using `rdf:type` to match a particular individual with its templates. That predicate can be changed in `sparql.type` : 
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

This section defines the editor's behavior when handling resources without templates. Only the type of attribute can be changed in the individual with unknown template. 

`default_attribute_editor` : readonly for all attributes other than type. 

`type_attribute_editor` : editor for type attribute. Changing the type of the individual will link it with the related template.