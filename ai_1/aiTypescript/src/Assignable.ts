export default interface Assignable<T> {
  /**
   * Assigns a value to this object.
   * @returns this object
   */
  assignFrom(value: T): T;
}