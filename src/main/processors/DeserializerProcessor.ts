import * as N3 from 'n3';
import * as RDF from 'rdf-js';
import {IRdfNamespaces} from '../annotations/interfaces/IRdfNamespaces';
import {IRdfPropertyMetadata} from '../annotations/interfaces/IRdfPropertyMetadata';
import {IRdfSubjectMetadata} from '../annotations/interfaces/IRdfSubjectMetadata';
import {Utils} from '../Utils';

interface QuadsAndPrefixes {
    quads: N3.Quad[];
    prefixes: N3.Prefixes;
}

export class DeserializerProcessor {

    private readonly xsdType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

    constructor() {}

    public async deserialize<T>(type: { new(): T }, ttlData: string): Promise<T> {
        let qa: QuadsAndPrefixes;
        try {
            qa = await this.getQuadsAndPrefixes(ttlData);
        } catch (e) {
            throw new Error(e);
        }
        const store: N3.N3Store = N3.Store();
        store.addQuads(qa.quads);
        const dtoInstance = this.process(type, store);

        return Promise.resolve(dtoInstance);
    }

    private process<T>(type: { new(): T }, store: N3.N3Store, object?: RDF.Term): T {
        const dtoInstance = new type();

        const ns: IRdfNamespaces = Reflect.getMetadata('RdfNamespaces', type.prototype);
        const beanType: string = Reflect.getMetadata('RdfBean', type.prototype);
        const properties: IRdfPropertyMetadata[] = Reflect.getMetadata('RdfProperty-non-instance', type.prototype);
        const subject: IRdfSubjectMetadata = Reflect.getMetadata('RdfSubject-non-instance', type.prototype);

        const numTriples: N3.Quad[] = this.getNumTriplesByBeanType(beanType, store, ns);
        if (numTriples.length > 0) {
            const triple: N3.Quad = numTriples[0];
            // Get URI and set the value for key which contains @RdfSubject annotation
            if (subject) {
                dtoInstance[subject.key] = Utils.getUUIDFromResourceSubject(triple.subject.value, subject.prop, ns);
            }
            properties.forEach((rdfProp: IRdfPropertyMetadata) => {
                let objects: RDF.Term[];
                if (object) {
                    objects = store.getObjects(object, N3.DataFactory.namedNode(Utils.getUriFromPrefixedName(rdfProp.decoratorMetadata.predicate, ns)), null);
                } else {
                    objects = store.getObjects(triple.subject, N3.DataFactory.namedNode(Utils.getUriFromPrefixedName(rdfProp.decoratorMetadata.predicate, ns)), null);
                }
                if (objects.length > 0) {
                    const ob: RDF.Term = objects[0];
                    if (N3.Util.isLiteral(ob)) {
                        dtoInstance[rdfProp.key] = ob.value;
                    }

                    if (N3.Util.isNamedNode(ob) || N3.Util.isBlankNode(ob)) {
                        if (rdfProp.decoratorMetadata.isArray) {
                            const holder = [];
                            objects.forEach(o => {
                                const res = this.process(rdfProp.decoratorMetadata.clazz, store, o);
                                holder.push(res);
                            });
                            dtoInstance[rdfProp.key] = holder;
                        } else {
                            const res = this.process(rdfProp.decoratorMetadata.clazz, store, ob);
                            dtoInstance[rdfProp.key] = res;
                        }
                    }
                }
            });

        }

        return dtoInstance;

    }

    private getNumTriplesByBeanType(beanType: string, store: N3.N3Store, ns: IRdfNamespaces): N3.Quad[] {
        let numTriples: N3.Quad[];
        if (beanType) {
            const beanTypeUri = Utils.getUriFromPrefixedName(beanType, ns); // - this can be undefined
            numTriples = store.getQuads(null, N3.DataFactory.namedNode(this.xsdType), N3.DataFactory.namedNode(beanTypeUri), null);
        } else {
            numTriples = store.getQuads(null, null, null, null);
        }

        return numTriples;
    }

    private async getQuadsAndPrefixes(ttlData: string): Promise<QuadsAndPrefixes> {
        const parser: N3.N3Parser = new N3.Parser();
        return new Promise<QuadsAndPrefixes>((resolve, reject) => {
            const quads: N3.Quad[] = [];
            parser.parse(ttlData, (e: Error, q: N3.Quad, p: N3.Prefixes) => {
                if (e) {
                    reject(e);
                }

                if (q) {
                    quads.push(q);
                } else {
                    resolve({quads: quads, prefixes: p});
                }
            });
        });
    }

}
