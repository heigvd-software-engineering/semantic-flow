# SemanticFlow User Manual

## Scope

The following documentation focuses on how to use the SemanticFlow editor. The editor is configured to work with the `./data/music.ttl` stardog's dataset throughout this document.

## Overview

SemanticFlow editing interface, called `workspace`, allows to graphically manage RDF graphs. It has a set of features that allow the user to create individuals, to edit their properties and to manage links between them.


## How to do it

We will follow consecutive steps shown as an ordered list to demonstrate how to use the editor. 

## Open an existing individual

1. When you first enter SemanticFlow editor, you will see a blank workspace. 

![blank workspace](./img/blank-workspace.PNG)

2. A home button on the top left corner of the workspace allows to open the collapsible search menu. This menu allows you to find an individual that have type. 

![collapsible menu](./img/collapsible-search-menu.PNG)

4. By clicking on the individual from the search result you set him as the root of your workspace. The individual is added into the active individuals dropdown. 

![opened individual](./img/workspace-open-individual.PNG)

### Create new individual

1. The asset panel, at bottom right corner in the workspace, is a collapsible panel that allows you to add new or existing individuals to the workspace. It displays the list of classes configured in the template.

![asset panel](./img/workspace-asset-panel.PNG)

2. Drag and drop an individual from the asset panel to the workspace. 

![drag and drop](./img/workspace-drag-and-drop.PNG)

3. Specify the individuals URI and click on CREATE. 

![drag and drop](./img/workspace-created-individual.PNG)

### Link existing resource into the workspace

1. Drag and drop an individual from the asset panel onto the workspace, the same way we did during the new individual creation.

2. When typing the individual's URI, you will see a list of resources that match the query. You can either type the full URI of an existing resource or just click on any proposal from the list.

![drag and drop](./img/workspace-link-individual-1.PNG)

3. Click on the LINK button to add the individual to the workspace.

![drag and drop](./img/workspace-link-individual-2.PNG)

4. Drag and drop from the source handle to the target handle to link the individual to the target resource.

![drag and drop](./img/workspace-link-individual-3.PNG)

5. Chose the appropriate prefix, type the rest of the predicate URI, and click on SAVE. 

![drag and drop](./img/workspace-link-individual-4.PNG)

## Manage individual
This part of the documentation focuses on how to change the URI of an individual or to delete it.

1. Click on the "manage" button in the individual's header. In yellow.
![manage button](./img/individual-manage-1.PNG)
![manage button](./img/individual-manage-2.PNG)

### Edit individual's URI
2. Change the individual's URI. You can change the prefix of the URI as well.
3. Click Save.

### Delete individual
2. Click on the "delete" button in the individual's header. In red. The individual will be completely removed from the dataset. All the triples related to the individual will be removed.

## Manage individual's attributes

This part of the documentation focuses on how to manage the attributes of an individual.

### Add new attribute
You can only add attributes that are configured in the template. The attribute will be displayed in its missing form, in red, in the individual's node.

1. Click on the missing attribute in the individual's node.
![add attribut](./img/attribute-add-1.PNG)

2. Input the value of the attribute and click the save button. 
![add attribut](./img/attribute-add-2.PNG)

3. New attribute has been added to the individual.
![add attribut](./img/attribute-add-3.PNG)

### Multi-value existing attribute

1. When in edit mode, click on multi-value button, in yellow.
![add attribut](./img/attribute-multivalue-1.PNG)

2. Input the second value and click save
![add attribut](./img/attribute-multivalue-2.PNG)

3. New value has been added to the attribute.
![add attribut](./img/attribute-multivalue-3.PNG)

### Delete attribute

1. When in edit mode, leave all the fields empty and click save.
![add attribut](./img/attribute-delete-1.PNG)

2. Attribute has been deleted.
![add attribut](./img/attribute-delete-2.PNG)






 

