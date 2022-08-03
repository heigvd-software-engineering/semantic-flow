import React from 'react';
import {
    render, act, fireEvent, waitFor, waitForElementToBeRemoved, screen
} from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { MainProvider } from '../../context/MainContext';
import Workspace from '../../main/workspace/Workspace';
import data from './data/workspace.data.json';

import Repository from '../../core/dal/Repository';

jest.mock('../../core/dal/Repository');
jest.mock('../../config/config.json');

// Open Issue prevents to test edges and to find elements within svg
// https://github.com/testing-library/dom-testing-library/issues/974

describe('Workspace Component', () => {

    it('Workspace Component | All workspace components rendered', () => {
        render(
            <MainProvider>
                <Workspace
                    graphData={{
                        nodes: data.nodes,
                        edges: data.edges
                    }}
                />
            </MainProvider>
        );
        expect(screen.getByTestId("workspace-container")).toBeInTheDocument();
        expect(screen.getAllByTestId("node-update").length).toBe(2);
        expect(screen.queryByTestId("edge-update")).not.toBeInTheDocument();
    });

    it('Workspace Component | Create edge between nodes | Drag and Drop', () => {
        render(
            <MainProvider>
                <Workspace
                    graphData={{
                        nodes: data.nodes,
                        edges: data.edges
                    }}
                />
            </MainProvider>
        );

        expect(screen.getByTestId("workspace-container")).toBeInTheDocument();
        expect(screen.getByTestId("asset-panel")).toBeInTheDocument();

        let nodes = screen.getAllByTestId("node-update");
        expect(nodes.length).toBe(2);
        let sourceHandles = screen.getAllByTestId("handle-source");
        let targetHandles = screen.getAllByTestId("handle-target");
        expect(sourceHandles.length).toBe(2);
        expect(targetHandles.length).toBe(2);
        let source = sourceHandles[0];
        let target = targetHandles[1];

        fireEvent.mouseDown(source);
        fireEvent.mouseMove(target);
        fireEvent.mouseUp(target);
        // cant test for the existance within the svg
        // ISSUE : https://github.com/testing-library/dom-testing-library/issues/974
        //expect(screen.getByTestId("edge-create-form")).toBeInTheDocument();
    });

    it('Workspace Component | Asset Panel | Create Node | Drag n Drop', async () => {
        render(
            <MainProvider>
                <Workspace
                    graphData={{
                        nodes: data.nodes,
                        edges: data.edges
                    }}
                />
            </MainProvider>
        );
        
        
        Repository.insertIndividual.mockResolvedValueOnce({});
        Repository.searchSimilarIndividual.mockResolvedValueOnce([]);

        const mockDropEvent = new window.Event("drop")
        Object.assign(mockDropEvent, {
            dataTransfer: { 
                getData: () => {
                    return "{\"attributes\":[{\"field\":\"selector\",\"datatype\":{\"prefix\":\"xsd\",\"name\":\"string\",\"uri\":\"http://www.w3.org/2001/XMLSchema#string\"},\"templates\":[\"Producer\"],\"predicate\":{\"uri\":\"http://www.w3.org/1999/02/22-rdf-syntax-ns#type\",\"template\":{\"prefix\":\"rdf\",\"name\":\"type\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"selector\",\"type\":\"type-selector\"}}},\"objects\":[{\"type\":\"uri\",\"value\":\"http://stardog.com/tutorial/Producer\"}]},{\"field\":\"literal\",\"datatype\":{\"prefix\":\"xsd\",\"name\":\"string\",\"uri\":\"http://www.w3.org/2001/XMLSchema#string\"},\"templates\":[\"Producer\"],\"predicate\":{\"uri\":\"http://stardog.com/tutorial/name\",\"template\":{\"prefix\":\"stardog\",\"name\":\"name\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"literal\",\"type\":\"literal-text\"}}},\"objects\":[]},{\"field\":\"literal\",\"datatype\":{\"prefix\":\"xsd\",\"name\":\"string\",\"uri\":\"http://www.w3.org/2001/XMLSchema#string\"},\"templates\":[\"Producer\"],\"predicate\":{\"uri\":\"http://stardog.com/tutorial/description\",\"template\":{\"prefix\":\"stardog\",\"name\":\"description\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"literal\",\"type\":\"literal-textarea\"}}},\"objects\":[]},{\"field\":\"bnode\",\"datatype\":{\"prefix\":\"xsd\",\"name\":\"string\",\"uri\":\"http://www.w3.org/2001/XMLSchema#string\"},\"templates\":[\"Producer\"],\"predicate\":{\"uri\":\"http://stardog.com/tutorial/born\",\"template\":{\"prefix\":\"stardog\",\"name\":\"born\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"bnode\",\"type\":\"uncertain-around-date\"}}},\"objects\":[]}],\"templates\":[{\"prefix\":\"stardog\",\"name\":\"Producer\",\"predicates\":[{\"prefix\":\"rdf\",\"name\":\"type\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"selector\",\"type\":\"type-selector\"}},{\"prefix\":\"stardog\",\"name\":\"name\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"literal\",\"type\":\"literal-text\"}},{\"prefix\":\"stardog\",\"name\":\"description\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"literal\",\"type\":\"literal-textarea\"}},{\"prefix\":\"stardog\",\"name\":\"born\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"bnode\",\"type\":\"uncertain-around-date\"}}]}],\"id\":\"node_31\",\"type\":\"uri\",\"value\":\"\"}";
                },
                setData: () => {}
            , 
            effectAllowed: 'move' }
        });


        let workspace = screen.getByTestId("workspace-reactflow");
        let assetPanel = screen.getByTestId("asset-panel");
        expect(screen.getByTestId("workspace-container")).toBeInTheDocument();
        expect(assetPanel).toBeInTheDocument();
        /* DRAG n DROP new individual on workspace */

        fireEvent.mouseEnter(assetPanel);
        let dndNodes = screen.getAllByTestId("dndnode");
        
        fireEvent.dragStart(dndNodes[0], mockDropEvent);
        fireEvent.dragEnter(workspace, mockDropEvent);        
        fireEvent.dragOver(workspace, mockDropEvent);
        fireEvent.drop(workspace, mockDropEvent);

        await screen.findByTestId("node-create");
        const uriInput = screen.getByTestId("uri-input");
        
        expect(uriInput).toBeInTheDocument();
        /* Specify the individuals URI */

        fireEvent.change(uriInput, {target: {value: "Stefan Producer"}});        

        await waitFor(() => expect(Repository.searchSimilarIndividual).toHaveBeenCalledTimes(1));

        let createButton = await screen.findByTestId("button-create-link-uri");
        expect(createButton).toBeInTheDocument();

        expect((await screen.findAllByTestId("node-update")).length).toBe(2);
        /* Click on CREATE */
        fireEvent.click(createButton);

        await waitFor(() => expect(Repository.insertIndividual).toHaveBeenCalledTimes(1));
        await waitForElementToBeRemoved(screen.queryByTestId("node-create"));

        let nodesUpdateAfter = await screen.findAllByTestId("node-update");
        expect(nodesUpdateAfter.length).toBe(3);   

    });

    it('Workspace Component | Asset Panel | Link Node | Drag n Drop', async () => {
        render(
            <MainProvider>
                <Workspace
                    graphData={{
                        nodes: data.nodes,
                        edges: data.edges
                    }}
                />
            </MainProvider>
        );

        Repository.insertIndividual.mockResolvedValueOnce({});
        Repository.searchSimilarIndividual.mockResolvedValue([{
            s: {
              type: "uri",
              value: "http://stardog.com/tutorial/teofanovic_stefan",
            },
            types: {
              type: "literal",
              value: "http://stardog.com/tutorial/Songwriter",
              values: {
                prefixed: [
                  "stardog:Songwriter",
                ],
                uris: [
                  "http://stardog.com/tutorial/Songwriter",
                ],
              },
            },
          }]);

        Repository.getReactFlowData.mockResolvedValueOnce({
            nodes: [data.nodes[0]],
            edges: []
        });

        const mockDropEvent = new window.Event("drop")
        Object.assign(mockDropEvent, {
            dataTransfer: { 
                getData: () => {
                    return "{\"attributes\":[{\"field\":\"selector\",\"datatype\":{\"prefix\":\"xsd\",\"name\":\"string\",\"uri\":\"http://www.w3.org/2001/XMLSchema#string\"},\"templates\":[\"Producer\"],\"predicate\":{\"uri\":\"http://www.w3.org/1999/02/22-rdf-syntax-ns#type\",\"template\":{\"prefix\":\"rdf\",\"name\":\"type\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"selector\",\"type\":\"type-selector\"}}},\"objects\":[{\"type\":\"uri\",\"value\":\"http://stardog.com/tutorial/Producer\"}]},{\"field\":\"literal\",\"datatype\":{\"prefix\":\"xsd\",\"name\":\"string\",\"uri\":\"http://www.w3.org/2001/XMLSchema#string\"},\"templates\":[\"Producer\"],\"predicate\":{\"uri\":\"http://stardog.com/tutorial/name\",\"template\":{\"prefix\":\"stardog\",\"name\":\"name\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"literal\",\"type\":\"literal-text\"}}},\"objects\":[]},{\"field\":\"literal\",\"datatype\":{\"prefix\":\"xsd\",\"name\":\"string\",\"uri\":\"http://www.w3.org/2001/XMLSchema#string\"},\"templates\":[\"Producer\"],\"predicate\":{\"uri\":\"http://stardog.com/tutorial/description\",\"template\":{\"prefix\":\"stardog\",\"name\":\"description\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"literal\",\"type\":\"literal-textarea\"}}},\"objects\":[]},{\"field\":\"bnode\",\"datatype\":{\"prefix\":\"xsd\",\"name\":\"string\",\"uri\":\"http://www.w3.org/2001/XMLSchema#string\"},\"templates\":[\"Producer\"],\"predicate\":{\"uri\":\"http://stardog.com/tutorial/born\",\"template\":{\"prefix\":\"stardog\",\"name\":\"born\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"bnode\",\"type\":\"uncertain-around-date\"}}},\"objects\":[]}],\"templates\":[{\"prefix\":\"stardog\",\"name\":\"Producer\",\"predicates\":[{\"prefix\":\"rdf\",\"name\":\"type\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"selector\",\"type\":\"type-selector\"}},{\"prefix\":\"stardog\",\"name\":\"name\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"literal\",\"type\":\"literal-text\"}},{\"prefix\":\"stardog\",\"name\":\"description\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"literal\",\"type\":\"literal-textarea\"}},{\"prefix\":\"stardog\",\"name\":\"born\",\"grouping\":\"attribute\",\"editor\":{\"field\":\"bnode\",\"type\":\"uncertain-around-date\"}}]}],\"id\":\"node_31\",\"type\":\"uri\",\"value\":\"\"}";
                },
                setData: () => {}
            , 
            effectAllowed: 'move' }
        });


        let workspace = screen.getByTestId("workspace-reactflow");
        let assetPanel = screen.getByTestId("asset-panel");
        expect(screen.getByTestId("workspace-container")).toBeInTheDocument();
        expect(assetPanel).toBeInTheDocument();

        /* DRAG n DROP new individual on workspace */
        
        fireEvent.mouseEnter(assetPanel);
        
        let dndNodes = screen.getAllByTestId("dndnode");
        
        fireEvent.dragStart(dndNodes[0], mockDropEvent);
        fireEvent.dragEnter(workspace, mockDropEvent);
        fireEvent.dragOver(workspace, mockDropEvent);
        fireEvent.drop(workspace, mockDropEvent);
    

        /* Type individual URI in node create -> to be the same as existing individual */
        await screen.findByTestId("node-create");
        const uriInput = screen.getByTestId("uri-input");
        expect(uriInput).toBeInTheDocument();
        
        fireEvent.change(uriInput, {target: {value: "teofanovic_stefan"}});
        

        await waitFor(() => expect(Repository.searchSimilarIndividual).toHaveBeenCalledTimes(1));
        

        /* Click on "LINK" button */
        let linkButton = await screen.findByTestId("button-create-link-uri");
        expect(linkButton).toBeInTheDocument();
        expect(await screen.findByText("LINK")).toBeInTheDocument();
        expect((await screen.findAllByTestId("node-update")).length).toBe(2);

        fireEvent.click(linkButton);
        
        await waitFor(() => expect(Repository.getReactFlowData).toHaveBeenCalledTimes(1));
        await waitForElementToBeRemoved(screen.queryByTestId("node-create"));
        
        /* Check that no insert node is on workspace and the number of update nodes on workspace */
        let nodesUpdateAfter = await screen.findAllByTestId("node-update");
        expect(nodesUpdateAfter.length).toBe(2);   
        //expect(screen.queryByTestId("node-create")).not.toBeInTheDocument();
    });
});