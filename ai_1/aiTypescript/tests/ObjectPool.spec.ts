import ObjectPool from "src/ObjectPool"
import Assignable from "src/Assignable"
import Sinon from "sinon"

class TestAssignable implements Assignable<TestAssignable> {
  constructor(public value: number) { }

  assignFrom(other: TestAssignable): TestAssignable {
    this.value = other.value
    return this
  }
}

class ObjectPoolTest extends ObjectPool<TestAssignable> {
  constructor(create: () => TestAssignable, capacity: number = 10) {
    super(create, capacity)
  }

  getPool() : TestAssignable[] {
    return this.pool
  }
}


describe('ObjectPool', () => {
  let objectPool: ObjectPoolTest

  beforeEach(() => {
    objectPool = new ObjectPoolTest(() => new TestAssignable(0))
  });

  it('constructor', () => {
    let assignIndex = 0;
    const stub = Sinon.stub().callsFake(() => new TestAssignable(assignIndex++))

    objectPool = new ObjectPoolTest(stub, 5)
    expect(objectPool).toBeDefined()
    
    expect(objectPool.getPool().length).toBe(5)
    expect(stub.callCount).toBe(5)

    expect(objectPool.getPool().map(obj => obj.value)).toEqual([0, 1, 2, 3, 4])
  })

  it('get', () => {
    const obj = objectPool.get(new TestAssignable(1))
    expect(obj.value).toBe(1)
    expect(objectPool.getPool().length).toBe(9)

    const obj2 = objectPool.get(new TestAssignable(2))
    expect(obj2.value).toBe(2)
    expect(objectPool.getPool().length).toBe(8)
  })
})