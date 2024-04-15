import Assignable from "./Assignable"
import Cloneable from "./Cloneable"

/**
 * Object Pool
 * Wird verwendet, um eine Menge von Objekten zu speichern und wiederzuverwenden.
 * Das spart Zeit, die für die Erstellung von Objekten benötigt wird.
 * Es werden immer eine gewissen Anzahl von Objekten vorgehalten.
 */
export default class ObjectPool<T extends Assignable<T>> {
  protected pool: T[] = []
  protected create: () => T
  protected capacity: number

  constructor(create: () => T, capacity: number = 10) {
    this.create = create
    this.capacity = capacity
    this.fillCapacity(capacity)
  }

  private fillCapacity(capacity: number) {
    for (let i = 0; i < capacity; i++) {
      this.pool.push(this.create())
    }
  }

  get(assignee: T): T {
    if (this.pool.length > 0) {
      return (this.pool.pop() as T).assignFrom(assignee)
    }
    this.fillCapacity(this.capacity)
    
    return this.get(assignee)
  }

  put(obj: T) {
    this.pool.push(obj)
  } 
}