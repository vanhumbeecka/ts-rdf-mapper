import {RdfMapper} from '../src/RdfMapper';
import {PersonNonPrefixed} from './models/nonPrefixModels';

const shouldLogResult = false;

function logResult(assertName: string, result: any) {
    if (shouldLogResult) {
        console.log(`Expectation: ${assertName}`);
        console.log(`Result:\n${result}`);
    }
}

describe('Serialize without using prefixes', () => {
    it('Should serialize basic types', () => {
        const p = new PersonNonPrefixed();
        p.uuid = 'Anton';
        p.name = 'Anton';
        p.englishName = 'Antony';
        p.gender = 'M';
        p.age = 32;
        p.isAdult = true;
        p.weight = 95.5;
        p.height = 198.5;
        p.buoyancy = 53.2;

        const b = RdfMapper.serialize(p);
        expect(b).toContain(`<http://example.com/Person/Anton> a <http://xmlns.com/foaf/0.1/Person>;`);
        expect(b).toContain(`<http://example.com/Person/name> "Anton"^^xsd:string, "Antony"@en;`);
        expect(b).toContain(`<http://example.com/Person/gender> "M"^^xsd:string;`);
        expect(b).toContain(`<http://example.com/Person/age> "32"^^xsd:int;`);
        expect(b).toContain(`<http://example.com/Person/isAdult> "true"^^xsd:boolean;`);
        expect(b).toContain(`<http://example.com/Person/weight> "95.5"^^xsd:double;`);
        expect(b).toContain(`<http://example.com/Person/height> "198.5"^^xsd:long;`);
        expect(b).toContain(`<http://example.com/Person/buoyancy> "53.2"^^xsd:float.`);
        logResult('Should serialize basic types', b);
    });
});
