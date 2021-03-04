import 'reflect-metadata'
import { AbstractTreeNode } from '../src/annotations/interfaces/AbstractTreeNode'
import { RdfBean } from '../src/annotations/RdfBean'
import { RdfPrefixes } from '../src/annotations/RdfPrefixes'
import { RdfProperty } from '../src/annotations/RdfProperty'
import { RdfSubject } from '../src/annotations/RdfSubject'
import { XSDDataType } from '../src/annotations/XSDDataType'
import { RdfMapper } from '../src/RdfMapper'
import { PersonWithConstructor } from './models/constructorModel'
import { User } from './models/litralSerializer'
import {
  Addr, Calendar, Days, Month, MonthWithIRI, Per, PersonHasFriend, PersonMultipleDataTypes, SampleTreeNode, SuperBase
} from './models/models'
import { Address } from './models/oneToOneModels'
import { Recipe, Video } from './models/recipes'
import { RdfIngredient, RdfRecipe } from './models/recipesManyToMany'
import { Recipe1, Video1 } from './models/serializeIsIRI'
import { UserJsonObject } from './models/serializeJsonObj'

const shouldLogResult = false

function logResult(assertName: string, result: any, logOnlyMe = false) {
  if (shouldLogResult || logOnlyMe) {
    console.log(`Expectation: ${assertName}`)
    console.log(`Result:\n${result}`)
  }
}

describe('Testing basic serialization functions', () => {
  it('Should serialize basic types', () => {
    const p = new PersonMultipleDataTypes()
    p.uuid = '123345dfx'
    p.name = 'Anton'
    p.englishName = 'Antony'
    p.gender = 'M'
    p.age = 32
    p.isAdult = true
    p.isChild = false
    p.weight = 95.5
    p.height = 198.5
    p.buoyancy = 53.2

    const b = RdfMapper.serialize(p)
    expect(b).toContain(`person:123345dfx a foaf:Person;`)
    expect(b).toContain(`person:name "Anton"^^xsd:string, "Antony"@en;`)
    expect(b).toContain(`person:gender "M"^^xsd:string;`)
    expect(b).toContain(`person:age "32"^^xsd:int;`)
    expect(b).toContain(`person:isAdult "true"^^xsd:boolean;`)
    expect(b).toContain(`person:isChild "false"^^xsd:boolean;`)
    expect(b).toContain(`person:weight "95.5"^^xsd:double;`)
    expect(b).toContain(`person:height "198.5"^^xsd:long;`)
    expect(b).toContain(`person:buoyancy "53.2"^^xsd:float.`)

    logResult('Should serialize basic types', b)
  })

  it('Should serialize basic types, change property values', () => {
    const p = new PersonMultipleDataTypes()
    p.gender = 'M'
    p.uuid = '123345dfx'
    p.name = 'Anton'
    p.name = 'Ant'
    p.name = 'John'

    const r = RdfMapper.serialize(p)
    expect(r).toContain(`person:123345dfx a foaf:Person;`)
    expect(r).toContain(`person:name "John"`)
    expect(r).toContain(`person:gender "M"^^xsd:string;`)

    logResult('Should serialize basic types, change property values', r)
  })

  it('Serialize one to one relationship', () => {
    @RdfPrefixes({
      foaf: 'http://xmlns.com/foaf/0.1/',
      person: 'http://example.com/Person/',
      address: 'http://xmlns.com/foaf/0.1/address/'
    }) @RdfBean('foaf:Address')
    class Address1 {
      @RdfSubject('address') public uuid: string

      @RdfProperty({predicate: 'address:streetName', xsdType: XSDDataType.XSD_STRING}) public streetName: string

    }

    @RdfPrefixes({
      foaf: 'http://xmlns.com/foaf/0.1/', person: 'http://example.com/Person/'
    }) @RdfBean('foaf:Person')
    class Person1 {
      @RdfSubject('person') public uuid: string

      @RdfProperty({predicate: 'person:name', xsdType: XSDDataType.XSD_STRING}) public name: string

      @RdfProperty({predicate: 'person:hasAddress', clazz: Address}) public address: Address1
    }

    const a = new Address1()
    a.uuid = 'address-uuid'
    a.streetName = 'Jasmine'

    const p = new Person1()
    p.uuid = 'person-uuid'
    p.name = 'John'
    p.address = a

    const r = RdfMapper.serialize(p)
    expect(r).toContain(`person:person-uuid a foaf:Person;`)
    expect(r).toContain(`person:name "John"^^xsd:string;`)
    expect(r).toContain(`person:hasAddress address:address-uuid.`)
    expect(r).toContain(`address:address-uuid a foaf:Address;`)
    expect(r).toContain(`address:streetName "Jasmine"^^xsd:string.`)

    logResult('Serialize one to one relationship', r)
  })

  it('Serialize person has friend person', () => {
    const antonPerson: PersonHasFriend = new PersonHasFriend()
    antonPerson.uuid = 'Anton'
    antonPerson.name = 'Anton S'

    const johnDoePerson: PersonHasFriend = new PersonHasFriend()
    johnDoePerson.uuid = 'John'
    johnDoePerson.name = 'John Doe'
    antonPerson.knows = johnDoePerson

    const r = RdfMapper.serialize(antonPerson)
    expect(r).toContain(`person:John a foaf:Person;`)
    expect(r).toContain(`foaf:knows person:Anton;`)
    expect(r).toContain(`foaf:name "John Doe"^^xsd:string.`)
    expect(r).toContain(`person:Anton a foaf:Person;`)
    expect(r).toContain(`foaf:name "Anton S"^^xsd:string;`)
    expect(r).toContain(`foaf:knows person:John.`)

    logResult('Serialize person has friend person', r)
  })

  it('Serialize one to many relationship', () => {
    const a1 = new Addr()
    a1.uuid = 'uuid1'
    a1.houseNum = 10
    a1.streetName = 'Jasmine'

    const a2 = new Addr()
    a2.uuid = 'uuid2'
    a2.houseNum = 223
    a2.streetName = 'Joseph'

    const p = new Per()
    p.uuid = 'person-uuid'
    p.addresses = [a1, a2]

    const r = RdfMapper.serialize(p)
    // console.log(b);
    expect(r).toContain(`person:person-uuid a foaf:Person;`)
    expect(r).toContain(`address:uuid2 a foaf:Address;`)
    expect(r).toContain(`address:uuid1 a foaf:Address;`)

    expect(r).toContain(`person:hasAddress address:uuid1, address:uuid2.`)

    expect(r).toContain(`address:houseNum "223"^^xsd:string`)
    expect(r).toContain(`address:streetName "Joseph"^^xsd:string`)

    expect(r).toContain(`address:houseNum "223"^^xsd:string`)
    expect(r).toContain(`address:streetName "Jasmine"^^xsd:string`)

    logResult('Serialize one to many relationship', r)

  })

  it('Serialize Recipe has many ingredients and inverseof', () => {
    const recipe: RdfRecipe = new RdfRecipe()
    recipe.recipeIdentifier = 'Lasagna'
    recipe.recipeName = 'Lasagna'

    const beefIngredient: RdfIngredient = new RdfIngredient()
    beefIngredient.ingredientIdentifier = 'beef'
    beefIngredient.ingredientName = 'Ground Beef'
    beefIngredient.quantity = 200
    beefIngredient.qualifier = 'grams'

    const spaghettiSauce: RdfIngredient = new RdfIngredient()
    spaghettiSauce.ingredientIdentifier = 'spag'
    spaghettiSauce.ingredientName = 'Spaghetti Sauce'
    spaghettiSauce.quantity = 800
    spaghettiSauce.qualifier = 'grams'

    recipe.ingredients = [beefIngredient, spaghettiSauce]

    const r = RdfMapper.serialize(recipe)

    logResult('Serialize Recipe has many ingredients and inverseof', r)
  })

  it('Serialize basic inheritance', () => {
    const sb = new SuperBase()
    sb.uuid = 'inheritance-uuid'
    sb.baseProp = 'baseValue'
    sb.extendedProp = 'extendedValue'

    const r = RdfMapper.serialize(sb)
    expect(r).toContain(`foaf:inheritance-uuid a foaf:SuperBase;`)
    expect(r).toContain(`foaf:baseProp "baseValue"^^xsd:string;`)
    expect(r).toContain(`foaf:extendedProp "extendedValue"^^xsd:string.`)

    logResult('Serialize basic inheritance', r)
  })

  it('Serialize Enums', () => {
    const cal = new Calendar()
    cal.uuid = 'cal-uuid'
    cal.day = Days.Mon

    const r = RdfMapper.serialize(cal)

    expect(r).toContain(`calendar:cal-uuid a foaf:Calendar;`)
    expect(r).toContain(`foaf:day "Mon"^^xsd:string.`)

    logResult('Serialize Enums', r)
  })

  it('Should serialize array of literals', () => {
    const month: Month = new Month()
    month.uuid = 'month-uuid'
    month.days = ['Mon', 'Tue', 'Wed']

    const r = RdfMapper.serialize(month)
    expect(r).toContain(`month:month-uuid a foaf:Month;`)
    expect(r).toContain(`foaf:day "Mon"^^xsd:string, "Tue"^^xsd:string, "Wed"^^xsd:string.`)

    logResult('Should serialize array of literals', r)
  })

  it('Should serialize array of IRIs', () => {
    const month: MonthWithIRI = new MonthWithIRI()
    month.uuid = 'monthWithIRIDays-uuid'
    month.days = ['http://example.com/Mon', 'http://example.com/Tue', 'http://example.com/Wed']

    const r = RdfMapper.serialize(month)
    expect(r).toContain(`month:monthWithIRIDays-uuid a foaf:Month;`)
    expect(r).toContain(`foaf:day <http://example.com/Mon>, <http://example.com/Tue>, <http://example.com/Wed>.`)
    logResult('Should serialize array of IRIs', r)
  })

  it('Serialize Array of objects', () => {
    const addr1: Address = new Address()
    addr1.uuid = 'addr1-uuid'
    addr1.streetName = 'Zigg'

    const addr2: Address = new Address()
    addr2.uuid = 'addr2-uuid'
    addr2.streetName = 'St Clair'

    const r = RdfMapper.serialize([addr1, addr2])
    expect(r).toContain(`address:addr2-uuid a foaf:Address;`)
    expect(r).toContain(`address:streetName "St Clair"^^xsd:string.`)
    expect(r).toContain(`address:addr1-uuid a foaf:Address;`)
    expect(r).toContain(`address:streetName "Zigg"^^xsd:string.`)

    logResult('Serialize Array of objects', r)
  })

  it('Serialize literal with customs serializer', () => {
    const u: User = new User()
    u.uuid = 'anton'
    u.regDate = new Date().getTime()
    u.birthDate = new Date(Date.UTC(1995, 11, 17, 8, 24, 0))

    const r = RdfMapper.serialize(u)
    expect(r).toContain(`user:anton a foaf:User;`)
    expect(r).toContain(`user:birthday "1995-12-17T08:24:00.000Z"^^xsd:dateTime.`)
    expect(r).toContain(`user:registrationDate "${new Date(u.regDate).toISOString()}"^^xsd:dateTime;`)
    logResult('Serialize literal with customs serializer', r)
  })

  it('Should serialize into a blank node', () => {
    const recipe: Recipe = new Recipe()
    recipe.recipeName = 'Cheesecake'

    const video: Video = new Video()
    video.name = 'Japanese Cheesecake instructions'
    recipe.video = video
    const r = RdfMapper.serialize(recipe)
    expect(r).toContain(`schema:name "Japanese Cheesecake instructions"^^xsd:string.`)
    expect(r).toContain(`a schema:Recipe;`)
    expect(r).toContain(`schema:recipeName "Cheesecake"^^xsd:string;`)
    logResult('Should serialize into a blank node', r)
  })

  it('Serialize into blank node with isIRI', () => {
    const recipe: Recipe1 = new Recipe1()
    recipe.recipeName = 'Cheesecake'
    const video: Video1 = new Video1()
    video.url = 'http://example.com/Video1'
    recipe.video = video
    const r = RdfMapper.serialize(recipe)
    expect(r).toContain(`schema:videoURL <http://example.com/Video1>.`)
    expect(r).toContain(`a schema:Recipe;`)
    expect(r).toContain(`schema:recipeName "Cheesecake"^^xsd:string;`)
    expect(r).toContain(`schema:video`)
    logResult('Serialize into blank node with isIRI', r)
  })

  it('Serialize json with dynamic serializer', () => {
    const u: UserJsonObject = new UserJsonObject()
    u.name = 'Anton'
    u.address = {streetName: 'St Clair', streetNumber: 223, isRegistered: true}
    const r = RdfMapper.serialize(u)
    expect(r).toContain(`user:Anton a foaf:User;`)
    expect(r).toContain(`user:address`)
    expect(r).toContain(`a address:1234;`)
    expect(r).toContain(`address:streetName "St Clair"^^xsd:string;`)
    expect(r).toContain(`address:streetNumber "223"^^xsd:integer;`)
    expect(r).toContain(`address:isRegistered "true"^^xsd:boolean.`)
    logResult('Serialize json with dynamic serializer', r)
  })

  it('Serialize recursive tree into blank nodes', () => {
    const topNode: SampleTreeNode = new SampleTreeNode()
    topNode.uuid = 'topNode'
    topNode.isRoot = true
    topNode.index = 0
    topNode.label = 'Top Parent'

    const subNodeOne: SampleTreeNode = new SampleTreeNode()
    subNodeOne.index = 0
    subNodeOne.label = 'Sub Node 1'

    const subNodeTwo: SampleTreeNode = new SampleTreeNode()
    subNodeTwo.index = 1
    subNodeTwo.label = 'Sub Node 2'

    const subNodeThree: SampleTreeNode = new SampleTreeNode()
    subNodeThree.index = 2
    subNodeThree.label = 'Sub Node 3'

    const subNodeThreeOne: SampleTreeNode = new SampleTreeNode()
    subNodeThreeOne.index = 0
    subNodeThreeOne.label = 'Sub Node 3.1'
    subNodeThree.children = [subNodeThreeOne]

    // topNode.children = [subNodeOne, subNodeTwo, subNodeThree];
    topNode._children = [subNodeOne, subNodeTwo, subNodeThree]

    const r = RdfMapper.serialize(topNode)
    const deserializedNode: SampleTreeNode = RdfMapper.deserializeTree(SampleTreeNode, r)
    expect(deserializedNode instanceof SampleTreeNode).toBeTruthy()
    expect(deserializedNode instanceof AbstractTreeNode).toBeTruthy()
    expect(deserializedNode.children.length).toBe(3)
    expect(deserializedNode.label).toEqual('Top Parent')
    expect(deserializedNode.index).toEqual(0)
    expect(deserializedNode.children[0].label).toEqual('Sub Node 1')
    expect(deserializedNode.children[1].label).toEqual('Sub Node 2')
    expect(deserializedNode.children[2].label).toEqual('Sub Node 3')
    expect(deserializedNode.children[2].children.length).toBe(1)
    expect(deserializedNode.children[2].children[0].label).toEqual('Sub Node 3.1')
    logResult('Serialize recursive tree into blank nodes', r)
  })

  // it('serialize model with constructor', () => {
  //   const person = new PersonWithConstructor('Andries', 'andries', 'the great');
  //   const r = RdfMapper.serialize(person);
  //
  //   expect(r).toContain(`person:Andries a foaf:Person;`)
  //   expect(r).toContain(`person:firstName "andries"^^xsd:string;`)
  //   expect(r).toContain(`person:name "the great"^^xsd:string;`)
  // })

})
