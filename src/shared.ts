export interface Tag<T extends string = string> {
  type: T | "text";
  value: string;
  length: number;
}
