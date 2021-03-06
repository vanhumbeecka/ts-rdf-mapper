import {IllegalArgumentError} from '../src/exceptions/IllegalArgumentError';
import {TurtleParseError} from '../src/exceptions/TurtleParseError';
import {RdfMapper} from '../src/RdfMapper';
import {invalidTTL, Person} from './models/models';
import {PersonTypeAndIsIRI, PersonTypeAndLang} from './models/wrongfullyAnnotatedModel';

const shouldLogResult = false;

function logResult(assertName: string, result: any) {
    if (shouldLogResult) {
        console.log(`Expectation: ${assertName}`);
        console.log(`Result:\n${result}`);
    }
}

describe('Meaningful Exceptions should be thrown', () => {
    it('Should throw TurtleParseError when turtle is invalid', async (done) => {
        try {
            const instance: Person = await RdfMapper.deserializeAsync(Person, invalidTTL);
        } catch (e) {
            expect(e instanceof TurtleParseError).toBeTruthy();
            expect(e.name).toEqual('TurtleParseError');
        }
        done();
    });

    it('Should throw IllegalArgumentError when xsdType and lang are both present', () => {
        const p: PersonTypeAndLang = new PersonTypeAndLang();
        p.firstName = 'John';
        try {
            RdfMapper.serialize(p);
        } catch (e) {
            expect(e instanceof IllegalArgumentError).toBeTruthy();
            expect(e.name).toEqual('IllegalArgumentError');
            expect(e.message).toEqual('Key firstName cannot have both lang and xsdType present inside the decorator');
        }
    });

    it('Should throw IllegalArgumentError when xsdType and isIRI are both present', () => {
        const p: PersonTypeAndIsIRI = new PersonTypeAndIsIRI();
        p.firstName = 'John';
        try {
            RdfMapper.serialize(p);
        } catch (e) {
            expect(e instanceof IllegalArgumentError).toBeTruthy();
            expect(e.name).toEqual('IllegalArgumentError');
            expect(e.message).toEqual('Key firstName cannot have both lang or xsdType present when isIRI is set to true inside the decorator');
        }
    });

    it('Should throw Error if no decorators present', () => {
        class NoDec {
            index: number;
            name: string;
        }

        const n: NoDec = new NoDec();
        n.index = 0;
        n.name = 'test';
        try {
            const r = RdfMapper.serialize(n);
        } catch (e) {
            expect(e instanceof Error).toBeTruthy();
            expect(e.message).toEqual('No decorators found');
        }
    });
});
