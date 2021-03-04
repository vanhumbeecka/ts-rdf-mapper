import {RdfBean} from '../../src/annotations/RdfBean';
import {RdfPrefixes} from '../../src/annotations/RdfPrefixes';
import {RdfProperty} from '../../src/annotations/RdfProperty';
import {XSDDataType} from '../../src/annotations/XSDDataType';

@RdfPrefixes({
    schema: 'http://schema.org/'
})
export class Video {
    @RdfProperty({predicate: 'schema:name', xsdType: XSDDataType.XSD_STRING})
    public name: string;
}

@RdfPrefixes({
    schema: 'http://schema.org/'
})
@RdfBean('schema:Recipe')
export class Recipe {
    @RdfProperty({predicate: 'schema:recipeName', xsdType: XSDDataType.XSD_STRING})
    public recipeName: string;
    @RdfProperty({predicate: 'schema:video', clazz: Video})
    public video: Video;
}
