import {Literal, NamedNode, Triple} from 'n3';
import {
    AbstractBNodeSerializer
} from '../../src/annotations/interfaces/AbstractBNodeSerializer';
import {RdfBean} from '../../src/annotations/RdfBean';
import {RdfPrefixes} from '../../src/annotations/RdfPrefixes';
import {RdfProperty} from '../../src/annotations/RdfProperty';
import {RdfSubject} from '../../src/annotations/RdfSubject';

export interface UAddress {
    streetName: string;
    streetNumber: number;
    isRegistered: boolean;
}

export class AddressSerializer extends AbstractBNodeSerializer {

    constructor() {
        super();
        this.addPrefix('address', 'http://example.com/Address/');
    }

    serialize(value: any): Triple[] {
        const triples: Triple[] = [];

        triples.push(this.createTriple(this.subject, this.xsdType, this.makeResourceIRI('address:1234')));

        Object.keys(value).forEach(key => {
            const predicate: NamedNode = this.makePredicate(`address:${key}`);
            let obj: Literal;
            // if value is a string
            if (typeof (value[key]) === 'string') {
                obj = this.makeLiteralWithDataType(value[key], 'xsd:string');
            }
            // If value is boolean
            if (typeof (value[key]) === 'boolean') {
                obj = this.makeLiteralWithDataType(value[key], 'xsd:boolean');
            }
            // if value is number
            if (typeof (value[key]) === 'number') {
                obj = this.makeLiteralWithDataType(value[key], 'xsd:integer');
            }
            triples.push(this.createTriple(this.subject, predicate, obj));
        });

        return triples;
    }

}

@RdfPrefixes({
    foaf: 'http://xmlns.com/foaf/0.1/',
    user: 'http://example.com/User/'
})
@RdfBean('foaf:User')
export class UserJsonObject {
    @RdfSubject('user')
    public name: string;

    @RdfProperty({predicate: 'user:address', serializer: AddressSerializer})
    public address: UAddress;
}
