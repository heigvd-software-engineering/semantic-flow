import React from 'react';
import {
    render, cleanup, act, fireEvent, waitFor, screen, getByTestId
} from '@testing-library/react';
import data from './data/attribute.data.json';

import Attribute from '../../main/workspace/attribute/Attribute';
import { MainProvider } from '../../context/MainContext';
import Repository from '../../core/dal/Repository';

jest.mock('../../core/dal/Repository');
jest.mock('../../config/config.json');

describe('Attribute Component', () => {
    
    it('Attribute Component | All attribute layout components rendered', () => {
        render(<Attribute
            subject={data.subject}
            attribute={data.type_selector_attribute}
        />);
        expect(screen.getByTestId("attribute-container")).toBeInTheDocument();
        expect(screen.getByTestId("attribute-header")).toBeInTheDocument();
        expect(screen.getByTestId("attribute-field")).toBeInTheDocument();
    });

    it('Attribute Component | Attribute Type | header rendered', () => {
        render(<Attribute
            subject={data.subject}
            attribute={data.type_selector_attribute}
        />);
        
        expect(screen.getByText("rdf:type")).toBeInTheDocument();
        expect(screen.getByText("stardog:Songwriter")).toBeInTheDocument();
    });

    it('Attribute Component | Attribute Type | ViewMode View->Edit', () => {
        render(
            <MainProvider>
                <Attribute
                    subject={data.subject}
                    attribute={data.type_selector_attribute}
                />
            </MainProvider>
        );
        let container = screen.getByTestId("attribute-container");
        expect(screen.getByText("rdf:type")).toBeInTheDocument();
        expect(screen.getByText("stardog:Songwriter")).toBeInTheDocument();

        expect(container.classList.contains('view')).toBe(true);
        expect(container.classList.contains('edit')).toBe(false);
        fireEvent.click(screen.getByTestId("attribute-container"));
        expect(container.classList.contains('view')).toBe(false);
        expect(container.classList.contains('edit')).toBe(true);

    });

    it('Attribute Component | Attribute Type | Individual Type Update', async () => {
        render(
            <MainProvider>
                <Attribute
                    subject={data.subject}
                    attribute={data.type_selector_attribute}
                />
            </MainProvider>
        );

        let container = screen.getByTestId("attribute-container");
        expect(screen.getByTitle("<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>")).toBeInTheDocument();
        expect(screen.getByTitle("<http://stardog.com/tutorial/Songwriter>")).toBeInTheDocument();
        expect(screen.queryByTitle("<http://stardog.com/tutorial/Producer>")).not.toBeInTheDocument();

        expect(container.classList.contains('view')).toBe(true);
        expect(container.classList.contains('edit')).toBe(false);
        fireEvent.click(screen.getByTestId("attribute-container"));
        expect(container.classList.contains('view')).toBe(false);
        expect(container.classList.contains('edit')).toBe(true);

        let checkboxes = screen.getAllByTestId("checkbox");

        expect(checkboxes.length).toBe(3); // for 3 template classes

        expect(checkboxes[0].classList.contains('checked')).toBe(true);
        expect(checkboxes[1].classList.contains('checked')).toBe(false);
        expect(checkboxes[2].classList.contains('checked')).toBe(false);

        fireEvent.click(checkboxes[1]);
        expect(checkboxes[0].classList.contains('checked')).toBe(true);
        expect(checkboxes[1].classList.contains('checked')).toBe(true);
        expect(checkboxes[2].classList.contains('checked')).toBe(false);

        let saveButton = screen.getByTestId("tinybutton-save-attribute");
        
        Repository.updateReactFlowData.mockResolvedValueOnce({
            "nodes":[],
            "edges":[]
        });
        
        fireEvent.click(saveButton);
        
        await waitFor(() => expect(container.classList.contains('view')).toBe(true));
        await waitFor(() => expect(container.classList.contains('edit')).toBe(false));
        
        expect(screen.getByTitle("<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>")).toBeInTheDocument();
        expect(screen.getByTitle("<http://stardog.com/tutorial/Songwriter>")).toBeInTheDocument();
        expect(screen.getByTitle("<http://stardog.com/tutorial/Producer>")).toBeInTheDocument();
        
    });

    it('Attribute Component | Attribute Literal | Literal Text Change', async () => {
        render(
            <MainProvider>
                <Attribute
                    subject={data.subject}
                    attribute={data.literal_text_attribute}
                />
            </MainProvider>
        );

        let container = screen.getByTestId("attribute-container");
        expect(screen.getByText("stardog:name")).toBeInTheDocument();
        expect(screen.getByText("Teofanovic Stefan")).toBeInTheDocument();

        expect(container.classList.contains('view')).toBe(true);
        expect(container.classList.contains('edit')).toBe(false);
        fireEvent.click(screen.getByTestId("attribute-container"));
        expect(container.classList.contains('view')).toBe(false);
        expect(container.classList.contains('edit')).toBe(true);

        let input = screen.getByTestId("literal-text-input");
        expect(input.value).toBe("Teofanovic Stefan");
        fireEvent.change(input, {target: {value: "Teofanovic Stefanov"}});
        expect(input.value).toBe("Teofanovic Stefanov");

        let saveButton = screen.getByTestId("tinybutton-save-attribute");

        fireEvent.click(saveButton);

        await waitFor(() => expect(container.classList.contains('view')).toBe(true));
        await waitFor(() => expect(container.classList.contains('edit')).toBe(false));

        expect(screen.getByText("stardog:name")).toBeInTheDocument();
        expect(screen.getByText("Teofanovic Stefanov")).toBeInTheDocument();
    });

    it('Attribute Component | Attribute Literal | Literal Text Delete', async () => {
        render(
            <MainProvider>
                <Attribute
                    subject={data.subject}
                    attribute={data.literal_text_attribute}
                />
            </MainProvider>
        );

        let container = screen.getByTestId("attribute-container");
        expect(screen.getByText("stardog:name")).toBeInTheDocument();
        expect(screen.getByText("Teofanovic Stefan")).toBeInTheDocument();

        expect(container.classList.contains('view')).toBe(true);
        expect(container.classList.contains('edit')).toBe(false);
        act(() => {
            fireEvent.click(screen.getByTestId("attribute-container"));
        });
        expect(container.classList.contains('view')).toBe(false);
        expect(container.classList.contains('edit')).toBe(true);

        let input = screen.getByTestId("literal-text-input");
        expect(input.value).toBe("Teofanovic Stefan");
        act(() => {
            fireEvent.change(input, {target: {value: ""}});
        });
        
        expect(input.value).toBe("");
        
        let saveButton = screen.getByTestId("tinybutton-save-attribute");

        act(() => {
            fireEvent.click(saveButton);
        });

        await waitFor(() => expect(container.classList.contains('missing')).toBe(true));
        await waitFor(() => expect(container.classList.contains('view')).toBe(false));
        await waitFor(() => expect(container.classList.contains('edit')).toBe(false));

        expect(screen.getByText("stardog:name")).toBeInTheDocument();
        
    });

    it('Attribute Component | Attribute Literal | Literal Text Multi Value', async () => {
        render(
            <MainProvider>
                <Attribute
                    subject={data.subject}
                    attribute={data.literal_text_attribute}
                />
            </MainProvider>
        );

        let container = screen.getByTestId("attribute-container");
        expect(screen.getByText("stardog:name")).toBeInTheDocument();
        expect(screen.getByText("Teofanovic Stefan")).toBeInTheDocument();

        expect(container.classList.contains('view')).toBe(true);
        expect(container.classList.contains('edit')).toBe(false);
        fireEvent.click(screen.getByTestId("attribute-container"));
        expect(container.classList.contains('view')).toBe(false);
        expect(container.classList.contains('edit')).toBe(true);

        expect(screen.getAllByTestId("literal-text-input").length).toBe(1);

        let addValue = screen.getByTestId("literal-multivalue-add");
        expect(addValue).toBeInTheDocument();
        fireEvent.click(addValue);
        
        expect(screen.getAllByTestId("literal-text-input").length).toBe(2);

        let inputs = screen.getAllByTestId("literal-text-input");
        expect(inputs[0].value).toBe("Teofanovic Stefan");
        expect(inputs[1].value).toBe("");
        fireEvent.change(inputs[1], {target: {value: "Teofanovic Stefanov"}});
        expect(inputs[1].value).toBe("Teofanovic Stefanov");

        let saveButton = screen.getByTestId("tinybutton-save-attribute");
        fireEvent.click(saveButton);

        await waitFor(() => expect(container.classList.contains('view')).toBe(true));
        await waitFor(() => expect(container.classList.contains('edit')).toBe(false));

        expect(screen.getByText("stardog:name")).toBeInTheDocument();
        expect(screen.getByText("Teofanovic Stefan")).toBeInTheDocument();
        expect(screen.getByText("Teofanovic Stefanov")).toBeInTheDocument();
        
    });

});