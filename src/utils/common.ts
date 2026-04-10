export const numberEnumtoArray = (numberEnum: object) => {
  return Object.values(numberEnum).filter((value): value is number => typeof value === 'number')
}
