/**
 * Interface for objects that can be cloned.
 */
export default interface Cloneable<T> {
    clone(): T
}