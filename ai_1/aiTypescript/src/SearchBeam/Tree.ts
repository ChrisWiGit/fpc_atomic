export type ArrayTree<T> = T | Array<ArrayTree<T>>

export default class Tree<T> {
  value: T
  children: Tree<T>[]
  typeName: string
  leafs: T[] = []

  constructor(value: T) {
    this.value = value
    this.children = []
    this.typeName = typeof value
  }

  /**
   * Fügt ein Kind zum Baum hinzu
   * @param value 
   * @returns Liefer das Kind vom Typ Tree<T> zurück
   */
  addChild(value: T): Tree<T> {
    if (typeof value !== this.typeName) {
      throw new Error('Array element must be of type T')
    }

    const child = new Tree(value)
    
    this.children.push(child)
    this.leafs.push(value)

    return child
  }

  /**
   * Fügt mehrere Kinder zum Baum hinzu
   * @param values 
   * @returns Liefert ein Array von Kindern vom Typ Tree<T> zurück
   */
  addChildren(values: ArrayTree<T>): Tree<T>[] {
    return this.addTreeFromArray(values).children
  }


  /**
   * Konvertiert eine verschachtelte Array-Struktur in einen Baum.
   * @param {T[]} array Ein Array, das in einen Baum umgewandelt werden soll.
   * Der Array-Index 0 wird als Wurzel des Baums verwendet. Die restlichen
   * Elemente des Arrays werden als Kinder der Wurzel betrachtet.
   * Wenn ein Element des Arrays ein Array ist, wird es als Kind des
   * entsprechenden Elements des Baums betrachtet.
   * @returns {Tree} Der Baum, der aus dem Array erstellt wurde.
   */
  addTreeFromArray(array: ArrayTree<T>): Tree<T> {
    const tree = this.addTreeFromArrayInternal(array)
    this.children.push(tree)
    return tree
  }

  private addTreeFromArrayInternal(array: ArrayTree<T>): Tree<T> {
    /*
    Beispiele:
     [1] 
     [1, [2, 3], 4]
     [1, [2, [3, 4], 5], 6]
     [[1, 2], 3, 4] führt zu einem Fehler
    */
    if (!Array.isArray(array)) {
      return new Tree(array)
    }
    if (array.length === 0) {
      throw new Error('Array must have at least one element')
    };

    if (Array.isArray(array[0])) {
      throw new Error('First element of array must not be an array')
    }
    const tree = new Tree<T>(array[0] as T)

    for (let i = 1; i < array.length; i++) {
      if (Array.isArray(array[i])) {
        tree.children.push(this.addTreeFromArrayInternal(array[i] as ArrayTree<T>))
      } else {
        tree.addChild(array[i] as T)
      }
    }
    return tree
  }

  /**
   * Traversiert den Baum und führt eine Funktion für jeden Wert aus
   * @param callback Die Funktion, die für jeden Wert ausgeführt wird.
   */
  traverse(callback: (value: T) => void): void {
    callback(this.value)
    this.children.forEach(child => child.traverse(callback))
  }

  enumerateLeafs(): Tree<T>[] {
    let result: Tree<T>[] = []

    for (let child of this.children) {
      if (child.children.length === 0) {
        result.push(child)
      } else {
        result = result.concat(child.enumerateLeafs())
      }
    }

    return result
  }

  /**
   * Durchläuft alle Kinder und für das Kind, zu dem das
   * Prädikat true zurückgibt, werden dessen Kinder durchlaufen.
   * @param predicate 
   * @returns 
   */
  flattenTreeByPredicate(predicate: (value: T) => boolean): T[] {
    let result: T[] = []

    for (let child of this.children) {
      if (predicate(child.value)) {
        result.push(child.value)
      }
      result = result.concat(child.flattenTreeByPredicate(predicate))
    }

    return result
  }
}