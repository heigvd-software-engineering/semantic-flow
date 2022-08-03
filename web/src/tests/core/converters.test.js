import triples from './data/triples.json';	 
import { reactFlowGraphDataConverter, rawGraphDataConverter  } from '../../core/converters';
import Config from '../../config/config';
/*
expect(oneObj).toMatchObject({name: 'component name'}) // true
expect(oneObj).toHaveProperty('name')
expect(oneObj).toHaveProperty('name', 'component name')
*/
jest.mock('../../config/config.json');

describe('Core - Converters', () => {

    let reactFlowGraphdata = {};
    let rawGraphdata = {};

    beforeAll(() => {
        reactFlowGraphdata = reactFlowGraphDataConverter(
            triples.song_with_2_songwriters.triples, 
            triples.song_with_2_songwriters.active_location.value
        );
        rawGraphdata = rawGraphDataConverter(
            triples.song_with_2_songwriters.triples
        );
    });

    it('Convert Triples into ReactFlow data : Number of nodes and edges', () => {
        let { nodes, edges } = reactFlowGraphdata;
        expect(nodes.length).toEqual(3);
        expect(edges.length).toEqual(2);
    });

    it('Convert Triples into ReactFlow data : Nodes and edges - ReactFlow Meta', () => {
        let { nodes, edges } = reactFlowGraphdata;
        expect(nodes[0].id).toEqual('node_0');
        expect(nodes[0].type).toEqual('nodeUpdate');
        
        expect(nodes[1].id).toEqual('node_9');
        expect(nodes[1].type).toEqual('nodeUpdate');
        
        expect(edges[0].id).toEqual('edge_10-node_0-node_9');
        expect(edges[0].source).toEqual('node_0');
        expect(edges[0].target).toEqual('node_9');
        expect(edges[0].type).toEqual('edgeUpdate');

        expect(edges[1].id).toEqual('edge_12-node_0-node_11');
        expect(edges[1].source).toEqual('node_0');
        expect(edges[1].target).toEqual('node_11');
        expect(edges[1].type).toEqual('edgeUpdate');
    });

    it('Convert Triples into ReactFlow data : Nodes Positioning - Horizontal/Vertical Spacing and Offset', () => {
        let { nodes } = reactFlowGraphdata;
        let rootPosition = Config.getReactFlowRootPosition();
        expect(nodes[0].position).toEqual(rootPosition);
        expect(nodes[1].position).toEqual({
            x: rootPosition.x + Config.getReactFlowHorizontalSpacing(), 
            y: rootPosition.y
        });
        expect(nodes[2].position).toEqual({
            x: rootPosition.x + Config.getReactFlowHorizontalSpacing() + Config.getReactFlowOffset(), 
            y: rootPosition.y + Config.getReactFlowVerticalSpacing()
        });
    });
    
    it('Convert Triples into ReactFlow data : Bnode Default Conversion - Lat Lon', () => {
        let reactFlowBnode = reactFlowGraphDataConverter(
            triples.default_bnode_lat_lon.triples, 
            triples.default_bnode_lat_lon.active_location.value
        );

        expect(reactFlowBnode.nodes.length).toEqual(1);

        let node = reactFlowBnode.nodes[0];
        expect(node.data).toBeDefined();
        expect(node.data.attributes.length).toEqual(2);

        for(const attribute of node.data.attributes) {
            expect(attribute.objects.length).toEqual(1);
            expect(attribute.predicate).toBeDefined();
            expect(attribute.templates.length).toEqual(0);
        }

        expect(node.data.attributes[0].objects[0].value).toEqual('34.456');
        expect(node.data.attributes[1].objects[0].value).toEqual('12.345');
    });

    it('Convert Triples into ReactFlow data : Bnode Default Conversion - Nested - Uncertain Around Date', () => {
        let reactFlowBnode = reactFlowGraphDataConverter(
            triples.default_bnode_uncertain_around_date.triples, 
            triples.default_bnode_uncertain_around_date.active_location.value
        );

        expect(reactFlowBnode.nodes.length).toEqual(2);

        let dateNode = reactFlowBnode.nodes[0];
        let uncertaintyNode = reactFlowBnode.nodes[1];
        expect(dateNode.data).toBeDefined();
        expect(dateNode.data.attributes.length).toEqual(1);

        expect(dateNode.data.attributes[0].objects[0].value).toEqual('1986.7.29');

        expect(uncertaintyNode.data).toBeDefined();
        expect(uncertaintyNode.data.attributes.length).toEqual(3);
        expect(uncertaintyNode.data.attributes[0].objects[0].value).toEqual('0');
        expect(uncertaintyNode.data.attributes[1].objects[0].value).toEqual('2');
        expect(uncertaintyNode.data.attributes[2].objects[0].value).toEqual('4');
    });

    it('Convert Triples into ReactFlow data : Bnode Template Conversion - Lat Lon', () => {
        let reactFlowBnode = reactFlowGraphDataConverter(
            triples.template_bnode_lat_lon.triples, 
            triples.template_bnode_lat_lon.active_location.value
        );

        expect(reactFlowBnode.nodes.length).toEqual(1);

        let node = reactFlowBnode.nodes[0];
        expect(node.data).toBeDefined();
        expect(node.data.attributes.length).toEqual(6);

        let bnodeAttribute = node.data.attributes.find(attribute => attribute.predicate.uri === 'http://stardog.com/tutorial/geographic_coordinates');

        expect(bnodeAttribute).toBeDefined();
        expect(bnodeAttribute.objects.length).toEqual(1);

        let bnodeObject = bnodeAttribute.objects[0];
        expect(bnodeObject.bnode_type).toEqual('bnode-individual');
        expect(bnodeObject.predicate).toEqual('http://stardog.com/tutorial/geographic_coordinates');
        expect(bnodeObject.label).toEqual('b0');
        expect(bnodeObject.data).toBeDefined();
        
        let latitude = bnodeObject.data.latitude;
        expect(latitude).toBeDefined();
        expect(latitude.bnode_type).toEqual('bnode-link');
        expect(latitude.object).toEqual('34.456');
        expect(latitude.predicate).toEqual('http://stardog.com/tutorial/latitude');
        expect(latitude.type).toEqual('literal');

        let longitude = bnodeObject.data.longitude;
        expect(longitude).toBeDefined();
        expect(longitude.bnode_type).toEqual('bnode-link');
        expect(longitude.object).toEqual('12.345');
        expect(longitude.predicate).toEqual('http://stardog.com/tutorial/longitude');
        expect(longitude.type).toEqual('literal');
    });

    it('Convert Triples into ReactFlow data : Bnode Template Conversion - Nested - Uncertain Around Date', () => {
        let reactFlowBnode = reactFlowGraphDataConverter(
            triples.template_bnode_uncertain_around_date.triples, 
            triples.template_bnode_uncertain_around_date.active_location.value
        );

        expect(reactFlowBnode.nodes.length).toEqual(1);

        let node = reactFlowBnode.nodes[0];
        expect(node.data).toBeDefined();
        expect(node.data.attributes.length).toEqual(6);

        let bnodeAttributeDate = node.data.attributes.find(attribute => attribute.predicate.uri === 'http://stardog.com/tutorial/created');
        
        expect(bnodeAttributeDate).toBeDefined();
        expect(bnodeAttributeDate.objects.length).toEqual(1);

        let bnodeObject = bnodeAttributeDate.objects[0];
        expect(bnodeObject.bnode_type).toEqual('bnode-individual');
        expect(bnodeObject.predicate).toEqual('http://stardog.com/tutorial/created');
        expect(bnodeObject.label).toEqual('b1');
        expect(bnodeObject.data).toBeDefined();
        
        let date = bnodeObject.data.date;
        let uncerainty = bnodeObject.data.uncertainty;
        expect(date).toBeDefined();
        expect(date.bnode_type).toEqual('bnode-link');
        expect(date.object).toEqual('1986.7.29');
        expect(date.predicate).toEqual('http://stardog.com/tutorial/date');
        expect(date.type).toEqual('literal');
        expect(uncerainty).toBeDefined();
        expect(uncerainty.bnode_type).toEqual('bnode-individual');
        expect(uncerainty.predicate).toEqual('http://stardog.com/tutorial/uncertainty');
        expect(uncerainty.label).toEqual('b3');
        expect(uncerainty.data).toBeDefined();

        let day = uncerainty.data.day;
        let month = uncerainty.data.month;
        let year = uncerainty.data.year;

        expect(day).toBeDefined();
        expect(day.bnode_type).toEqual('bnode-link');
        expect(day.object).toEqual('3');
        expect(day.predicate).toEqual('http://stardog.com/tutorial/day');
        expect(day.type).toEqual('literal');
        expect(month).toBeDefined();
        expect(month.bnode_type).toEqual('bnode-link');
        expect(month.object).toEqual('2');
        expect(month.predicate).toEqual('http://stardog.com/tutorial/month');
        expect(month.type).toEqual('literal');
        expect(year).toBeDefined();
        expect(year.bnode_type).toEqual('bnode-link');
        expect(year.object).toEqual('1');
        expect(year.predicate).toEqual('http://stardog.com/tutorial/year');
        expect(year.type).toEqual('literal');
    });

    it('Convert Triples into ReactFlow data : TypeLess Individual', () => {
        let reactFlowTypeless = reactFlowGraphDataConverter(
            triples.typeless_individual.triples, 
            triples.typeless_individual.active_location.value
        );

        expect(reactFlowTypeless.nodes.length).toEqual(1);

        let node = reactFlowTypeless.nodes[0];
        expect(node.data).toBeDefined();
        expect(node.data.attributes.length).toEqual(2);

        let typeAttribute = node.data.attributes.find(attribute => attribute.predicate.uri === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        expect(typeAttribute).toBeDefined();
        expect(typeAttribute.objects.length).toEqual(0);
        expect(typeAttribute.predicate.template.editor).toEqual({
            field: 'selector',
            type: 'type-selector'
        });

        let nameAttribute = node.data.attributes.find(attribute => attribute.predicate.uri === 'http://stardog.com/tutorial/name');
        expect(nameAttribute).toBeDefined();
        expect(nameAttribute.objects.length).toEqual(1);
        expect(nameAttribute.objects[0].value).toEqual('Stefan Teofanovic');
        expect(nameAttribute.predicate.template.editor).toEqual({
            field: 'literal',
            type: 'readonly'
        });
    });

    it('Convert Triples into ReactFlow data : Attribute Grouping', () => {
        let { nodes } = reactFlowGraphdata;
        expect(nodes[0].data.attributes.length).toEqual(4);
        expect(nodes[1].data.attributes.length).toEqual(6);
        expect(nodes[1].data.attributes.length).toEqual(6);

        for(const node of nodes){
            for(const attribute of node.data.attributes){
                expect(attribute.datatype).toBeDefined();
                expect(attribute.field).toBeDefined();
                expect(attribute.objects).toBeDefined();
                expect(attribute.predicate).toBeDefined();
                expect(attribute.predicate.template.editor).toBeDefined();
                expect(attribute.predicate.template.grouping).toEqual("attribute");
                expect(attribute.templates).toBeDefined();
            }
        }
    });

    it('Convert Triples into RawGraph data : Number of nodes and edges', () => {
        let { nodes, links } = rawGraphdata;
        expect(nodes.length).toEqual(18);
        expect(links.length).toEqual(18);
    });


    it('Convert Triples into RawGraph data : Linking', () => {
        let { nodes, links } = rawGraphdata;
        expect(nodes.length).toEqual(18);
        for(const link of links) {
            expect(link.source).toBeDefined();
            expect(link.target).toBeDefined();
            expect(nodes.find((n) => n.id === link.source)).toBeDefined();
            expect(nodes.find((n) => n.id === link.target)).toBeDefined();
        }
    });
});