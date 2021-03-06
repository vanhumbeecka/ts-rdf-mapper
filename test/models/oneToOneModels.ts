import {RdfBean} from '../../src/annotations/RdfBean';
import {RdfPrefixes} from '../../src/annotations/RdfPrefixes';
import {RdfProperty} from '../../src/annotations/RdfProperty';
import {RdfSubject} from '../../src/annotations/RdfSubject';
import {XSDDataType} from '../../src/annotations/XSDDataType';

@RdfPrefixes({
    foaf: 'http://xmlns.com/foaf/0.1/',
    address: 'http://xmlns.com/foaf/0.1/address/'
})
@RdfBean('foaf:Address')
export class Address {
    @RdfSubject('address')
    public uuid: string;

    @RdfProperty({predicate: 'address:streetName', xsdType: XSDDataType.XSD_STRING})
    public streetName: string;
}

@RdfPrefixes({
    foaf: 'http://xmlns.com/foaf/0.1/',
    person: 'http://example.com/Person/'
})
@RdfBean('foaf:Person')
export class PersonHasAddress {

    @RdfSubject('person')
    public uuid: string;

    @RdfProperty({predicate: 'person:name', xsdType: XSDDataType.XSD_STRING})
    public name: string;

    @RdfProperty({predicate: 'person:hasAddress', clazz: Address})
    public address: Address;

}

export const oneToOneRelationship = `
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix person: <http://example.com/Person/>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix address: <http://xmlns.com/foaf/0.1/address/>.

person:person-uuid a foaf:Person;
    person:name "John"^^xsd:string.
    person:person-uuid person:hasAddress address:address-uuid.

address:address-uuid a foaf:Address;
    address:streetName "Jasmine"^^xsd:string.
`;
