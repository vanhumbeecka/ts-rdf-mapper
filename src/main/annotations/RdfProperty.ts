import 'reflect-metadata';
import {IRdfProperty} from './interfaces/IRdfProperty';
import {IRdfPropertyMetadata} from './interfaces/IRdfPropertyMetadata';

const makeRDFPropertyMapper = <T>(prototype: any, key: string, prop: any, mapper: (value: any) => T) => {
    const values = new Map<any, T>();

    const rdfPropertyMetaData: IRdfPropertyMetadata[] = Reflect.getMetadata('RdfProperty-non-instance', prototype) || [];
    rdfPropertyMetaData.push({key: key, val: null, decoratorMetadata: prop});
    Reflect.defineMetadata('RdfProperty-non-instance', rdfPropertyMetaData, prototype);

    Object.defineProperty(prototype, key, {
        set(firstValue: any) {
            Object.defineProperty(this, key, {
                get() {
                    return values.get(this);
                },
                set(value: any) {
                    values.set(this, mapper(value));
                    const s: IRdfPropertyMetadata[] = Reflect.getMetadata('RdfProperty', this) || [];
                    if (value) {
                        s.push({key: key, val: value, decoratorMetadata: prop});
                    }
                    // console.log('define metadata')
                    // Define or redefine metadata for current instance
                    Reflect.defineMetadata('RdfProperty', s, this);
                },
                enumerable: true,
            });
            this[key] = firstValue;
        },
        enumerable: true,
        configurable: true,
    });
};

export const RdfProperty = (prop: IRdfProperty) => {
    return (target: Object, key: string) => {
        makeRDFPropertyMapper(target, key, prop, (value: any) => {

            return value;
        });
    };
}

