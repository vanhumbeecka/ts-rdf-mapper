import {RdfBean} from '../../src/annotations/RdfBean';
import {RdfPrefixes} from '../../src/annotations/RdfPrefixes';
import {RdfProperty} from '../../src/annotations/RdfProperty';
import {RdfSubject} from '../../src/annotations/RdfSubject';
import {XSDDataType} from '../../src/annotations/XSDDataType';

@RdfPrefixes({
    foaf: 'http://xmlns.com/foaf/0.1/',
    person: 'http://example.com/Person/'
})
@RdfBean('foaf:Person')
export class PersonTypeAndLang {
    @RdfSubject('person')
    public uuid: string;

    @RdfProperty({predicate: 'foaf:firstName', xsdType: XSDDataType.XSD_STRING, lang: 'en'})
    firstName: string;

}

@RdfPrefixes({
    foaf: 'http://xmlns.com/foaf/0.1/',
    person: 'http://example.com/Person/'
})
@RdfBean('foaf:Person')
export class PersonTypeAndIsIRI {
    @RdfSubject('person')
    public uuid: string;

    @RdfProperty({predicate: 'foaf:firstName', xsdType: XSDDataType.XSD_STRING, isIRI: true})
    firstName: string;

}
