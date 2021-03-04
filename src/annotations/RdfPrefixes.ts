import 'reflect-metadata';
import {IRdfPrefixes} from './interfaces/IRdfPrefixes';

/**
 * Responsible of defining prefixes and it's corresponding URIs
 *
 * Basic usage example:
 *
 * ```ts
 * @RdfPrefixes({
 *   foaf: 'http://xmlns.com/foaf/0.1/',
 *   person: 'http://example.com/Person/'
 * })
 * export class Person {
 *
 * }
 * ```
 */
export const RdfPrefixes = (prefixes?: IRdfPrefixes): ClassDecorator => {
    // example: https://github.com/nestjs/nest/blob/ba37eee5b0c0e01ede3f8ed5d0d12b827545d0eb/packages/common/decorators/core/controller.decorator.ts

    return (target: any) => {
        // save a reference to the original constructor
        const original = target;

        // a utility function to generate instances of a class
        // https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible?page=1&tab=votes#tab-top
        function construct(constructor, args) {
            return new (Function.prototype.bind.apply(constructor, args));
        }

        // the new constructor behaviour
        const f: any = function (...args) {
            return construct(original, args);
        };

        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;
        Reflect.defineMetadata('RdfPrefixes', prefixes, f.prototype);
        return f;
    };
};
