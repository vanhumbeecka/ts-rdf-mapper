import {
    AbstractBNodeSerializer,
    RDFLiteral,
    RDFResourceIRI,
    RDFTriple
} from '../../main/annotations/interfaces/AbstractBNodeSerializer';
import {RdfBean} from '../../main/annotations/RdfBean';
import {RdfPrefixes} from '../../main/annotations/RdfPrefixes';
import {RdfProperty} from '../../main/annotations/RdfProperty';
import {RdfSubject} from '../../main/annotations/RdfSubject';

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

    serialize(value: Object): RDFTriple[] {
        const triples: RDFTriple[] = [];

        Object.keys(value).forEach(key => {
            const predicate: RDFResourceIRI = this.makePredicate(`address:${key}`);
            let obj: RDFLiteral;
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
