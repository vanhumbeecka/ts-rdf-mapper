import {IRDFSerializer} from '../../src/annotations/interfaces/IRDFSerializer';
import {RdfBean} from '../../src/annotations/RdfBean';
import {RdfPrefixes} from '../../src/annotations/RdfPrefixes';
import {RdfProperty} from '../../src/annotations/RdfProperty';
import {RdfSubject} from '../../src/annotations/RdfSubject';
import {XSDDataType} from '../../src/annotations/XSDDataType';

export class RegistrationDateSerializer implements IRDFSerializer {
    serialize(value: number): string {
        return new Date(value).toISOString();
    }
}

export class BirthDateSerializer implements IRDFSerializer {
    serialize(value: Date): string {
        return value.toISOString();
    }
}

@RdfPrefixes({
    foaf: 'http://xmlns.com/foaf/0.1/',
    user: 'http://example.com/User/'
})
@RdfBean('foaf:User')
export class User {
    @RdfSubject('user')
    public uuid: string;

    @RdfProperty({predicate: 'user:registrationDate', xsdType: XSDDataType.XSD_DATE_TIME, serializer: RegistrationDateSerializer})
    public regDate: number;

    @RdfProperty({predicate: 'user:birthday', xsdType: XSDDataType.XSD_DATE_TIME})
    public birthDate: Date;
}
