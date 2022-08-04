# Detailed installation instruction /without docker

## Scope

The following documentation focuses on how install the SemanticFlow editor without Docker. This installation is suitable for code contributors to setup a local developement environment.

# installation

## Install Apache Jena Fuseki
You can download the latest version of Apache Jena Fuseki from [here](https://jena.apache.org/download/index.cgi).

Installations instructions can be found [here](https://jena.apache.org/documentation/fuseki2/index.html).

The version of Apache Jena Fuseki that includes the UI will help you easily manage datasets and import data.

Apache Jena requires Java environement. Please refer to the documentation of Apache Jena distribution you are using.

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

Editor is built using React and requires a nodejs runtime. Download it [here](https://nodejs.org/en/).
