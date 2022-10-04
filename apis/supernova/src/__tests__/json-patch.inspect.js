import extend from 'extend';
import JSONPatch from '../json-patch';

describe('JSON-Patch', () => {
  let patchee;
  let patcheeClone;

  const hasOwn = Object.prototype.hasOwnProperty;

  beforeEach(() => {
    patchee = {
      simpleString: 'string',
      simpleNumber: 392,
      simpleBoolean: true,
      simpleArray: [392, 'string', false],
      complexArray: [
        {
          qInfo: {
            qId: 1,
          },
          simpleString: 'string1',
        },
        {
          qInfo: {
            qId: 2,
          },
          simpleString: 'string2',
        },
        {
          qInfo: {
            qId: 3,
          },
          simpleString: 'string3',
        },
      ],
      complexObject: {
        title: 'foo',
        array: [1, 2, 3],
        nestedObject: {
          foo: true,
          bar: true,
        },
      },
      qvObjectArray: [
        {
          qInfo: {
            qId: 2,
          },
          hello: 'yes',
        },
      ],
    };
    patcheeClone = extend(true, {}, patchee);
  });

  describe('Generating patches', () => {
    describe('Simple patches', () => {
      test("creates an 'add' patch", () => {
        patcheeClone.newProp = 'hello';
        const patches = JSONPatch.generate(patchee, patcheeClone);
        expect(patches.length).toBe(1);
        expect(patches[0]).toEqual({ op: 'add', path: '/newProp', value: 'hello' });
      });

      test("creates a 'replace' patch", () => {
        patcheeClone.simpleString = 'hello';
        const patches = JSONPatch.generate(patchee, patcheeClone);
        expect(patches.length).toBe(1);
        expect(patches[0]).toEqual({ op: 'replace', path: '/simpleString', value: 'hello' });
      });

      test("creates a 'replace' patch for simple arrays", () => {
        // since simple arrays has no way of identifying movement, we cannot
        // generate patches for specific items in those arrays
        const shouldEqual = [392, 'string', false, 'hello'];
        patcheeClone.simpleArray.push('hello');
        const patches = JSONPatch.generate(patchee, patcheeClone);
        expect(patches.length).toBe(1);
        expect(patches[0]).toEqual({ op: 'replace', path: '/simpleArray', value: shouldEqual });
      });

      test("creates a 'remove' patch", () => {
        delete patcheeClone.simpleString;
        const patches = JSONPatch.generate(patchee, patcheeClone);
        expect(patches.length).toBe(1);
        expect(patches[0]).toEqual({ op: 'remove', path: '/simpleString' });
      });
    });

    describe('Complex array patches', () => {
      test("creates an 'add' patch", () => {
        const shouldEqual = { qInfo: { qId: 4 } };
        patcheeClone.complexArray.push(shouldEqual);
        const patches = JSONPatch.generate(patchee, patcheeClone);
        expect(patches.length).toBe(1);
        expect(patches[0]).toEqual({ op: 'add', path: '/complexArray/3', value: shouldEqual });
      });

      test("creates a 'replace' patch", () => {
        const shouldEqual = { qInfo: { qId: 4 } };
        patcheeClone.complexArray[1] = shouldEqual;
        const patches = JSONPatch.generate(patchee, patcheeClone);
        // it's not explicitly a replace operation right now, but it creates a
        // 'remove' patch and an 'add' patch, which is what a 'replace' operation
        // basically does.
        // expect( patches.length ).toBe( 1 );
        // expect( patches[0] ).toEqual( {
        //  op: "replace", path: "/complexArray/1", value: shouldEqual
        // } );
        expect(patches.length).toBe(2);
        expect(patches[0]).toEqual({ op: 'remove', path: '/complexArray/1' });
        expect(patches[1]).toEqual({ op: 'add', path: '/complexArray/1', value: shouldEqual });
      });

      test("creates a 'remove' patch", () => {
        patcheeClone.complexArray.splice(1, 1);
        const patches = JSONPatch.generate(patchee, patcheeClone);
        expect(patches.length).toBe(1);
        expect(patches[0]).toEqual({ op: 'remove', path: '/complexArray/1' });
      });
    });

    describe('Complex object patches', () => {
      test('should generate replace and remove patches in the right order', () => {
        patcheeClone.complexObject.nestedObject.foo = false;
        delete patcheeClone.complexObject.nestedObject.bar;
        const patches = JSONPatch.generate(patchee, patcheeClone);
        expect(patches.length).toBe(2);
        expect(patches[0]).toEqual({ op: 'replace', path: '/complexObject/nestedObject/foo', value: false });
        expect(patches[1]).toEqual({ op: 'remove', path: '/complexObject/nestedObject/bar' });
      });

      test('should track QlikView-tagged objects in arrays [qInfo->qId]', () => {
        const newObj = {
          qInfo: {
            qId: 3,
          },
          bye: 'yes',
        };
        patcheeClone.qvObjectArray.splice(0, 0, newObj);
        patcheeClone.qvObjectArray[1].hello = 'no';
        const patches = JSONPatch.generate(patchee, patcheeClone);
        expect(patches.length).toBe(2);
        expect(patches[0]).toEqual({ op: 'replace', path: '/qvObjectArray/0/hello', value: 'no' });
        expect(patches[1]).toEqual({ op: 'add', path: '/qvObjectArray/0', value: newObj });
      });
    });
  });

  describe('Applying patches', () => {
    describe("Operation: 'add'", () => {
      test('adds a simple property to an object', () => {
        const patches = [{ op: 'add', path: '/prop', value: 'hello' }];
        JSONPatch.apply(patchee, patches);
        expect(patchee.prop).toBe('hello');
      });

      test('adds a complex property to an object', () => {
        const patches = [{ op: 'add', path: '/complexObject/foo', value: { bar: true } }];
        JSONPatch.apply(patchee, patches);
        expect(patchee.complexObject.foo).toEqual({ bar: true });
      });

      test('adds an item to the end of an array', () => {
        // index '-' is described in the IETF (JSONPointer) spec as the last index
        // (add new item to the end of the array)
        const patches = [{ op: 'add', path: '/simpleArray/-', value: 'last' }];
        JSONPatch.apply(patchee, patches);
        expect(patchee.simpleArray.length).toBe(4);
        expect(patchee.simpleArray[3]).toBe('last');
      });

      test('adds an item in the middle of an array', () => {
        const patches = [{ op: 'add', path: '/simpleArray/1', value: 'middle' }];
        JSONPatch.apply(patchee, patches);
        expect(patchee.simpleArray.length).toBe(4);
        expect(patchee.simpleArray[1]).toBe('middle');
      });
    });

    describe("Operation: 'replace'", () => {
      test('replaces a simple property', () => {
        const patches = [{ op: 'replace', path: '/simpleString', value: 'hello' }];
        JSONPatch.apply(patchee, patches);
        expect(patchee.simpleString).toBe('hello');
      });

      test('replaces an object but keeping reference', () => {
        const oldProp = patchee.complexObject;
        const newProp = { anotherProp: true };
        const patches = [{ op: 'replace', path: '/complexObject', value: newProp }];
        JSONPatch.apply(patchee, patches);
        expect(patchee.complexObject).toEqual(newProp);
        expect(patchee.complexObject).toBe(oldProp);
      });

      test('replaces an array but keeping reference', () => {
        const oldProp = patchee.simpleArray;
        const newProp = [9, 8, 7];
        const patches = [{ op: 'replace', path: '/simpleArray', value: newProp }];
        JSONPatch.apply(patchee, patches);
        expect(patchee.simpleArray).toEqual(newProp);
        expect(patchee.simpleArray).toBe(oldProp);
      });

      test('replaces a item inside an array', () => {
        const patches = [{ op: 'replace', path: '/simpleArray/1', value: 5938 }];
        JSONPatch.apply(patchee, patches);
        expect(patchee.simpleArray.length).toBe(3);
        expect(patchee.simpleArray[1]).toBe(5938);
      });
    });

    describe("Operation: 'remove'", () => {
      test('removes a simple property', () => {
        const patches = [{ op: 'remove', path: '/simpleString' }];
        JSONPatch.apply(patchee, patches);
        expect(hasOwn.call(patchee, 'simpleString')).toBe(false);
      });

      test('removes a nested property', () => {
        const patches = [{ op: 'remove', path: '/complexObject/title' }];
        JSONPatch.apply(patchee, patches);
        expect(hasOwn.call(patchee.complexObject, 'title')).toBe(false);
      });

      test('removes a item in an array', () => {
        const patches = [{ op: 'remove', path: '/simpleArray/1' }];
        const shouldEqual = [392, false];
        JSONPatch.apply(patchee, patches);
        expect(patchee.simpleArray).toEqual(shouldEqual);
      });
    });
  });
});
