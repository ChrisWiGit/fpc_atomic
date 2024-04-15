import Tree, { ArrayTree } from "src/SearchBeam/Tree"

describe('Tree<T>', () => {
  let treeStart: Tree<number>

  beforeEach(() => {
    treeStart = new Tree(0)
  })

  it('addChild', () => {
    const child = treeStart.addChild(1)

    expect(child.value).toBe(1)
    expect(treeStart.children.length).toBe(1)    
  })

  it('addChildren simple', () => {
    const children = treeStart.addChildren([1, 2, 3])

    expect(children.length).toBe(2)
    expect(children[0].value).toBe(2)
    expect(children[1].value).toBe(3)
  })
 
  it('addChildren recursive', () => {
    const arr = [1, [2, [3]]]
    const ss : ArrayTree<number> = arr
    const children = treeStart.addChildren(ss)

    expect(children.length).toBe(1)
    expect(treeStart.children.length).toBe(1)
    expect(treeStart.children[0].children.length).toBe(1)
    expect(treeStart.children[0].children[0].children.length).toBe(1)

    expect(treeStart.children[0].value).toBe(1)
    expect(treeStart.children[0].children[0].value).toBe(2)
    expect(treeStart.children[0].children[0].children[0].value).toBe(3)
  })

  it('traverse', () => {
    treeStart.addChildren([1, 2, 3])

    let sum = 0
    treeStart.traverse(value => sum += value)

    expect(sum).toBe(6)
  })


  it('flattenTreeByPredicate', () => {
    treeStart.addChildren([1, 2, [1, 2]])

    const result = treeStart.flattenTreeByPredicate(value => value === 2)

    expect(result).toEqual([2, 2])
  })

  it('addTreeFromArray', () => {
    const tree = treeStart.addTreeFromArray([1, [2, 3], 4])

    expect(tree.value).toBe(1)
    expect(tree.children.length).toBe(2)
    expect(tree.children[0].value).toBe(2)
    expect(tree.children[1].value).toBe(4)
    expect(tree.children[0].children[0].value).toBe(3)
  })
  
  it('addTreeFromArray not Array', () => {
    const tree = treeStart.addTreeFromArray(0)

    expect(tree.value).toBe(0)
  })
  
  it('addTreeFromArray empty array', () => {
    expect(() => treeStart.addTreeFromArray([])).toThrow('Array must have at least one element')
  })
  it('addTreeFromArray first is Array', () => {
    expect(() => treeStart.addTreeFromArray([[]])).toThrow('First element of array must not be an array')
  })

  it('enumerateLeafs', () => {
    treeStart.addChildren([1, [3, [4]], [5, 6]])
    /*
            1
          /   \
         3     5
        /     /
        4     6
    */

    const result = treeStart.enumerateLeafs()

    expect(result).not.toBeNull()
    expect(result.length).toBe(2)

    expect(result.map(leaf => leaf.value)).toEqual([4, 6])
  })

})

